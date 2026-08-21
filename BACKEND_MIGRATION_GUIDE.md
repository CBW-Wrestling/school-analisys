# Backend Migration Guide — Supabase → Kotlin + Spring Boot (MVP)

> Este documento é completo o suficiente para uma IA implementar o backend do zero.
> Preencha apenas a seção 0, o restante é especificação pronta.

---

## 0. Variáveis — Preencha Aqui

Todas as variáveis do projeto estão aqui. O backend as lê via variáveis de ambiente.

```
# Banco de dados (Supabase)
DB_HOST=db.SEU_PROJECT_REF.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_BANCO

# JWT
JWT_SECRET=SUA_STRING_BASE64_COM_NO_MINIMO_256_BITS

# CORS — origem do frontend
CORS_ORIGIN=http://localhost:5173
```

> Para gerar `JWT_SECRET`: `openssl rand -base64 32`

---

## Sumário

1. [Arquitetura MVP](#1-arquitetura-mvp)
2. [Supabase — Configuração Obrigatória de Banco](#2-supabase--configuração-obrigatória-de-banco)
3. [Stack e Dependências](#3-stack-e-dependências)
4. [Autenticação — Login e JWT](#4-autenticação--login-e-jwt)
5. [Headers Padrão](#5-headers-padrão)
6. [Endpoints — Contratos Completos](#6-endpoints--contratos-completos)
7. [Tratamento de Erros](#7-tratamento-de-erros)
8. [Adaptações no Frontend](#8-adaptações-no-frontend)
9. [Checklist de Migração](#9-checklist-de-migração)

---

## 1. Arquitetura MVP

### Diagrama de Fluxo

```
React (Vite)            Spring Boot (Kotlin)         PostgreSQL (Supabase)
────────────            ────────────────────         ────────────────────
Auth.tsx         ──►   POST /api/auth/login
                            │ valida senha
                            │ retorna JWT          ──►  SELECT app_users

ResultsPage      ──►   GET  /api/competitions     ──►  SELECT competitions
                        GET  /api/results          ──►  SELECT vw_competition_results

AthleteDetail    ──►   GET  /api/athletes/        ──►  get_athlete_detail()
                            entries/{id}

ProfilesPage     ──►   GET  /api/dashboard/       ──►  SELECT vw_profile_dashboard
                            profiles

PhysicalPage     ──►   GET  /api/dashboard/       ──►  SELECT vw_physical_dashboard
                            physical

MotorPage        ──►   GET  /api/dashboard/       ──►  SELECT vw_motor_dashboard
                            motor

ExplorerPage     ──►   (reutiliza competitions
                         + profiles + motor)

AssessmentWizard ──►   GET  /api/competitions/    ──►  get_competition_athletes()
                            {code}/athletes
                        POST /api/assessments     ──►  submit_assessment()
```

### Decisão de Arquitetura: Controller → JdbcTemplate direto

Sem camada de Service. A lógica de negócio vive nas funções SQL existentes. O backend é um adaptador HTTP → SQL.

```
JWT Filter  →  Controller  →  JdbcTemplate  →  PostgreSQL
```

### Estrutura de Pacotes

```
src/main/kotlin/br/cbw/analytics/
├── CbwAnalyticsApplication.kt
├── config/
│   ├── SecurityConfig.kt          # FilterChain + CORS + JWT filter inline
│   ├── JwtProvider.kt             # gera e valida tokens
│   └── GlobalExceptionHandler.kt  # @RestControllerAdvice global
├── auth/
│   └── AuthController.kt          # POST /api/auth/login
└── api/
    ├── CompetitionController.kt   # GET /api/competitions
    │                              # GET /api/competitions/{code}/athletes
    ├── ResultsController.kt       # GET /api/results
    ├── AthleteController.kt       # GET /api/athletes/entries/{id}
    ├── DashboardController.kt     # GET /api/dashboard/profiles|physical|motor
    └── AssessmentController.kt    # POST /api/assessments
```

### `CbwAnalyticsApplication.kt`

```kotlin
package br.cbw.analytics

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CbwAnalyticsApplication

fun main(args: Array<String>) { runApplication<CbwAnalyticsApplication>(*args) }
```

---

## 2. Supabase — Configuração Obrigatória de Banco

### 2.1 Conexão JDBC

Use a **conexão direta** (porta 5432), não o transaction pooler (porta 6543). O transaction pooler do Supabase não suporta prepared statements, que o Spring usa por padrão.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 5
      connection-timeout: 30000
      connection-init-sql: SET search_path = public
```

> `sslmode=require` é **obrigatório** para Supabase. Sem ele a conexão é recusada.
> `SET search_path = public` garante que as views e funções sejam encontradas.

### 2.2 RLS — Row Level Security

As views `vw_*` **não têm** `SECURITY DEFINER`, então respeitam RLS. Quando o JDBC conecta como `postgres` (superuser), RLS é bypassado automaticamente — isso é o comportamento correto para o MVP, pois a autorização é feita no Spring Security.

Se usar um usuário não-superuser, adicione ao `connection-init-sql`:

```sql
SET search_path = public;
SET row_security = off;  -- apenas se não for superuser
```

### 2.3 GRANT nas Funções SQL — Atualização Necessária

Os grants atuais referenciam roles do Supabase GoTrue (`authenticated`, `anon`) que não existem no contexto JDBC. Execute no Supabase SQL Editor:

```sql
-- Permitir que o usuário JDBC execute as funções
GRANT EXECUTE ON FUNCTION get_athlete_detail(uuid)          TO postgres;
GRANT EXECUTE ON FUNCTION get_competition_athletes(text)    TO postgres;
GRANT EXECUTE ON FUNCTION submit_assessment(jsonb)          TO postgres;
```

Se usar usuário customizado no JDBC, substitua `postgres` pelo nome desse usuário.

### 2.4 Remover `auth.role()` das Funções SQL

`auth.role()` é função interna do Supabase GoTrue. Chamada via JDBC direto lança:
`ERROR: function auth.role() does not exist`

Execute os três arquivos SQL atualizados abaixo no Supabase SQL Editor:

**`get_athlete_detail` — remover guard:**
```sql
-- Substituir o bloco begin...end da função
-- REMOVER estas linhas:
--   if auth.role() = 'anon' then
--     raise exception 'Não autorizado';
--   end if;
-- O Spring Security já garante que só tokens válidos chegam aqui.
```

Fazer o mesmo em `get_competition_athletes` e `submit_assessment`.

### 2.5 Tabela de Usuários

Os usuários não são mais gerenciados pelo Supabase Auth. Criar tabela própria:

```sql
CREATE TABLE app_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,   -- bcrypt hash, nunca texto puro
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir primeiro usuário admin (gerar o hash via bcrypt antes)
-- Exemplo de hash para "admin123" com custo 12:
INSERT INTO app_users (email, password)
VALUES ('admin@cbw.com', '$2a$12$HASH_GERADO_AQUI');
```

Para gerar o hash bcrypt, use: https://bcrypt-generator.com (cost 12)

---

## 3. Stack e Dependências

### `build.gradle.kts`

```kotlin
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.3.4"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "br.cbw"
version = "1.0.0"

java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.postgresql:postgresql")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

kotlin { compilerOptions { freeCompilerArgs.addAll("-Xjsr305=strict") } }
```

### Imports necessários nos arquivos Kotlin

Cole no topo de cada arquivo conforme o contexto:

```kotlin
// JWT (JwtProvider.kt)
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import io.jsonwebtoken.io.Decoders

// Spring Security (SecurityConfig.kt)
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.OncePerRequestFilter
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

// Controllers
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import org.springframework.beans.factory.annotation.Value
import com.fasterxml.jackson.databind.ObjectMapper
import java.sql.ResultSet
import java.util.UUID
import java.util.Date

// Tratamento de erros
import org.springframework.dao.DataAccessException
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.jdbc.BadSqlGrammarException
```

### `application.yml` completo

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 5
      connection-timeout: 30000
      connection-init-sql: SET search_path = public

server:
  port: 8080

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: 86400000
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
```

---

## 4. Autenticação — Login e JWT

### `config/JwtProvider.kt`

```kotlin
@Component
class JwtProvider(
    @Value("\${app.jwt.secret}")         private val secret: String,
    @Value("\${app.jwt.expiration-ms}")  private val expiresMs: Long,
) {
    private val key by lazy { Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)) }

    fun generate(email: String): String = Jwts.builder()
        .subject(email)
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expiresMs))
        .signWith(key)
        .compact()

    fun isValid(token: String) = runCatching {
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
        true
    }.getOrDefault(false)

    fun emailOf(token: String): String =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload.subject
}
```

### `config/SecurityConfig.kt`

```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwt: JwtProvider,
    @Value("\${app.cors.allowed-origin}") private val origin: String,
) {
    @Bean fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain = http
        .csrf { it.disable() }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .cors { it.configurationSource(corsSource()) }
        .authorizeHttpRequests {
            it.requestMatchers("/api/auth/login").permitAll()
            it.anyRequest().authenticated()
        }
        .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter::class.java)
        .build()

    private fun jwtFilter() = object : OncePerRequestFilter() {
        override fun doFilterInternal(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
            val token = req.getHeader("Authorization")?.removePrefix("Bearer ")?.trim()
            if (token != null && jwt.isValid(token)) {
                val auth = UsernamePasswordAuthenticationToken(jwt.emailOf(token), null, emptyList())
                SecurityContextHolder.getContext().authentication = auth
            }
            chain.doFilter(req, res)
        }
    }

    private fun corsSource() = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/api/**", CorsConfiguration().apply {
            allowedOrigins  = listOf(origin)
            allowedMethods  = listOf("GET", "POST", "OPTIONS")
            allowedHeaders  = listOf("Authorization", "Content-Type")
        })
    }
}
```

### `auth/AuthController.kt`

```kotlin
@RestController
class AuthController(
    private val jdbc: JdbcTemplate,
    private val encoder: PasswordEncoder,
    private val jwt: JwtProvider,
) {
    data class LoginRequest(val email: String, val password: String)

    @PostMapping("/api/auth/login")
    fun login(@RequestBody body: LoginRequest): ResponseEntity<Any> {
        val hash = runCatching {
            jdbc.queryForObject(
                "SELECT password FROM app_users WHERE email = ?",
                String::class.java, body.email
            )
        }.getOrNull()

        if (hash == null || !encoder.matches(body.password, hash))
            return ResponseEntity.status(401).body(
                mapOf("error" to "INVALID_CREDENTIALS", "message" to "Email ou senha incorretos.")
            )

        return ResponseEntity.ok(mapOf("token" to jwt.generate(body.email), "expiresIn" to 86400000))
    }
}
```

---

## 5. Headers Padrão

| Header | Valor | Obrigatório em |
|---|---|---|
| `Authorization` | `Bearer <JWT>` | Todos exceto `/api/auth/login` |
| `Content-Type` | `application/json` | POST |

---

## 6. Endpoints — Contratos Completos

Mapa de cobertura: todos os 9 endpoints cobrem todas as 8 telas.
`DashboardPage` e `CollectionHome` são estáticas — sem chamadas de API.

| # | Método | Rota | Tela(s) |
|---|---|---|---|
| 1 | POST | `/api/auth/login` | Auth.tsx |
| 2 | GET | `/api/competitions` | ResultsPage, ExplorerPage, AssessmentWizard |
| 3 | GET | `/api/results?competitionId={uuid}` | ResultsPage |
| 4 | GET | `/api/athletes/entries/{entryId}` | AthleteDetailPage |
| 5 | GET | `/api/competitions/{code}/athletes` | AssessmentWizard |
| 6 | GET | `/api/dashboard/profiles` | ProfilesPage, ExplorerPage |
| 7 | GET | `/api/dashboard/physical` | PhysicalPage |
| 8 | GET | `/api/dashboard/motor` | MotorPage, ExplorerPage |
| 9 | POST | `/api/assessments` | CollectionPage (3 formulários) |

---

### Endpoint 2 — `GET /api/competitions`

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "code": "25_jejs",
    "name": "JEJS",
    "year": 2025,
    "fromArena": false,
    "athletes": 120,
    "entries": 134,
    "results": 134,
    "ageCategories": 4,
    "styles": 3,
    "states": 12
  }
]
```

**DTO:**
```kotlin
data class CompetitionDto(
    val id: UUID,
    val code: String,
    val name: String,
    val year: Int?,
    val fromArena: Boolean,
    val athletes: Int,
    val entries: Int,
    val results: Int,
    val ageCategories: Int,
    val styles: Int,
    val states: Int,
)
```

**SQL:** `SELECT id, code, name, year, from_arena, athletes, entries, results, age_categories, styles, states FROM competitions ORDER BY year DESC`

**Controller completo (`api/CompetitionController.kt`):**
```kotlin
@RestController
class CompetitionController(private val jdbc: JdbcTemplate) {

    @GetMapping("/api/competitions")
    fun list(): List<CompetitionDto> =
        jdbc.query(
            "SELECT id, code, name, year, from_arena, athletes, entries, results, age_categories, styles, states FROM competitions ORDER BY year DESC"
        ) { rs, _ ->
            CompetitionDto(
                id            = UUID.fromString(rs.getString("id")),
                code          = rs.getString("code"),
                name          = rs.getString("name"),
                year          = rs.getObject("year") as? Int,
                fromArena     = rs.getBoolean("from_arena"),
                athletes      = rs.getInt("athletes"),
                entries       = rs.getInt("entries"),
                results       = rs.getInt("results"),
                ageCategories = rs.getInt("age_categories"),
                styles        = rs.getInt("styles"),
                states        = rs.getInt("states"),
            )
        }

    @GetMapping("/api/competitions/{code}/athletes")
    fun athletes(@PathVariable code: String): List<CompetitionAthleteDto> =
        jdbc.query("SELECT * FROM get_competition_athletes(?)", { rs, _ ->
            CompetitionAthleteDto(
                entryId         = UUID.fromString(rs.getString("entry_id")),
                athleteName     = rs.getString("athlete_name"),
                style           = rs.getString("style"),
                weight          = rs.getDouble("weight"),
                state           = rs.getString("state"),
                gender          = rs.getString("gender"),
                ageCategoryCode = rs.getString("age_category_code"),
                competitionCode = rs.getString("competition_code"),
                competitionName = rs.getString("competition_name"),
            )
        }, code)
}
```

---

### Endpoint 3 — `GET /api/results?competitionId={uuid}`

**Query param obrigatório:** `competitionId` (UUID)

**Response `200 OK`:**
```json
[
  {
    "entryId": "uuid",
    "fullName": "João Silva",
    "teamAlternateName": "SP",
    "weightCategoryShortName": "65kg",
    "rank": 1,
    "wins": 3,
    "losses": 0,
    "technicalPointsFor": 12,
    "technicalPointsDiff": 8,
    "countFights": 3,
    "isNotRanked": false
  }
]
```

**DTO:**
```kotlin
data class ResultRowDto(
    val entryId: UUID,
    val fullName: String,
    val teamAlternateName: String,
    val weightCategoryShortName: String,
    val rank: Int?,
    val wins: Int?,
    val losses: Int?,
    val technicalPointsFor: Int?,
    val technicalPointsDiff: Int?,
    val countFights: Int?,
    val isNotRanked: Boolean,
)
```

**SQL:**
```sql
SELECT entry_id, "fullName", "teamAlternateName", "weightCategoryShortName",
       rank, wins, losses, "technicalPointsFor", "technicalPointsDiff",
       "countFights", "isNotRanked"
FROM   vw_competition_results
WHERE  competition_id = ?::uuid
ORDER  BY rank NULLS LAST
```

**Controller completo (`api/ResultsController.kt`):**
```kotlin
@RestController
class ResultsController(private val jdbc: JdbcTemplate) {

    @GetMapping("/api/results")
    fun list(@RequestParam competitionId: UUID): List<ResultRowDto> =
        jdbc.query("""
            SELECT entry_id, "fullName", "teamAlternateName", "weightCategoryShortName",
                   rank, wins, losses, "technicalPointsFor", "technicalPointsDiff",
                   "countFights", "isNotRanked"
            FROM   vw_competition_results
            WHERE  competition_id = ?::uuid
            ORDER  BY rank NULLS LAST
        """.trimIndent(), { rs, _ ->
            ResultRowDto(
                entryId                 = UUID.fromString(rs.getString("entry_id")),
                fullName                = rs.getString("fullName"),
                teamAlternateName       = rs.getString("teamAlternateName"),
                weightCategoryShortName = rs.getString("weightCategoryShortName"),
                rank                   = rs.getObject("rank") as? Int,
                wins                   = rs.getObject("wins") as? Int,
                losses                 = rs.getObject("losses") as? Int,
                technicalPointsFor     = rs.getObject("technicalPointsFor") as? Int,
                technicalPointsDiff    = rs.getObject("technicalPointsDiff") as? Int,
                countFights            = rs.getObject("countFights") as? Int,
                isNotRanked            = rs.getBoolean("isNotRanked"),
            )
        }, competitionId.toString())
}
```

---

### Endpoint 4 — `GET /api/athletes/entries/{entryId}`

**Response `200 OK`:**
```json
{
  "athleteName": "João Silva",
  "birthDate": "2008-03-14",
  "school": "EE Dom Pedro II",
  "style": "FS",
  "weight": 65.0,
  "state": "SP",
  "gender": "M",
  "ageCategoryCode": "U17",
  "competitionCode": "25_jejs",
  "competitionName": "JEJS",
  "rank": 1,
  "wins": 3,
  "losses": 0,
  "technicalPointsFor": 12,
  "technicalPointsAgainst": 4,
  "technicalPointsDiff": 8,
  "countFights": 3,
  "isFinalistGold": true,
  "isNotRanked": false,
  "practiceTime": "1 a 2 anos",
  "practiceLocation": "Projeto social",
  "practiceLocationName": "AABB",
  "weeklyFrequency": "3 vezes",
  "practicesOtherSport": false,
  "otherSports": ["Judô"],
  "startedInWrestling": true,
  "armSpanCm": 172.5,
  "heightCm": 168.0,
  "handGripRight": 38.2,
  "handGripLeft": 36.8,
  "baseCm": 170.0,
  "forearmRightCm": 26.5,
  "forearmLeftCm": 26.0,
  "placement": 1,
  "motorData": [
    { "competency": "Acrobacias", "movement": "Rolo p/ frente", "result": "Completo" },
    { "competency": "Acrobacias", "movement": "Rolo p/ trás",   "result": "Incompleto" }
  ]
}
```

**Response `404 Not Found`:**
```json
{ "error": "NOT_FOUND", "message": "Entry não encontrada." }
```

**DTOs:**
```kotlin
data class MotorItemDto(
    val competency: String,
    val movement: String,
    val result: String,
)

data class AthleteDetailDto(
    val athleteName: String,
    val birthDate: String?,
    val school: String?,
    val style: String,
    val weight: Double,
    val state: String,
    val gender: String,
    val ageCategoryCode: String,
    val competitionCode: String,
    val competitionName: String,
    val rank: Int?,
    val wins: Int?,
    val losses: Int?,
    val technicalPointsFor: Int?,
    val technicalPointsAgainst: Int?,
    val technicalPointsDiff: Int?,
    val countFights: Int?,
    val isFinalistGold: Boolean?,
    val isNotRanked: Boolean?,
    val practiceTime: String?,
    val practiceLocation: String?,
    val practiceLocationName: String?,
    val weeklyFrequency: String?,
    val practicesOtherSport: Boolean?,
    val otherSports: List<String>?,
    val startedInWrestling: Boolean?,
    val armSpanCm: Double?,
    val heightCm: Double?,
    val handGripRight: Double?,
    val handGripLeft: Double?,
    val baseCm: Double?,
    val forearmRightCm: Double?,
    val forearmLeftCm: Double?,
    val placement: Int?,
    val motorData: List<MotorItemDto>?,
)
```

**SQL:** `SELECT * FROM get_athlete_detail(?::uuid)`

**Controller completo (`api/AthleteController.kt`):**
```kotlin
@RestController
class AthleteController(private val jdbc: JdbcTemplate, private val objectMapper: ObjectMapper) {

    @GetMapping("/api/athletes/entries/{entryId}")
    fun getDetail(@PathVariable entryId: UUID): AthleteDetailDto {
        val rows = jdbc.query(
            "SELECT * FROM get_athlete_detail(?::uuid)",
            { rs, _ -> mapAthleteDetail(rs) },
            entryId.toString()
        )
        return rows.firstOrNull()
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Entry não encontrada.")
    }

    private fun mapAthleteDetail(rs: ResultSet): AthleteDetailDto {
    // other_sports é um array PostgreSQL — cast para Array e converta
    val otherSportsArray = rs.getArray("other_sports")
    val otherSports = if (otherSportsArray != null)
        (otherSportsArray.array as Array<*>).map { it.toString() }
    else null

    // motor_data é jsonb — vem como String, deserializar com ObjectMapper
    val motorDataJson = rs.getString("motor_data")
    val motorData = if (motorDataJson != null)
        objectMapper.readValue(motorDataJson, Array<MotorItemDto>::class.java).toList()
    else null

    return AthleteDetailDto(
        athleteName          = rs.getString("athlete_name"),
        birthDate            = rs.getDate("birth_date")?.toLocalDate()?.toString(),
        school               = rs.getString("school"),
        style                = rs.getString("style"),
        weight               = rs.getDouble("weight"),
        state                = rs.getString("state"),
        gender               = rs.getString("gender"),
        ageCategoryCode      = rs.getString("age_category_code"),
        competitionCode      = rs.getString("competition_code"),
        competitionName      = rs.getString("competition_name"),
        rank                 = rs.getObject("rank") as? Int,
        wins                 = rs.getObject("wins") as? Int,
        losses               = rs.getObject("losses") as? Int,
        technicalPointsFor   = rs.getObject("technical_points_for") as? Int,
        technicalPointsAgainst = rs.getObject("technical_points_against") as? Int,
        technicalPointsDiff  = rs.getObject("technical_points_diff") as? Int,
        countFights          = rs.getObject("count_fights") as? Int,
        isFinalistGold       = rs.getObject("is_finalist_gold") as? Boolean,
        isNotRanked          = rs.getObject("is_not_ranked") as? Boolean,
        practiceTime         = rs.getString("practice_time"),
        practiceLocation     = rs.getString("practice_location"),
        practiceLocationName = rs.getString("practice_location_name"),
        weeklyFrequency      = rs.getString("weekly_frequency"),
        practicesOtherSport  = rs.getObject("practices_other_sport") as? Boolean,
        otherSports          = otherSports,
        startedInWrestling   = rs.getObject("started_in_wrestling") as? Boolean,
        armSpanCm            = rs.getObject("arm_span_cm")?.let { (it as Number).toDouble() },
        heightCm             = rs.getObject("height_cm")?.let { (it as Number).toDouble() },
        handGripRight        = rs.getObject("hand_grip_right")?.let { (it as Number).toDouble() },
        handGripLeft         = rs.getObject("hand_grip_left")?.let { (it as Number).toDouble() },
        baseCm               = rs.getObject("base_cm")?.let { (it as Number).toDouble() },
        forearmRightCm       = rs.getObject("forearm_right_cm")?.let { (it as Number).toDouble() },
        forearmLeftCm        = rs.getObject("forearm_left_cm")?.let { (it as Number).toDouble() },
        placement            = rs.getObject("placement") as? Int,
        motorData            = motorData,
    )
    }
}
```

---

### Endpoint 5 — `GET /api/competitions/{code}/athletes`

**Path param:** `code` = código da competição (ex: `25_jejs`)

**Response `200 OK`:**
```json
[
  {
    "entryId": "uuid",
    "athleteName": "João Silva",
    "style": "FS",
    "weight": 65.0,
    "state": "SP",
    "gender": "M",
    "ageCategoryCode": "U17",
    "competitionCode": "25_jejs",
    "competitionName": "JEJS"
  }
]
```

**Response `200 OK` (lista vazia):** `[]` — quando código não existe ou não há atletas.

**DTO:**
```kotlin
data class CompetitionAthleteDto(
    val entryId: UUID,
    val athleteName: String,
    val style: String,
    val weight: Double,
    val state: String,
    val gender: String,
    val ageCategoryCode: String,
    val competitionCode: String,
    val competitionName: String,
)
```

**SQL:** ver `CompetitionController.athletes()` acima — implementado junto com endpoint 2.

---

### Endpoint 6 — `GET /api/dashboard/profiles`

**Response `200 OK`:** (array — uma linha por registro de perfil)
```json
[
  {
    "estado": "SP",
    "estilo": "FS",
    "peso": "65",
    "tempoPratica": "1 a 2 anos",
    "localPratica": "Projeto social",
    "frequenciaSemanal": "3 vezes",
    "flagOutraModalidade": "sim",
    "iniciouNaLuta": "nao",
    "eventIdentifier": "25_jejs"
  }
]
```

**DTO:**
```kotlin
data class ProfileRowDto(
    val estado: String?,
    val estilo: String?,
    val peso: String?,
    val tempoPratica: String?,
    val localPratica: String?,
    val frequenciaSemanal: String?,
    val flagOutraModalidade: String?,
    val iniciouNaLuta: String?,
    val eventIdentifier: String?,
)
```

**SQL:** `SELECT "Estado", "Estilo", "Peso", tempo_pratica, local_pratica, frequencia_semanal, flag_outra_modalidade, iniciou_na_luta, event_identifier FROM vw_profile_dashboard`

> Privacidade: esta view não expõe nome, e-mail, escola ou nascimento. Não adicione esses campos.

---

### Endpoint 7 — `GET /api/dashboard/physical`


**Response `200 OK`:**
```json
[
  {
    "estado": "SP",
    "estilo": "FS",
    "peso": "65",
    "enverguturaCm": "172.5",
    "estaturaCm": "168.0",
    "prensaoManualD": "38.2",
    "prensaoManualE": "36.8",
    "eventIdentifier": "25_jejs"
  }
]
```

**DTO:**
```kotlin
data class PhysicalRowDto(
    val estado: String?,
    val estilo: String?,
    val peso: String?,
    val enverguturaCm: String?,
    val estaturaCm: String?,
    val prensaoManualD: String?,
    val prensaoManualE: String?,
    val eventIdentifier: String?,
)
```

**SQL:** `SELECT "Estado", "Estilo", "Peso", "Envergadura (cm)", "Estatura (cm)", "Prensão manual (D)", "Prensão manual (E)", event_identifier FROM vw_physical_dashboard`

---

### Endpoint 8 — `GET /api/dashboard/motor`

**Response `200 OK`:**
```json
[
  {
    "estado": "SP",
    "estilo": "FS",
    "peso": "65",
    "avaliacao": "Rolo p/ frente",
    "resultado": "Completo",
    "competencia": "Acrobacias",
    "eventIdentifier": "25_jejs"
  }
]
```

**DTO:**
```kotlin
data class MotorRowDto(
    val estado: String?,
    val estilo: String?,
    val peso: String?,
    val avaliacao: String?,
    val resultado: String?,
    val competencia: String?,
    val eventIdentifier: String?,
)
```

**SQL:** `SELECT "Estado", "Estilo", "Peso", "Avaliação", "Resultado", "Competência", event_identifier FROM vw_motor_dashboard`

**Controller completo (`api/DashboardController.kt`):**
```kotlin
@RestController
class DashboardController(private val jdbc: JdbcTemplate) {

    @GetMapping("/api/dashboard/profiles")
    fun profiles(): List<ProfileRowDto> =
        jdbc.query("""
            SELECT "Estado", "Estilo", "Peso", tempo_pratica, local_pratica,
                   frequencia_semanal, flag_outra_modalidade, iniciou_na_luta, event_identifier
            FROM vw_profile_dashboard
        """.trimIndent()) { rs, _ ->
            ProfileRowDto(
                estado              = rs.getString("Estado"),
                estilo              = rs.getString("Estilo"),
                peso                = rs.getString("Peso"),
                tempoPratica        = rs.getString("tempo_pratica"),
                localPratica        = rs.getString("local_pratica"),
                frequenciaSemanal   = rs.getString("frequencia_semanal"),
                flagOutraModalidade = rs.getString("flag_outra_modalidade"),
                iniciouNaLuta       = rs.getString("iniciou_na_luta"),
                eventIdentifier     = rs.getString("event_identifier"),
            )
        }

    @GetMapping("/api/dashboard/physical")
    fun physical(): List<PhysicalRowDto> =
        jdbc.query("""
            SELECT "Estado", "Estilo", "Peso", "Envergadura (cm)", "Estatura (cm)",
                   "Prensão manual (D)", "Prensão manual (E)", event_identifier
            FROM vw_physical_dashboard
        """.trimIndent()) { rs, _ ->
            PhysicalRowDto(
                estado          = rs.getString("Estado"),
                estilo          = rs.getString("Estilo"),
                peso            = rs.getString("Peso"),
                enverguturaCm   = rs.getString("Envergadura (cm)"),
                estaturaCm      = rs.getString("Estatura (cm)"),
                prensaoManualD  = rs.getString("Prensão manual (D)"),
                prensaoManualE  = rs.getString("Prensão manual (E)"),
                eventIdentifier = rs.getString("event_identifier"),
            )
        }

    @GetMapping("/api/dashboard/motor")
    fun motor(): List<MotorRowDto> =
        jdbc.query("""
            SELECT "Estado", "Estilo", "Peso", "Avaliação", "Resultado",
                   "Competência", event_identifier
            FROM vw_motor_dashboard
        """.trimIndent()) { rs, _ ->
            MotorRowDto(
                estado          = rs.getString("Estado"),
                estilo          = rs.getString("Estilo"),
                peso            = rs.getString("Peso"),
                avaliacao       = rs.getString("Avaliação"),
                resultado       = rs.getString("Resultado"),
                competencia     = rs.getString("Competência"),
                eventIdentifier = rs.getString("event_identifier"),
            )
        }
}
```

---

### Endpoint 9 — `POST /api/assessments`

#### Body — Perfil (`kind: "profile"`)
```json
{
  "kind": "profile",
  "event": "25_jejs",
  "name": "João Silva",
  "state": "SP",
  "style": "FS",
  "gender": "M",
  "weight": 65,
  "ageCode": "U17",
  "practiceTime": "1 a 2 anos",
  "practiceLocation": "Projeto social",
  "practiceLocationName": "AABB",
  "weeklyFrequency": "3 vezes",
  "practicesOtherSport": false,
  "otherSports": [],
  "startedInWrestling": true,
  "birth": "2008-03-14",
  "school": "EE Dom Pedro II"
}
```

#### Body — Físico (`kind: "physical"`)
```json
{
  "kind": "physical",
  "event": "25_jejs",
  "name": "João Silva",
  "state": "SP",
  "style": "FS",
  "gender": "M",
  "weight": 65,
  "ageCode": "U17",
  "armSpanCm": "172.5",
  "heightCm": "168.0",
  "handGripRight": "38.2",
  "handGripLeft": "36.8",
  "baseCm": "170.0",
  "forearmRightCm": "26.5",
  "forearmLeftCm": "26.0",
  "placement": "1"
}
```

#### Body — Motor (`kind: "motor"`)
```json
{
  "kind": "motor",
  "event": "25_jejs",
  "name": "João Silva",
  "state": "SP",
  "style": "FS",
  "gender": "M",
  "weight": 65,
  "ageCode": "U17",
  "results": [
    { "movement": "Rolo p/ frente",   "result": "Completo"   },
    { "movement": "Rolo p/ trás",     "result": "Incompleto" },
    { "movement": "Rolo de ombro",    "result": "Não Fez"    },
    { "movement": "Estrelinha",       "result": "Não Sabe"   },
    { "movement": "Arranco",          "result": "Completo"   },
    { "movement": "Cruzeta",          "result": "Completo"   },
    { "movement": "Nelson",           "result": "Incompleto" },
    { "movement": "Rolê",             "result": "Completo"   },
    { "movement": "Arm Drag",         "result": "Completo"   },
    { "movement": "Double Leg",       "result": "Não Fez"    },
    { "movement": "Submersão",        "result": "Não Sabe"   },
    { "movement": "Volteio de braço", "result": "Completo"   }
  ]
}
```

**Campos obrigatórios em todos os kinds:**

| Campo | Tipo | Valores aceitos |
|---|---|---|
| `kind` | `string` | `"profile"`, `"physical"`, `"motor"` |
| `event` | `string` | código da competição (ex: `"25_jejs"`) |
| `name` | `string` | nome completo do atleta |
| `state` | `string` | sigla UF em maiúsculas (ex: `"SP"`) |
| `style` | `string` | `"FS"`, `"GR"`, `"WW"` |
| `weight` | `number` | peso em kg |

**Response `201 Created`:**
```json
{ "message": "Avaliação registrada com sucesso." }
```

**Response `400 Bad Request`:**
```json
{ "error": "VALIDATION_ERROR", "message": "Campo obrigatório ausente: event." }
```

**SQL e implementação:**

A função `submit_assessment` já faz upsert transacional completo. Não reimplementar essa lógica no Kotlin — apenas serializar o body como JSONB.

**Controller completo (`api/AssessmentController.kt`):**
```kotlin
@RestController
class AssessmentController(
    private val jdbc: JdbcTemplate,
    private val objectMapper: ObjectMapper,
) {
    @PostMapping("/api/assessments")
    @ResponseStatus(HttpStatus.CREATED)
    fun submit(@RequestBody body: Map<String, Any>): Map<String, String> {
        val required = listOf("kind", "event", "name", "state", "style", "weight")
        val missing = required.filter { body[it] == null || body[it].toString().isBlank() }
        if (missing.isNotEmpty())
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Campos obrigatórios ausentes: ${missing.joinToString()}"
            )

        val payload = objectMapper.writeValueAsString(body)
        // queryForObject captura o jsonb retornado por submit_assessment
        jdbc.queryForObject("SELECT submit_assessment(?::jsonb)", String::class.java, payload)
        return mapOf("message" to "Avaliação registrada com sucesso.")
    }
}
```

> `jdbc.execute()` descarta o retorno — use `queryForObject` para chamar funções SQL que retornam valor.

---

## 7. Tratamento de Erros

### `GlobalExceptionHandler.kt`

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException::class)
    fun handleStatus(ex: ResponseStatusException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(ex.statusCode).body(
            mapOf("error" to (ex.reason ?: "ERROR"), "message" to ex.message)
        )

    @ExceptionHandler(EmptyResultDataAccessException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleNotFound() = mapOf("error" to "NOT_FOUND", "message" to "Recurso não encontrado.")

    @ExceptionHandler(BadSqlGrammarException::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleSql(ex: BadSqlGrammarException) =
        mapOf("error" to "DB_ERROR", "message" to (ex.cause?.message ?: "Erro de banco."))

    @ExceptionHandler(DataAccessException::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleDb(ex: DataAccessException) =
        mapOf("error" to "DB_ERROR", "message" to (ex.message ?: "Erro interno."))
}
```

**Status HTTP:**

| Status | Cenário |
|---|---|
| `200` | Leitura com sucesso |
| `201` | Assessment criado |
| `400` | Campo obrigatório ausente ou inválido |
| `401` | Token ausente, expirado ou inválido |
| `404` | Entry/atleta não encontrado |
| `500` | Erro de banco ou exceção inesperada |

---

## 8. Adaptações no Frontend

### `src/lib/api.ts` — substitui `supabase.ts`

```typescript
const BASE = import.meta.env.VITE_API_URL as string

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('cbw_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...authHeaders(), Accept: 'application/json' },
  })
  if (res.status === 401) {
    localStorage.removeItem('cbw_token')
    window.location.reload()
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

// Hook equivalente ao useSupabaseRows
export function useApiRows<T>(path: string, enabled = true) {
  const [rows, setRows]     = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) { setRows([]); setLoading(false); return }
    let alive = true
    setLoading(true)
    apiGet<T[]>(path)
      .then((data) => { if (alive) { setRows(data); setError(null) } })
      .catch((e: Error) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path, enabled])

  return { rows, loading, error }
}
```

### `.env.local`

```
VITE_API_URL=http://localhost:8080
```

### Mapeamento de chamadas (1 para 1)

| Chamada Supabase atual | Substituto |
|---|---|
| `useSupabaseRows('competitions')` | `useApiRows('/api/competitions')` |
| `useSupabaseRows('vw_competition_results', { competition_id })` | `useApiRows('/api/results?competitionId=...')` |
| `useSupabaseRows('vw_profile_dashboard')` | `useApiRows('/api/dashboard/profiles')` |
| `useSupabaseRows('vw_physical_dashboard')` | `useApiRows('/api/dashboard/physical')` |
| `useSupabaseRows('vw_motor_dashboard')` | `useApiRows('/api/dashboard/motor')` |
| `useSupabaseRpc('get_athlete_detail', { p_entry_id })` | `apiGet('/api/athletes/entries/' + entryId)` |
| `useSupabaseRpc('get_competition_athletes', { p_competition_code })` | `useApiRows('/api/competitions/' + code + '/athletes')` |
| `supabase.rpc('submit_assessment', { payload })` | `apiPost('/api/assessments', payload)` |
| `supabase.auth.signInWithPassword({ email, password })` | `apiPost('/api/auth/login', { email, password })` |

---

## 9. Checklist de Migração

**Banco (pré-requisito — Supabase SQL Editor):**
- [ ] Criar tabela `app_users`
- [ ] Inserir usuário admin com hash bcrypt
- [ ] Remover `if auth.role() = 'anon'` de `get_athlete_detail` (arquivo `09_athlete_detail_rpc.sql`)
- [ ] Remover `if auth.role() = 'anon'` de `get_competition_athletes` (arquivo `07_get_competition_athletes_rpc.sql`)
- [ ] Remover `if auth.role() = 'anon'` de `submit_assessment` (arquivo `02_rpc_submit.sql`)
- [ ] Executar `GRANT EXECUTE ON FUNCTION get_athlete_detail(uuid) TO postgres`
- [ ] Executar `GRANT EXECUTE ON FUNCTION get_competition_athletes(text) TO postgres`
- [ ] Executar `GRANT EXECUTE ON FUNCTION submit_assessment(jsonb) TO postgres`

**Backend — Spring Boot:**
- [ ] Criar projeto com dependências da seção 3
- [ ] Configurar `application.yml` com as variáveis da seção 0
- [ ] Implementar `JwtProvider`
- [ ] Implementar `SecurityConfig` (filtro JWT + CORS)
- [ ] `AuthController` — `POST /api/auth/login`
- [ ] `CompetitionController` — `GET /api/competitions` e `GET /api/competitions/{code}/athletes`
- [ ] `ResultsController` — `GET /api/results`
- [ ] `AthleteController` — `GET /api/athletes/entries/{entryId}` com RowMapper do jsonb
- [ ] `DashboardController` — `GET /api/dashboard/profiles|physical|motor`
- [ ] `AssessmentController` — `POST /api/assessments`
- [ ] `GlobalExceptionHandler`

**Frontend:**
- [ ] Criar `src/lib/api.ts`
- [ ] Adicionar `VITE_API_URL` no `.env.local`
- [ ] Substituir todas as chamadas conforme tabela da seção 8
- [ ] Atualizar `Auth.tsx` para usar `apiPost('/api/auth/login', ...)`
- [ ] Atualizar `submitAssessment` em `data.ts` para usar `apiPost`
- [ ] Remover `@supabase/supabase-js` do `package.json` (após validação completa)

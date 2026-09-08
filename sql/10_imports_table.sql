-- Tabela de controle de importações SQL do Arena
-- Executar no Supabase SQL Editor (ou psql)

CREATE TABLE IF NOT EXISTS imports (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name              TEXT        NOT NULL,
    file_path              TEXT        NOT NULL,
    status                 TEXT        NOT NULL DEFAULT 'RECEIVED',
    selected_competition_id TEXT,
    competitions_json      TEXT,
    error_message          TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by             TEXT,
    updated_by             TEXT
);

-- Status possíveis: RECEIVED, ANALYZING, WAITING_COMPETITION, PROCESSING, COMPLETED, FAILED

import { useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  ChevronsUpDown,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  LogOut,
  Medal,
  Plus,
  ShieldPlus,
  User,
  UserCircle,
  UsersRound,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import logo from '../assets/logo.svg'
import { fetchCurrentUser, logout, type UserInfo } from '../lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

type NavigationItem = {
  id: string
  label: string
  href: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Painel', href: '/', icon: LayoutDashboard },
  { id: 'explorer', label: 'Análise', href: '?view=explorer', icon: BarChart3 },
  { id: 'results', label: 'Resultados', href: '?view=results', icon: Medal },
  { id: 'profiles', label: 'Atletas', href: '?view=profiles', icon: UsersRound },
  { id: 'physical', label: 'Físico', href: '?view=physical', icon: Activity },
  { id: 'motor', label: 'Técnico', href: '?view=motor', icon: ShieldPlus },
]

const operations: NavigationItem[] = [
  { id: 'collection', label: 'Coleta', href: '?view=collection', icon: ClipboardList },
  { id: 'competition-import', label: 'Criar competição', href: '?view=competition-import', icon: Plus },
  { id: 'results-import', label: 'Importar resultados', href: '?view=results-import', icon: FileUp },
]

function NavigationItems({ active, items }: { active: string; items: NavigationItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={active === item.id} tooltip={item.label}>
              <a href={item.href}>
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function NavUser({ active }: { active: string }) {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => { void fetchCurrentUser().then(setUser) }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              isActive={active === 'profile'}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user?.photoUrl ?? undefined} alt={user?.name ?? ''} />
                <AvatarFallback className="rounded-lg"><User aria-hidden /></AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? 'Minha conta'}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user?.photoUrl ?? undefined} alt={user?.name ?? ''} />
                  <AvatarFallback className="rounded-lg"><User aria-hidden /></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name ?? 'Minha conta'}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="?view=profile"><UserCircle aria-hidden />Meu perfil</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => { void handleLogout() }}>
              <LogOut aria-hidden />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function PageHeader({ active, children }: { active: string; children?: ReactNode }) {
  const pageLabel = [...navigation, ...operations].find((item) => item.id === active)?.label
    ?? (active === 'profile' ? 'Meu perfil' : 'CBW')

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <a className="flex items-center gap-2 rounded-md px-2 py-1 text-sidebar-foreground" href="/" aria-label="CBW Gestão de Atletas, ir para o painel">
            <img className="size-8 shrink-0 object-contain" src={logo} alt="" />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">CBW</span>
          </a>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent><NavigationItems active={active} items={navigation} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Operações</SidebarGroupLabel>
            <SidebarGroupContent><NavigationItems active={active} items={operations} /></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser active={active} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" aria-label="Abrir navegação" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </>
  )
}

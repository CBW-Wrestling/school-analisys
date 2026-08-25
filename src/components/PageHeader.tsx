import { Fragment, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  ChevronRight,
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
import { details } from '../constants'
import { fetchCurrentUser, logout, type UserInfo } from '../lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
  { id: 'competition-import', label: 'Criar competição', href: '?view=competition-import', icon: Plus },
  { id: 'results-import', label: 'Importar resultados', href: '?view=results-import', icon: FileUp },
]

const allNavItems = [
  ...navigation,
  { id: 'collection', label: 'Coleta', href: '?view=collection', icon: ClipboardList },
  ...operations,
]

function CollectionNavItem({ active }: { active: string }) {
  const isActive = active === 'collection'
  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} tooltip="Coleta">
            <ClipboardList size={18} aria-hidden />
            <span>Coleta</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" aria-hidden />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild>
                <a href="?view=collection">Início da coleta</a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {(Object.keys(details) as (keyof typeof details)[]).map((kind) => (
              <SidebarMenuSubItem key={kind}>
                <SidebarMenuSubButton asChild>
                  <a href={`?form=${kind}`}>{details[kind].label}</a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

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

export function PageHeader({
  active,
  breadcrumb,
  children,
}: {
  active: string
  breadcrumb?: { label: string; href?: string }[]
  children?: ReactNode
}) {
  const pageLabel = allNavItems.find((item) => item.id === active)?.label
    ?? (active === 'profile' ? 'Meu perfil' : 'CBW')
  const crumbs = breadcrumb ?? [{ label: pageLabel }]

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
          <a className="flex items-center gap-2 rounded-md px-2 py-1 text-sidebar-foreground" href="/" aria-label="CBW Gestão de Atletas, ir para o painel">
            <img className="size-8 shrink-0 object-contain" src={logo} alt="" />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">CBW</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent><NavigationItems active={active} items={navigation} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Operações</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <CollectionNavItem active={active} />
              </SidebarMenu>
              <NavigationItems active={active} items={operations} />
            </SidebarGroupContent>
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
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.label}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href && index < crumbs.length - 1 ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </>
  )
}

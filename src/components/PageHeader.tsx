import { useEffect, useState } from 'react'
import {
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  LogOut,
  User,
  UserCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import logo from '../assets/logo.svg'
import { details } from '../constants'
import { fetchCurrentUser, logout, type UserInfo } from '../lib/auth'
import { allNavItems, assessmentsNav, examplesNav, operations, overviewNav, resultsNav, type NavigationItem } from '../navigation/sidebar-items'
import { AppHeader } from './AppHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar'

function CollectionNavItem({ active }: { active: string }) {
  const isActive = active === 'collection'
  return (
    <Collapsible asChild defaultOpen className="group/collapsible">
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
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="h-12 justify-center border-b border-sidebar-border">
          <a className="flex items-center gap-2 rounded-md px-2 py-1 text-sidebar-foreground" href="/" aria-label="CBW Gestão de Atletas, ir para o painel">
            <img className="size-8 shrink-0 object-contain" src={logo} alt="" />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">CBW</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent><NavigationItems active={active} items={overviewNav} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Avaliações</SidebarGroupLabel>
            <SidebarGroupContent><NavigationItems active={active} items={assessmentsNav} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Resultados e análises</SidebarGroupLabel>
            <SidebarGroupContent><NavigationItems active={active} items={resultsNav} /></SidebarGroupContent>
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
          <SidebarGroup>
            <SidebarGroupLabel>Exemplos</SidebarGroupLabel>
            <SidebarGroupContent><NavigationItems active={active} items={examplesNav} /></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser active={active} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="peer-data-[variant=inset]:border">
        <AppHeader crumbs={crumbs} />
        {children}
      </SidebarInset>
    </>
  )
}

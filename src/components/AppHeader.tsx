import { Fragment, useEffect, useState } from 'react'
import { ChevronsUpDown, ClipboardList, LogOut, Moon, Sun, User, UserCircle } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { fetchCurrentUser, logout, type UserInfo } from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type BreadcrumbItemData = {
  label: string
  href?: string
}

function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(() => (localStorage.getItem('theme') ?? 'dark') === 'dark')

  useEffect(() => {
    const dark = (localStorage.getItem('theme') ?? 'dark') === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [])

  const toggleTheme = () => {
    const nextIsDark = !isDark
    setIsDark(nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', nextIsDark)
    document.documentElement.dataset.theme = nextIsDark ? 'dark' : 'light'
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </Button>
  )
}

function AccountSwitcher() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => { void fetchCurrentUser().then(setUser) }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2" aria-label="Abrir menu da conta">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src={user?.photoUrl ?? undefined} alt={user?.name ?? ''} />
            <AvatarFallback className="rounded-lg"><User aria-hidden /></AvatarFallback>
          </Avatar>
          <ChevronsUpDown className="size-4 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-lg">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user?.photoUrl ?? undefined} alt={user?.name ?? ''} />
              <AvatarFallback className="rounded-lg"><User aria-hidden /></AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate font-medium">{user?.name ?? 'Minha conta'}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><a href="?view=profile"><UserCircle aria-hidden />Meu perfil</a></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => { void handleLogout() }}>
          <LogOut aria-hidden />Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppHeader({ crumbs }: { crumbs: BreadcrumbItemData[] }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" aria-label="Abrir navegação" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.href && index < crumbs.length - 1 ? <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink> : <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1">
        <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
          <a href="?view=collection"><ClipboardList data-icon="inline-start" aria-hidden />Nova avaliação</a>
        </Button>
        <ThemeSwitcher />
        <AccountSwitcher />
      </div>
    </header>
  )
}

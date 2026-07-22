"use client"

import * as React from "react"
import Link from "next/link"
import { DialogPreferences } from "./preferences"
import { DialogShortcuts } from "./shortcuts"
import { GuildsSwitcher } from "./teamSwitcher"
import { useParams } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"

import {
  ChartSpline, ChevronsUpDown, 
  Clock, Home, LogOut, SquareArrowOutUpRight,
  Palette, Settings, SlidersHorizontal, ShieldCheck,
  Command, Ellipsis, Headset, UserCircle, Info, FileText,
  CodeXml, Crown, Send,
} from "lucide-react"

const mainItems = [
  {
    title: "Principal",
    items: [
      {
        title: "Página Inicial",
        href: "/",
        icon: Home
      },
      {
        title: "Configurações",
        href: "/settings",
        icon: Settings
      }
    ]
  },
  {
    title: "Bate Ponto",
    items: [
      {
        title: "Visão Geral",
        href: "/pm",
        icon: ChartSpline
      },
      {
        title: "Configurações",
        href: "/pm/settings",
        icon: Clock
      },
      {
        title: "Painel",
        href: "/pm/panel",
        icon: Palette
      }
    ]
  }
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    avatar: string | null
    email: string | null
  }
  servers: {
    id: string
    name: string
    logo: string
    plan: string
  }[]
}

export function AppSidebar({ user, servers, ...props }: AppSidebarProps) {
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false)
  const [collapsible, setCollapsible] = React.useState<"icon" | "offcanvas">("icon")

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsible") as "icon" | "offcanvas"
    if (saved === "icon" || saved === "offcanvas") {
      setCollapsible(saved)
    }
  }, [])

  const handleCollapsibleChange = (value: "icon" | "offcanvas") => {
    setCollapsible(value)
    localStorage.setItem("sidebar-collapsible", value)
  }

  const params = useParams()
  const guildId = params["guildId"]
  const { isMobile } = useSidebar()

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US"

  return (
    <Sidebar variant="inset" collapsible={collapsible} {...props}>
      <SidebarHeader>
        <GuildsSwitcher guilds={servers} />
      </SidebarHeader>
      <SidebarContent>
        {mainItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={"/" + guildId + item.href}>
                      <item.icon className="size-4" />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-xs" asChild>
              <Link href={"/" + guildId + "/premium"}><Crown /> Premium</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-xs" asChild>
              <Link href={"/feedback"} target="_blank"><Send /> Feedback</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar>
                    <AvatarImage className="rounded-lg" src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Plano Gratuito
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align={isMobile ? "start" : "end"}
                className="w-56" 
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage className="rounded-lg" src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid">
                      <p className="text-sm text-primary font-medium">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {user.email || "Sem e-mail"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setIsPreferencesOpen(true)}>
                    <SlidersHorizontal />
                    Preferências
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserCircle />
                    Minha Conta
                    <DropdownMenuShortcut>
                      <SquareArrowOutUpRight />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Headset />
                    Servidor de Suporte
                    <DropdownMenuShortcut>
                      <SquareArrowOutUpRight />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Ellipsis />
                      Mais Informações
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="min-w-62" align="end" sideOffset={isMobile ? -130 : 2}>
                        <DropdownMenuItem>
                          <CodeXml />
                          Changelog
                          <DropdownMenuShortcut>
                            <SquareArrowOutUpRight />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText />
                          Termos de Serviço
                          <DropdownMenuShortcut>
                            <SquareArrowOutUpRight />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Info />
                          Política de Privacidade
                          <DropdownMenuShortcut>
                            <SquareArrowOutUpRight />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setIsShortcutsOpen(true)}>
                          <Command />
                          Atalhos do Teclado
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOut />
                  Desconectar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <DialogPreferences 
        open={isPreferencesOpen} 
        onOpenChange={setIsPreferencesOpen} 
        collapsible={collapsible}
        onCollapsibleChange={handleCollapsibleChange}
      />
      <DialogShortcuts
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </Sidebar>
  )
}

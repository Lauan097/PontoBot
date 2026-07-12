"use client"

import * as React from "react"
import Image from "next/image"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

export function GuildsSwitcher({
  guilds,
}: {
  guilds: {
    id: string
    name: string
    logo: string
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const params = useParams()
  const router = useRouter()
  const guildId = params?.guildId as string

  const activeGuild = React.useMemo(() => {
    return guilds.find((t) => t.id === guildId) || guilds[0]
  }, [guilds, guildId])

  if (!activeGuild) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Image src={activeGuild.logo} alt={activeGuild.name} className="size-8 rounded-md" width={8} height={8} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeGuild.name}</span>
                <span className="truncate text-xs text-muted-foreground">{activeGuild.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Servidores
            </DropdownMenuLabel>
            {guilds.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => router.push(`/${team.id}`)}
                className="gap-2 p-2"
              >
                <div className="flex items-center justify-center rounded-md border">
                  <Image src={team.logo} alt={team.name} className="size-6 rounded-md" width={14} height={14} />
                </div>
                <p className="truncate max-w-34">{team.name}</p>
                {team.id === activeGuild.id && (
                  <DropdownMenuShortcut className="text-muted-foreground">
                    <Check />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Adicionar</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

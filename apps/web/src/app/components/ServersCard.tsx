"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, LogOutIcon, MonitorX, Plus, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface Guild {
  id: string
  name: string
  icon: string | null
  memberCount: number
  status: "online" | "offline"
}

interface UserProfile {
  name: string
  avatar: string | null
}

interface ServersCardProps {
  servers: Guild[]
  user: UserProfile
}

export function ServersCard({ servers, user }: ServersCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  return (
    <Card className="rounded-2xl border-border/60 p-6 w-full h-full bg-card/50 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 hover:outline-none hover:ring-0"
              >
                <Avatar size="sm">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <User />
                Conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="destructive"
              >
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            window.open(
              "https://discord.com/oauth2/authorize?client_id=1519203592014266438&permissions=8&scope=bot",
              "_blank"
            )
          }
        >
          <Plus />
          Convidar
        </Button>
      </div>

      <Marker variant="separator" className="my-2">
        <MarkerContent>Meus Servidores</MarkerContent>
      </Marker>

      {servers.length === 0 ? (
        <Card className="flex-1 bg-linear-to-b from-card to-destructive/10 flex flex-col items-center justify-center border-border">
          <div className="flex flex-col items-center p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive mb-2">
              <MonitorX />
            </div>
            <h1 className="text-md font-bold">Nenhum servidor</h1>
            <p className="text-xs text-muted-foreground mb-4">
              Parece que não temos servidores em comum.
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://discord.com/oauth2/authorize?client_id=1519203592014266438&permissions=8&scope=bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus />
                Adicionar PontoBot
              </a>
            </Button>
          </div>
        </Card>
      ) : (
        <ScrollArea className="flex-1 max-h-80 scroll-fade">
          <div className="grid grid-cols gap-3">
            {[...servers]
              .sort((a, b) => {
                if (a.status === "online" && b.status === "offline") return -1
                if (a.status === "offline" && b.status === "online") return 1
                return 0
              })
              .map((server) => {
                if (server.status === "online") {
                  return (
                    <Card
                      key={server.id}
                      className="border-border bg-linear-to-b from-card to-success/30 hover:border-success transition-colors p-3 relative"
                    >
                      <div className="absolute top-3 right-3 bg-secondary/50 flex items-center gap-1 border border-border rounded-lg px-2 py-1 text-[10px] text-muted-foreground font-medium">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        <span className="font-bold text-primary">Online</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        {server.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                            alt={server.name}
                            width={40}
                            height={40}
                            className="rounded-lg w-10 h-10 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center font-bold text-sm text-primary">
                            S/A
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-semibold truncate"
                            title={server.name}
                          >
                            {server.name}
                          </h3>
                          <p className="text-[10px] text-muted-foreground">
                            {server.memberCount} membros
                          </p>
                        </div>
                      </div>

                      <div className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-border h-8 w-full"
                          onClick={() =>
                            (window.location.href = "/" + server.id)
                          }
                        >
                          Gerenciar
                          <ChevronRight />
                        </Button>
                      </div>
                    </Card>
                  )
                } else {
                  return (
                    <Card
                      key={server.id}
                      className="border-border bg-linear-to-b from-card to-ring/30 p-3 relative opacity-70 hover:opacity-100 transition-all"
                    >
                      <div className="absolute top-3 right-3 bg-secondary/50 flex items-center gap-1 border border-border rounded-lg px-2 py-1 text-[10px] font-medium">
                        <span className="w-2 h-2 rounded-full bg-ring"></span>
                        <span className="font-bold text-primary">Offline</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        {server.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                            alt={server.name}
                            width={40}
                            height={40}
                            className="rounded-lg w-10 h-10 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center font-bold text-sm text-primary">
                            S/A
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-semibold truncate"
                            title={server.name}
                          >
                            {server.name}
                          </h3>
                        </div>
                      </div>

                      <div className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-border h-8 w-full"
                          onClick={() =>
                            (window.location.href =
                              "https://discord.com/oauth2/authorize?scope=bot+applications.commands&response_type=code&redirect_uri=http://localhost:3000&prompt=none&permissions=1101596716286&client_id=1519203592014266438")
                          }
                        >
                          Adicionar
                          <Plus />
                        </Button>
                      </div>
                    </Card>
                  )
                }
              })}
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}

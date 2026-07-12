import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import {
  Card,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  Settings,
  ChartSpline,
  Clock,
  Palette,
  ArrowUpRight,
  LayoutGrid,
  Fingerprint,
  BarChart3,
  Users,
  ScrollText,
  Zap,
} from "lucide-react"

interface PageProps {
  params: Promise<{ guildId: string }>
}

export default async function Dashboard({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const { guildId } = await params

  const userName = session?.user?.name || "usuário"

  const navigationGroups = [
    {
      label: "Geral",
      items: [
        {
          title: "Configurações Gerais",
          description: "Ajuste os parâmetros básicos do seu painel.",
          href: `/${guildId}/settings`,
          icon: Settings,
        },
      ],
    },
    {
      label: "Bate-Ponto",
      items: [
        {
          title: "Visão Geral",
          description: "Acompanhe as estatísticas gerais do bate ponto.",
          href: `/${guildId}/pm`,
          icon: ChartSpline,
        },
        {
          title: "Configurações",
          description: "Configure jornadas, regras e tolerâncias.",
          href: `/${guildId}/pm/settings`,
          icon: Clock,
        },
        {
          title: "Painel de Controle",
          description: "Monitore os registros em tempo real.",
          href: `/${guildId}/pm/panel`,
          icon: Palette,
        },
      ],
    },
  ]

  const upcomingFeatures = [
    { label: "Gráficos de atividades", icon: BarChart3 },
    { label: "Frequência dos membros", icon: Users },
    { label: "Total de horas registradas", icon: Fingerprint },
    { label: "Logs recentes de auditoria", icon: ScrollText },
    { label: "Atalhos para ações frequentes", icon: Zap },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-10 px-4">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary">
          Olá, {userName}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Este é o local onde você encontrará o resumo do seu servidor. O painel geral com gráficos e métricas está a caminho —
          por enquanto, use os atalhos abaixo para gerenciar as configurações.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {navigationGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                {group.label}
              </h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="relative h-full overflow-hidden border border-border/50 bg-card/40 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_0_1px_rgba(0,0,0,0)] hover:shadow-primary/5">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground/40 -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-primary" />
                      </div>
                      <CardTitle className="text-sm font-bold text-primary mt-3 mb-1">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-border/50" />

      <Card className="border border-border/50 bg-card/30 p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 text-primary shrink-0">
              <LayoutGrid className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">
                O que vem por aí neste painel
              </h3>
              <p className="text-xs text-muted-foreground">
                Recursos em desenvolvimento para esta tela
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {upcomingFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2.5 text-xs text-muted-foreground"
                >
                  <Icon className="size-3.5 text-primary/60 shrink-0" />
                  {feature.label}
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
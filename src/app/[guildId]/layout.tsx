import { AppSidebar } from "@/components/sidebar/appSidebar"
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}

export default async function DashboardLayout({
  children,
  params
}: Readonly<DashboardLayoutProps>) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    redirect("/")
  }

  const { guildId } = await params

  const apiUrl = process.env.FASTIFY_API_URL
  const res = await fetch(`${apiUrl}/guilds/${guildId}/initial-page`, {
    headers: {
      "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
      "X-User-Id": session.user.id,
      "X-User-Discord-Id": session.user.discordId
    },
    next: { revalidate: 0 }
  })

  if (res.status === 401 || res.status === 403) {
    redirect("/")
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch initial page data: ${res.statusText}`)
  }

  const data = (await res.json()) as {
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
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh max-h-svh overflow-hidden">
      <AppSidebar user={data.user} servers={data.servers} />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center px-6 ml-auto">
            <Image
              src="/logo.svg"
              alt="Logo PontoBot"
              className="rounded-lg border-4 border-borde mr-1"
              width={32}
              height={32}
              loading="eager"
            />
            <p className="text-lg font-black text-primary">PontoBot</p>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { ErrorCard } from "./components/ErrorCard"
import { LoginCard } from "./components/LoginCard"
import { ServersCard } from "./components/ServersCard"
import Image from "next/image"

interface FastifyGuild {
  id: string
  name: string
  icon: string | null
  hasBot?: boolean
  status?: "online" | "offline"
  memberCount: number | null
}

interface FastifyResponse {
  guilds?: FastifyGuild[]
  responseGuilds?: FastifyGuild[]
  user?: {
    name?: string
    displayName?: string
    avatar?: string | null
    avatarURL?: string | null
  }
}

async function getGuilds(
  userId: string,
  discordId: string
): Promise<{ data: FastifyResponse | null; error: boolean }> {
  const apiUrl = process.env.FASTIFY_API_URL

  try {
    const res = await fetch(`${apiUrl}/guilds`, {
      headers: {
        "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
        "X-User-Id": userId,
        "X-User-Discord-Id": discordId
      },
      next: { revalidate: 0 }
    })

    if (res.status === 401) {
      return { data: null, error: false }
    }

    if (!res.ok) {
      return { data: null, error: true }
    }

    const data = (await res.json()) as FastifyResponse
    return { data, error: false }
  } catch (error) {
    console.error("Error fetching guilds from Fastify:", error)
    return { data: null, error: true }
  }
}

export default async function Root() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-2 select-none bg-background">
        <div className="top-6 left-6 fixed flex flex-row items-center gap-2 text-primary">
          <Image
            src="/logo.svg"
            alt="Logo PontoBot"
            className="rounded-xl border-4 border-border"
            width={36}
            height={36}
            loading="eager"
          />
          <p className="text-lg font-black text-primary">PontoBot</p>
        </div>
        <div className="w-full max-w-md h-[490px] border border-border/60 rounded-2xl bg-card/50">
          <LoginCard />
        </div>
      </div>
    )
  }

  const { data, error } = await getGuilds(
    session.user.id,
    session.user.discordId
  )

  let content

  if (error) {
    content = <ErrorCard />
  } else if (!data) {
    content = <LoginCard />
  } else {
    const rawGuilds = data.guilds || data.responseGuilds || []

    const mappedServers = rawGuilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      memberCount: guild.memberCount ?? 0,
      status: (guild.hasBot || guild.status === "online"
        ? "online"
        : "offline") as "online" | "offline"
    }))

    const userProfile = {
      name: data.user?.name || data.user?.displayName || "Usuário",
      avatar: data.user?.avatar || data.user?.avatarURL || null
    }

    content = <ServersCard servers={mappedServers} user={userProfile} />
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-2 select-none bg-background">
      <div className="top-6 left-6 fixed flex flex-row items-center gap-2 text-primary">
        <Image
          src="/logo.svg"
          alt="Logo PontoBot"
          className="rounded-xl border-4 border-border"
          width={36}
          height={36}
          loading="eager"
        />
        <p className="text-lg font-black text-primary">PontoBot</p>
      </div>
      <div className="w-full max-w-md h-[490px] rounded-2xl">
        {content}
      </div>
    </div>
  )
}

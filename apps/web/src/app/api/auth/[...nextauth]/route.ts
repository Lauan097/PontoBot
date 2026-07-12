import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds email" } }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as DiscordProfile;
        
        token.discordId = discordProfile.id;
        token.name = discordProfile.global_name || discordProfile.username;
        token.avatar = discordProfile.image_url;

        const apiUrl = process.env.FASTIFY_API_URL! + "/auth/sync";
        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Secret": process.env.INTERNAL_API_SECRET!
            },
            body: JSON.stringify({
              discordId: discordProfile.id,
              username: discordProfile.username,
              email: discordProfile.email,
              avatar: discordProfile.image_url,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? account.expires_at * 1000 : null
            })
          });

          if (res.ok) {
            const dbUser = await res.json() as { id: string };
            token.userId = dbUser.id;
          } else {
            console.error("Failed to sync user with Fastify:", await res.text());
          }
        } catch (error) {
          console.error("Error during Fastify sync fetch:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.discordId = token.discordId;
        session.user.avatar = token.avatar;
        session.user.name = token.name;
      }
      return session;
    }
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

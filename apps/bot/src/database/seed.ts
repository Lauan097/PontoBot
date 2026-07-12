import { prisma } from "#database"

async function main() {
    await prisma.plan.upsert({
        where: { slug: "free" },
        update: {},
        create: {
            slug: "free",
            name: "Free",
            maxServers: 0,
            maxMembersPool: 8000,
            priceCents: 0,
            mercadoPagoPlanId: null
        }
    })
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

import { prisma } from "#database"
import { Slug } from "./prisma/client.js"

async function main() {
    await prisma.plan.upsert({
        where: { slug: Slug.free },
        update: {},
        create: {
            slug: Slug.free,
            name: "Gratuito",
            maxUsers: 5000,
            priceCents: 0,
            mercadoPagoPlanId: null
        }
    })

    await prisma.plan.upsert({
        where: { slug: Slug.andromeda },
        update: {},
        create: {
            slug: Slug.andromeda,
            name: "Andrômeda",
            maxUsers: 80000,
            priceCents: 499,
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

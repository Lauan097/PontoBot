import { prisma } from "#database";
async function authenticate(req, res) {
  const internalSecret = req.headers["x-internal-secret"];
  const userId = req.headers["x-user-id"];
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).send({ error: "Unauthorized Gateway" });
  }
  if (!userId) {
    return res.status(401).send({ error: "Missing identity headers" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          select: { status: true, currentPeriodEnd: true }
        }
      }
    });
    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }
    req.user = user;
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Database error during authentication" });
  }
}
export {
  authenticate
};

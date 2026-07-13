import { StatusCodes } from "http-status-codes";
function homeRoute(app, client) {
  app.get("/", (_, res) => {
    return res.status(StatusCodes.OK).send({
      message: `\u{1F343} Online on discord as ${client.user.username}`,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size
    });
  });
}
export {
  homeRoute
};

import { homeRoute } from "./public/home.js";
import { syncRoute } from "./private/auth/sync.js";
import { guildsRoute } from "./private/data/guilds.js";
import { initialPageRoute } from "./private/data/initialPage.js";
function registerRoutes(app, client) {
  homeRoute(app, client);
  syncRoute(app);
  guildsRoute(app, client);
  initialPageRoute(app, client);
}
export {
  registerRoutes
};

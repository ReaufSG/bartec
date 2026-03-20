import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./appRouter";
const server = createHTTPServer({
  router: appRouter,
});
server.listen(3000);

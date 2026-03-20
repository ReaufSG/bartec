import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../backend/appRouter";
//     👆 **type-only** imports are stripped at build time
// Pass AppRouter as a type parameter. 👇 This lets `trpc` know
// what procedures are available on the server and their input/output types.
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://192.168.1.226:3000",
    }),
  ],
});

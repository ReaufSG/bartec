import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./appRouter";
import { prisma } from "./db";
const app = express();
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);
app.post("/getSetupCode", async (req, res) => {
  //4 digit code generator
  const genCode = Math.floor(1000 + Math.random() * 9000);
  await prisma.setupCodes.create({
    data: {
      code: genCode.toString(),
    },
  });
  res.json({ code: genCode });
});
app.get("/isCodeActivated/:code", async (req, res) => {
  const { code } = req.params;
  const setupCode = await prisma.setupCodes.findUnique({
    where: {
      code,
    },
  });
  if (!setupCode) {
    return res.json({ activated: false });
  }
  res.json({ activated: setupCode.used });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

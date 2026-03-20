import { publicProcedure, router } from "./trpc";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db";
import { sign } from "jsonwebtoken";
export const appRouter = router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (!user) {
        throw new Error("Invalid username or password");
      }
      const validPassword = await compare(input.password, user.passwordHash);
      if (!validPassword) {
        throw new Error("Invalid username or password");
      }
      return {
        toke: sign(
          { userId: user.id, username: user.username },
          "some-secret",
          { expiresIn: "1h" },
        ),
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };
    }),
  createUser: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (existing) {
        throw new Error("Username already taken");
      }
      const passwordHash = await hash(input.password, 12);
      const user = await prisma.user.create({
        data: { username: input.username, passwordHash },
        select: { id: true, username: true, createdAt: true },
      });
      return {
        token: sign(
          { userId: user.id, username: user.username },
          "some-secret",
          { expiresIn: "1h" },
        ),
        user,
      };
    }),
});
export type AppRouter = typeof appRouter;

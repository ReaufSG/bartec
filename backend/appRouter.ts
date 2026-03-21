import { publicProcedure, router } from "./trpc";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db";
import { sign } from "jsonwebtoken";
export const appRouter = router({
  fetchOffers: publicProcedure
    .query(async () => {
      return await prisma.offer.findMany();
    }),
  postOffer: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        makerId: z.string().min(1, "makerId is required"),
      })
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.create({
        data: {
          title: input.title,
          description: input.description,
          makerId: input.makerId,
        },
      });
      return offer;
    }),
  accept: publicProcedure
    .input(
      z.object({ offerId: z.string().min(1, "Offer ID is required"), takerId: z.string().min(1, "Taker ID is required") }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.update({
        where: { id: input.offerId },
        data: { accepts: { create: { takerId: input.takerId } } },
      });
      return offer;
    }),
  rateOffer: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1, "Offer ID is required"),
        userId: z.string().min(1, "User ID is required"),
        rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.findFirst({
        include: { accepts: true },
        where: {
          AND: [
            { id: input.offerId },
            { OR: [{ makerId: input.userId }, { accepts: { takerId: input.userId } }] }]
        }
      });
      if (!offer) {
        throw new Error("Offer not found or user not involved");
      }
      if (input.userId === offer.makerId) {
        await prisma.accept.update({
          where: { id: offer.accepts?.id },
          data: { makerRating: input.rating }
        });
      } else {
        await prisma.accept.update({
          where: { id: offer.accepts?.id },
          data: { takerRating: input.rating }
        })
      }

      return offer;
    }),

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
        toke: sign(//TODO: fix typo
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

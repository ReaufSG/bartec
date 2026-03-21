import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "./db";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  fetchOffers: publicProcedure.query(async () => {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: { maker: { select: { username: true } } },
    });

    return offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      makerId: offer.makerId,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      makerUsername: offer.maker.username,
    }));
  }),

  postOffer: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        makerId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.offer.create({ data: input });
    }),

  updateOffer: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.offer.update({
        where: { id: input.id },
        data: { title: input.title, description: input.description },
      });
    }),

  deleteOffer: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        makerId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.findUnique({ where: { id: input.id } });
      if (!offer) throw new Error("Oferta nie istnieje");
      if (offer.makerId !== input.makerId)
        throw new Error("Możesz usunąć tylko własną ofertę");

      // usuń powiązane Accept najpierw (relacja)
      await prisma.accept.deleteMany({ where: { offerId: input.id } });
      return await prisma.offer.delete({ where: { id: input.id } });
    }),

  accept: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        takerId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.offer.update({
        where: { id: input.offerId },
        data: { accepts: { create: { takerId: input.takerId } } },
      });
    }),

  rateOffer: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        userId: z.string().min(1),
        rating: z.number().min(1).max(5),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.findFirst({
        include: { accepts: true },
        where: {
          id: input.offerId,
          OR: [
            { makerId: input.userId },
            { accepts: { is: { takerId: input.userId } } },
          ],
        },
      });
      if (!offer) throw new Error("Offer not found or user not involved");

      if (input.userId === offer.makerId) {
        await prisma.accept.update({
          where: { id: offer.accepts?.id },
          data: { makerRating: input.rating },
        });
      } else {
        await prisma.accept.update({
          where: { id: offer.accepts?.id },
          data: { takerRating: input.rating },
        });
      }
      return offer;
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (!user) throw new Error("Invalid username or password");
      const valid = await compare(input.password, user.passwordHash);
      if (!valid) throw new Error("Invalid username or password");
      return {
        token: sign(
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
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (existing) throw new Error("Username already taken");
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

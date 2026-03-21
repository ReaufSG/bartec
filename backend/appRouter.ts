import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "./db";
import { publicProcedure, router } from "./trpc";

function isTeachOffer(title: string): boolean {
  const normalized = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized.startsWith("ucze:");
}

const BASE_POINTS_PER_MINUTE = 1.1;
const TEACHER_ROLE_MULTIPLIER = 1.2;
const STUDENT_ROLE_MULTIPLIER = 1.0;

function getTeacherStarMultiplier(rating: number | null | undefined): number {
  if (rating == null) return 1;
  if (rating <= 2) return 0.9;
  if (rating === 3) return 1;
  if (rating === 4) return 1.2;
  return 1.4;
}

function calculateLessonPoints(params: {
  durationMinutes: number;
  isTeacher: boolean;
  lessonRating?: number | null;
}): number {
  const safeDuration = Math.max(
    15,
    Math.min(300, params.durationMinutes || 60),
  );
  const roleMultiplier = params.isTeacher
    ? TEACHER_ROLE_MULTIPLIER
    : STUDENT_ROLE_MULTIPLIER;
  const qualityMultiplier = params.isTeacher
    ? getTeacherStarMultiplier(params.lessonRating)
    : 1;

  return Math.max(
    1,
    Math.round(
      safeDuration *
        BASE_POINTS_PER_MINUTE *
        roleMultiplier *
        qualityMultiplier,
    ),
  );
}

const STORE_ITEMS = {
  "1": { name: "R-ka na lekcję", cost: 1000, type: "HAND_RAISE" as const },
  "2": { name: "Font nazwy: Serif", cost: 800, type: "FONT_SERIF" as const },
  "3": { name: "Font nazwy: Sans", cost: 800, type: "FONT_SANS" as const },
  "4": { name: "Obramówka: Amber", cost: 650, type: "BORDER_AMBER" as const },
  "5": { name: "Obramówka: Rose", cost: 650, type: "BORDER_ROSE" as const },
  "6": { name: "Obramówka: Lime", cost: 650, type: "BORDER_LIME" as const },
  "7": {
    name: "Font nazwy: Display",
    cost: 900,
    type: "FONT_DISPLAY" as const,
  },
  "8": { name: "Font nazwy: Tech", cost: 950, type: "FONT_TECH" as const },
  "9": { name: "Obramówka: Navy", cost: 700, type: "BORDER_NAVY" as const },
} as const;

export const appRouter = router({
  fetchOffers: publicProcedure.query(async () => {
    const teacherStats = await prisma.accept.groupBy({
      by: ["teacherId"],
      where: {
        status: "COMPLETED",
        lessonRating: { not: null },
      },
      _avg: { lessonRating: true },
      _count: { lessonRating: true },
    });

    const ratingsByTeacher = new Map(
      teacherStats.map((s) => [
        s.teacherId,
        {
          avg: s._avg.lessonRating,
          count: s._count.lessonRating,
        },
      ]),
    );

    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        maker: { select: { username: true } },
        accepts: {
          select: {
            id: true,
            takerId: true,
            teacherId: true,
            studentId: true,
            scheduledAt: true,
            durationMinutes: true,
            scheduleConfirmed: true,
            status: true,
            lessonRating: true,
          },
        } as any,
      },
    });

    return offers.map((offer) => {
      const teachOffer = isTeachOffer(offer.title);
      const teacherStat = teachOffer
        ? ratingsByTeacher.get(offer.makerId)
        : null;

      return {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        makerId: offer.makerId,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        makerUsername: offer.maker.username,
        accept: offer.accepts
          ? {
              id: offer.accepts.id,
              takerId: offer.accepts.takerId,
              teacherId: offer.accepts.teacherId,
              studentId: offer.accepts.studentId,
              scheduledAt: offer.accepts.scheduledAt,
              durationMinutes: offer.accepts.durationMinutes,
              scheduleConfirmed:
                (offer.accepts as any).scheduleConfirmed ?? false,
              status: offer.accepts.status,
              lessonRating: offer.accepts.lessonRating,
            }
          : null,
        teacherRatingAvg: teacherStat?.avg ?? null,
        teacherRatingCount: teacherStat?.count ?? 0,
      };
    });
  }),
  activateCode: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        code: z.string().length(4, "Code must be 4 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) throw new Error("User not found");

      const codeRecord = await prisma.setupCodes.findUnique({
        where: { code: input.code },
      });
      if (!codeRecord) throw new Error("Invalid code");
      if (codeRecord.used) throw new Error("Code already used");
      await prisma.setupCodes.update({
        where: { code: input.code },
        data: { used: true },
      });
      await prisma.user.update({
        where: { id: input.userId },
        data: { points: { decrement: 1000 } },
      });
      return { ok: true, message: "Code activated, 1000 points deducted" };
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

  acceptOffer: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        takerId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.findUnique({
        where: { id: input.offerId },
      });
      if (!offer) throw new Error("Oferta nie istnieje");
      if (offer.makerId === input.takerId)
        throw new Error("Nie możesz zaakceptować własnej oferty");

      const existing = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (existing) throw new Error("Ta oferta jest już zaakceptowana");

      const teachOffer = isTeachOffer(offer.title);
      const teacherId = teachOffer ? offer.makerId : input.takerId;
      const studentId = teachOffer ? input.takerId : offer.makerId;
      const scheduleDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const durationMinutes = 60;

      return await prisma.accept.create({
        data: {
          offerId: input.offerId,
          takerId: input.takerId,
          teacherId,
          studentId,
          scheduledAt: scheduleDate,
          durationMinutes,
          scheduleConfirmed: false,
        } as any,
      });
    }),

  accept: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        takerId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.findUnique({
        where: { id: input.offerId },
      });
      if (!offer) throw new Error("Oferta nie istnieje");
      if (offer.makerId === input.takerId)
        throw new Error("Nie możesz zaakceptować własnej oferty");

      const existing = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (existing) throw new Error("Ta oferta jest już zaakceptowana");

      const teachOffer = isTeachOffer(offer.title);
      const teacherId = teachOffer ? offer.makerId : input.takerId;
      const studentId = teachOffer ? input.takerId : offer.makerId;
      const scheduleDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const durationMinutes = 60;

      return await prisma.accept.create({
        data: {
          offerId: input.offerId,
          takerId: input.takerId,
          teacherId,
          studentId,
          scheduledAt: scheduleDate,
          durationMinutes,
          scheduleConfirmed: false,
        } as any,
      });
    }),

  setLessonSchedule: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        userId: z.string().min(1),
        scheduledAt: z.string().datetime(),
        durationMinutes: z.number().int().min(15).max(300),
      }),
    )
    .mutation(async ({ input }) => {
      const accept = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (!accept) throw new Error("Lekcja nie istnieje");
      if (accept.teacherId !== input.userId) {
        throw new Error("Termin i czas trwania może ustawić tylko nauczyciel");
      }
      if (accept.status === "COMPLETED") {
        throw new Error("Nie można zmienić terminu zakończonej lekcji");
      }

      const date = new Date(input.scheduledAt);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Nieprawidłowy termin");
      }
      if (date.getTime() <= Date.now()) {
        throw new Error("Termin musi być w przyszłości");
      }

      return await prisma.accept.update({
        where: { id: accept.id },
        data: {
          scheduledAt: date,
          durationMinutes: input.durationMinutes,
          scheduleConfirmed: true,
        } as any,
      });
    }),

  completeLesson: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const accept = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (!accept) throw new Error("Lekcja nie istnieje");
      if (
        accept.teacherId !== input.userId &&
        accept.studentId !== input.userId
      ) {
        throw new Error("Brak dostępu do tej lekcji");
      }
      if (!(accept as any).scheduleConfirmed) {
        throw new Error(
          "Przed zakończeniem lekcji nauczyciel musi ustalić termin i czas trwania",
        );
      }
      if (accept.status === "COMPLETED") return accept;

      const durationMinutes = (accept as any).durationMinutes ?? 60;
      const teacherBasePoints = calculateLessonPoints({
        durationMinutes,
        isTeacher: true,
        lessonRating: null,
      });
      const studentBasePoints = calculateLessonPoints({
        durationMinutes,
        isTeacher: false,
      });

      const completed = await prisma.accept.update({
        where: { id: accept.id },
        data: { status: "COMPLETED" },
      });

      if (accept.teacherId === accept.studentId) {
        await prisma.user.update({
          where: { id: accept.teacherId },
          data: {
            points: { increment: teacherBasePoints + studentBasePoints },
          },
        });
      } else {
        await prisma.user.update({
          where: { id: accept.teacherId },
          data: { points: { increment: teacherBasePoints } },
        });
        await prisma.user.update({
          where: { id: accept.studentId },
          data: { points: { increment: studentBasePoints } },
        });
      }

      return completed;
    }),

  rateLesson: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        userId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        review: z.string().trim().max(300).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const accept = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (!accept) throw new Error("Lekcja nie istnieje");
      if (accept.lessonRating != null) {
        throw new Error("Ta lekcja została już oceniona");
      }
      if (accept.studentId !== input.userId) {
        throw new Error("Ocenić lekcję może tylko uczeń");
      }
      if (accept.status !== "COMPLETED") {
        throw new Error("Najpierw oznacz lekcję jako zakończoną");
      }

      const durationMinutes = (accept as any).durationMinutes ?? 60;
      const teacherBasePoints = calculateLessonPoints({
        durationMinutes,
        isTeacher: true,
        lessonRating: null,
      });
      const teacherRatedPoints = calculateLessonPoints({
        durationMinutes,
        isTeacher: true,
        lessonRating: input.rating,
      });
      const teacherDelta = teacherRatedPoints - teacherBasePoints;

      const updated = await prisma.accept.update({
        where: { id: accept.id },
        data: {
          lessonRating: input.rating,
          lessonReview: input.review || null,
          ratedAt: new Date(),
        },
      });

      if (teacherDelta !== 0) {
        await prisma.user.update({
          where: { id: accept.teacherId },
          data: { points: { increment: teacherDelta } },
        });
      }

      return updated;
    }),

  useLessonHandRaise: publicProcedure
    .input(
      z.object({
        offerId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const accept = await prisma.accept.findUnique({
        where: { offerId: input.offerId },
      });
      if (!accept) throw new Error("Lekcja nie istnieje");
      if (accept.studentId !== input.userId) {
        throw new Error("R-kę może użyć tylko uczeń tej lekcji");
      }
      if (accept.status !== "SCHEDULED") {
        throw new Error("R-kę można użyć tylko dla lekcji zaplanowanej");
      }
      if ((accept as any).raisedHandByStudent) {
        throw new Error("R-ka została już użyta dla tej lekcji");
      }

      const user = await (prisma.user as any).findUnique({
        where: { id: input.userId },
        select: { handRaises: true },
      });
      if (!user || (user.handRaises ?? 0) <= 0) {
        throw new Error("Nie masz R-ki. Kup ją w sklepie.");
      }

      await prisma.user.update({
        where: { id: input.userId },
        data: { handRaises: { decrement: 1 } },
      });

      return await prisma.accept.update({
        where: { id: accept.id },
        data: {
          raisedHandByStudent: true,
          raisedHandAt: new Date(),
        } as any,
      });
    }),

  purchaseStoreItem: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        itemId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const item = STORE_ITEMS[input.itemId as keyof typeof STORE_ITEMS];
      if (!item) throw new Error("Ten przedmiot nie istnieje");

      const user = await (prisma.user.findUnique as any)({
        where: { id: input.userId },
        select: { id: true, points: true },
      });
      if (!user) throw new Error("Użytkownik nie istnieje");
      if ((user.points ?? 0) < item.cost) {
        throw new Error("Za mało punktów");
      }

      const updated = await prisma.user.update({
        where: { id: input.userId },
        data: {
          points: { decrement: item.cost },
          ...(item.type === "HAND_RAISE"
            ? { handRaises: { increment: 1 } }
            : {}),
          ...(item.type === "FONT_SERIF" ? { nameFont: "SERIF" as any } : {}),
          ...(item.type === "FONT_SANS" ? { nameFont: "SANS" as any } : {}),
          ...(item.type === "FONT_DISPLAY"
            ? { nameFont: "DISPLAY" as any }
            : {}),
          ...(item.type === "FONT_TECH" ? { nameFont: "TECH" as any } : {}),
          ...(item.type === "BORDER_AMBER"
            ? { borderColor: "AMBER" as any }
            : {}),
          ...(item.type === "BORDER_ROSE"
            ? { borderColor: "ROSE" as any }
            : {}),
          ...(item.type === "BORDER_LIME"
            ? { borderColor: "LIME" as any }
            : {}),
          ...(item.type === "BORDER_NAVY"
            ? { borderColor: "NAVY" as any }
            : {}),
        },
        select: {
          points: true,
          handRaises: true,
          nameFont: true,
          borderColor: true,
        },
      } as any);

      return {
        ok: true,
        itemName: item.name,
        cost: item.cost,
        pointsLeft: updated.points,
        handRaises: (updated as any).handRaises ?? 0,
        nameFont: (updated as any).nameFont ?? "MONO",
        borderColor: (updated as any).borderColor ?? "CYAN",
      };
    }),

  getMyLessons: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const lessons = await prisma.accept.findMany({
        where: {
          OR: [{ teacherId: input.userId }, { studentId: input.userId }],
        },
        include: {
          offer: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          teacher: {
            select: {
              id: true,
              username: true,
            },
          },
          student: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      const normalized = lessons.map((lesson) => ({
        id: lesson.id,
        offerId: lesson.offerId,
        offerTitle: lesson.offer.title,
        offerDescription: lesson.offer.description,
        scheduledAt: lesson.scheduledAt,
        durationMinutes: (lesson as any).durationMinutes ?? 60,
        scheduleConfirmed: (lesson as any).scheduleConfirmed ?? false,
        status: lesson.status,
        lessonRating: lesson.lessonRating,
        lessonReview: lesson.lessonReview,
        raisedHandByStudent: (lesson as any).raisedHandByStudent ?? false,
        teacherId: lesson.teacher.id,
        teacherUsername: lesson.teacher.username,
        studentId: lesson.student.id,
        studentUsername: lesson.student.username,
        canRate:
          lesson.student.id === input.userId &&
          lesson.status === "COMPLETED" &&
          lesson.lessonRating == null,
        canMarkCompleted:
          (lesson as any).scheduleConfirmed === true &&
          lesson.status === "SCHEDULED" &&
          (lesson.student.id === input.userId ||
            lesson.teacher.id === input.userId),
        canSetSchedule:
          lesson.status === "SCHEDULED" && lesson.teacher.id === input.userId,
      }));

      return normalized.sort((a, b) => {
        const aUnfinished = a.status !== "COMPLETED";
        const bUnfinished = b.status !== "COMPLETED";

        if (aUnfinished !== bUnfinished) {
          return aUnfinished ? -1 : 1;
        }

        if (!aUnfinished && !bUnfinished) {
          const aUnrated = a.lessonRating == null;
          const bUnrated = b.lessonRating == null;
          if (aUnrated !== bUnrated) {
            return aUnrated ? -1 : 1;
          }
        }

        const aTime = new Date(a.scheduledAt).getTime();
        const bTime = new Date(b.scheduledAt).getTime();
        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        return aTime - bTime;
      });
    }),

  getUserRating: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const stats = await prisma.accept.aggregate({
        where: {
          teacherId: input.userId,
          status: "COMPLETED",
          lessonRating: { not: null },
        },
        _avg: { lessonRating: true },
        _count: { lessonRating: true },
      });

      return {
        avgRating: stats._avg.lessonRating,
        ratingCount: stats._count.lessonRating,
      };
    }),

  getPublicProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const [user, ratingStats, totalUsers] = await Promise.all([
        prisma.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            username: true,
            createdAt: true,
            points: true,
            nameFont: true,
            borderColor: true,
            handRaises: true,
          },
        } as any),
        prisma.accept.aggregate({
          where: {
            teacherId: input.userId,
            status: "COMPLETED",
            lessonRating: { not: null },
          },
          _avg: { lessonRating: true },
          _count: { lessonRating: true },
        }),
        prisma.user.count(),
      ]);

      if (!user) {
        throw new Error("Użytkownik nie istnieje");
      }

      const rankPosition =
        (await prisma.user.count({
          where: { points: { gt: user.points ?? 0 } },
        })) + 1;

      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        points: user.points ?? 0,
        nameFont: (user as any).nameFont ?? "MONO",
        borderColor: (user as any).borderColor ?? "CYAN",
        handRaises: (user as any).handRaises ?? 0,
        avgRating: ratingStats._avg.lessonRating,
        ratingCount: ratingStats._count.lessonRating,
        rankPosition,
        totalUsers,
      };
    }),

  getHomeStats: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const [user, activeOffersCount, ratingStats] = await Promise.all([
        prisma.user.findUnique({
          where: { id: input.userId },
          select: {
            points: true,
            nameFont: true,
            borderColor: true,
            handRaises: true,
          },
        } as any),
        prisma.offer.count({
          where: {
            makerId: input.userId,
            accepts: { is: null },
          },
        }),
        prisma.accept.aggregate({
          where: {
            teacherId: input.userId,
            status: "COMPLETED",
            lessonRating: { not: null },
          },
          _avg: { lessonRating: true },
          _count: { lessonRating: true },
        }),
      ]);

      const totalUsers = await prisma.user.count();
      const rankPosition = user
        ? (await prisma.user.count({
            where: {
              points: { gt: user.points ?? 0 },
            },
          })) + 1
        : null;

      return {
        points: user?.points ?? 0,
        nameFont: (user as any)?.nameFont ?? "MONO",
        borderColor: (user as any)?.borderColor ?? "CYAN",
        handRaises: (user as any)?.handRaises ?? 0,
        activeOffersCount,
        avgRating: ratingStats._avg.lessonRating,
        ratingCount: ratingStats._count.lessonRating,
        rankPosition,
        totalUsers,
      };
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

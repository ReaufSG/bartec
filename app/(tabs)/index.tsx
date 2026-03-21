import { DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Colors = typeof DARK;
type ApiLesson = {
  id: string;
  offerId: string;
  offerTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "COMPLETED";
  teacherId: string;
  teacherUsername: string;
  studentId: string;
  studentUsername: string;
};

type HomeStats = {
  points: number;
  activeOffersCount: number;
  avgRating: number | null;
  ratingCount: number;
};

type CalendarDay = {
  dn: string;
  num: number;
  dotKind: "none" | "teach" | "learn" | "both";
  today?: boolean;
};

type Lesson = {
  id: string;
  time: string;
  day: string;
  title: string;
  meta: string;
  dot: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  badgeBdr: string;
  isNext: boolean;
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  onMore,
  C,
}: {
  title: string;
  onMore?: () => void;
  C: Colors;
}) {
  return (
    <View style={ss.secHeader}>
      <Text style={[ss.secTitle, { color: C.text3 }]}>{title}</Text>
      {onMore && (
        <TouchableOpacity onPress={onMore}>
          <Text style={[ss.secMore, { color: C.cyan }]}>wszystkie →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CalDay({ item, C }: { item: CalendarDay; C: Colors }) {
  const dotColor =
    item.dotKind === "teach"
      ? C.lime
      : item.dotKind === "learn"
        ? C.cyan
        : item.dotKind === "both"
          ? C.amber
          : null;

  return (
    <View
      style={[
        ss.calDay,
        { backgroundColor: C.surface, borderColor: C.border },
        item.today && { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
      ]}
    >
      <Text
        style={[ss.calDn, { color: C.text3 }, item.today && { color: C.cyan }]}
      >
        {item.dn}
      </Text>
      <Text
        style={[
          ss.calNum,
          { color: C.text2 },
          item.today && { color: C.text1 },
        ]}
      >
        {item.num}
      </Text>
      {dotColor && (
        <View style={[ss.eventDot, { backgroundColor: dotColor }]} />
      )}
    </View>
  );
}

function LessonCard({ item, C }: { item: Lesson; C: Colors }) {
  return (
    <View
      style={[
        ss.lessonCard,
        { backgroundColor: C.surface, borderColor: C.border },
        item.isNext && { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
      ]}
    >
      <View style={ss.timeCol}>
        <Text style={[ss.lTime, { color: C.text1 }]}>{item.time}</Text>
        <Text style={[ss.lDay, { color: C.text3 }]}>{item.day}</Text>
      </View>
      <View style={[ss.lDivider, { backgroundColor: C.border }]} />
      <View style={[ss.lDot, { backgroundColor: item.dot }]} />
      <View style={ss.lInfo}>
        <Text style={[ss.lTitle, { color: C.text1 }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[ss.lMeta, { color: C.text3 }]}>{item.meta}</Text>
      </View>
      <View
        style={[
          ss.badge,
          { backgroundColor: item.badgeBg, borderColor: item.badgeBdr },
        ]}
      >
        <Text style={[ss.badgeText, { color: item.badgeColor }]}>
          {item.badge}
        </Text>
      </View>
    </View>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;

  const username = auth?.username ?? "Użytkownik";
  const initials = username
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [lessons, setLessons] = useState<ApiLesson[]>([]);
  const [stats, setStats] = useState<HomeStats>({
    points: 0,
    activeOffersCount: 0,
    avgRating: null,
    ratingCount: 0,
  });

  const loadHomeData = useCallback(async () => {
    if (!auth?.userId) {
      setLessons([]);
      setStats({
        points: 0,
        activeOffersCount: 0,
        avgRating: null,
        ratingCount: 0,
      });
      return;
    }

    try {
      const [data, homeStats] = await Promise.all([
        trpc.getMyLessons.query({ userId: auth.userId }),
        trpc.getHomeStats.query({ userId: auth.userId }),
      ]);
      setLessons(
        (data as ApiLesson[]).filter((lesson) => lesson.status === "SCHEDULED"),
      );
      setStats(homeStats as HomeStats);
    } catch {
      setLessons([]);
      setStats({
        points: 0,
        activeOffersCount: 0,
        avgRating: null,
        ratingCount: 0,
      });
    }
  }, [auth?.userId]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const CALENDAR_DAYS: CalendarDay[] = useMemo(() => {
    const labels = ["ND", "PN", "WT", "ŚR", "CZ", "PT", "SB"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }).map((_, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() + index);
      let hasTeach = false;
      let hasLearn = false;
      lessons.forEach((l) => {
        const sd = new Date(l.scheduledAt);
        const sameDay =
          sd.getFullYear() === d.getFullYear() &&
          sd.getMonth() === d.getMonth() &&
          sd.getDate() === d.getDate();
        if (!sameDay) return;
        const isTeacher = l.teacherId === auth?.userId;
        if (isTeacher) {
          hasTeach = true;
        } else {
          hasLearn = true;
        }
      });

      const dotKind: CalendarDay["dotKind"] =
        hasTeach && hasLearn
          ? "both"
          : hasTeach
            ? "teach"
            : hasLearn
              ? "learn"
              : "none";

      return {
        dn: labels[d.getDay()],
        num: d.getDate(),
        dotKind,
        today: index === 0,
      };
    });
  }, [lessons, auth?.userId]);

  const calendarTitle = useMemo(() => {
    const now = new Date();
    const monthYear = now
      .toLocaleDateString("pl-PL", { month: "long", year: "numeric" })
      .replace(/^./, (s) => s.toUpperCase());
    return `Kalendarz - ${monthYear}`;
  }, []);

  const LESSONS: Lesson[] = useMemo(() => {
    const sorted = [...lessons].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    return sorted.slice(0, 6).map((lesson, idx) => {
      const date = new Date(lesson.scheduledAt);
      const today = new Date();
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow =
        date.getFullYear() === tomorrow.getFullYear() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getDate() === tomorrow.getDate();

      const day = isToday
        ? "dziś"
        : isTomorrow
          ? "jutro"
          : date
              .toLocaleDateString("pl-PL", { weekday: "short" })
              .toUpperCase();

      const isTeacher = auth?.userId === lesson.teacherId;
      const peer = isTeacher ? lesson.studentUsername : lesson.teacherUsername;

      return {
        id: lesson.id,
        time: date.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        day,
        title: lesson.offerTitle,
        meta: `z: ${peer} · ${lesson.durationMinutes} min`,
        dot: isTeacher ? C.lime : C.cyan,
        badge: isTeacher ? "daję" : "biorę",
        badgeBg: isTeacher ? C.limeBg : C.cyanBg,
        badgeColor: isTeacher ? C.lime : C.cyan,
        badgeBdr: isTeacher ? C.limeBdr : C.cyanBdr,
        isNext: idx === 0,
      };
    });
  }, [lessons, auth?.userId, C]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      {/* TOP NAVBAR */}
      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[
            ss.profileBtn,
            { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
          ]}
          onPress={() => router.push("/profile" as any)}
        >
          <Text style={[ss.profileInitials, { color: C.cyan }]}>
            {initials}
          </Text>
          <View
            style={[
              ss.notifDot,
              { backgroundColor: C.lime, borderColor: C.bg },
            ]}
          />
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/bartec_logotyp.png")}
          style={ss.logo}
          resizeMode="contain"
        />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={ss.scroll}
        contentContainerStyle={ss.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={ss.greeting}>
          <Text style={[ss.greetSub, { color: C.text3 }]}>Dzień dobry</Text>
          <Text style={[ss.greetName, { color: C.text1 }]}>{username}</Text>
        </View>

        {/* PANELS ROW */}
        <View style={ss.panelsRow}>
          {/* LEFT */}
          <View
            style={[
              ss.panel,
              ss.panelLeft,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <Text style={[ss.panelLabel, { color: C.text3 }]}>Twoje konto</Text>
            <View>
              <Text style={[ss.ptsLabel, { color: C.text3 }]}>
                punkty reputacji
              </Text>
              <View style={ss.ptsRow}>
                <Text style={[ss.ptsNum, { color: C.amber }]}>
                  {stats.points}
                </Text>
                <Text style={[ss.ptsUnit, { color: C.amber }]}>pkt</Text>
              </View>
            </View>
            <View style={ss.miniStats}>
              {[
                {
                  label: "ofert aktywnych",
                  val: String(stats.activeOffersCount),
                  color: C.lime,
                  w: `${Math.min(100, Math.max(8, stats.activeOffersCount * 15))}%`,
                },
                {
                  label: "średnia ocen",
                  val: `${stats.avgRating ? stats.avgRating.toFixed(1) : "-"} ★`,
                  color: C.amber,
                  w: `${Math.min(100, Math.max(8, (stats.avgRating ?? 0) * 20))}%`,
                },
                {
                  label: "ocenionych lekcji",
                  val: String(stats.ratingCount),
                  color: C.cyan,
                  w: `${Math.min(100, Math.max(8, stats.ratingCount * 10))}%`,
                },
              ].map(({ label, val, color, w }) => (
                <View key={label} style={ss.miniStat}>
                  <View style={ss.miniStatRow}>
                    <Text style={[ss.miniLabel, { color: C.text3 }]}>
                      {label}
                    </Text>
                    <Text style={[ss.miniVal, { color }]}>{val}</Text>
                  </View>
                  <View style={[ss.progressBg, { backgroundColor: C.border }]}>
                    <View
                      style={[
                        ss.progressFill,
                        { width: w as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
            <View
              style={[
                ss.rankBadge,
                { backgroundColor: C.amberBg, borderColor: C.amberBdr },
              ]}
            >
              <Text style={ss.rankIcon}>🏅</Text>
              <View>
                <Text style={[ss.rankText, { color: C.amber }]}>
                  Ekspert Matematyki
                </Text>
                <Text style={[ss.rankSub, { color: C.text3 }]}>
                  top 5% · 3 odznaki
                </Text>
              </View>
            </View>
          </View>

          {/* RIGHT */}
          <View
            style={[
              ss.panel,
              ss.panelRight,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <Text style={[ss.panelLabel, { color: C.text3 }]}>
              Szybkie akcje
            </Text>
            {[
              {
                icon: "📝",
                label: "Nowa oferta",
                sub: "dodaj ogłoszenie",
                bg: C.cyanBg,
                bdr: C.cyanBdr,
                onPress: () => router.push("/my-offers" as any),
              },
              {
                icon: "🔍",
                label: "Szukaj wymiany",
                sub: "przeglądaj oferty",
                bg: C.limeBg,
                bdr: C.limeBdr,
                onPress: () => router.push("/offers" as any),
              },
              {
                icon: "📋",
                label: "Historia",
                sub: "twoje sesje",
                bg: C.amberBg,
                bdr: C.amberBdr,
                onPress: () => router.push("/my-offers" as any),
              },
            ].map(({ icon, label, sub, bg, bdr, onPress }) => (
              <TouchableOpacity
                key={label}
                style={[
                  ss.actionBtn,
                  { backgroundColor: bg, borderColor: bdr },
                ]}
                activeOpacity={0.75}
                onPress={onPress}
              >
                <Text style={ss.actionIcon}>{icon}</Text>
                <Text style={[ss.actionLabel, { color: C.text1 }]}>
                  {label}
                </Text>
                <Text style={[ss.actionSub, { color: C.text3 }]}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CALENDAR */}
        <SectionHeader
          title={calendarTitle}
          onMore={() => router.push("/calendar" as any)}
          C={C}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ss.calStrip}
        >
          {CALENDAR_DAYS.map((d) => (
            <CalDay key={d.num} item={d} C={C} />
          ))}
        </ScrollView>

        {/* UPCOMING */}
        <SectionHeader title="Nadchodzące spotkania" onMore={() => {}} C={C} />
        <View style={ss.lessonsList}>
          {LESSONS.length > 0 ? (
            LESSONS.map((l) => <LessonCard key={l.id} item={l} C={C} />)
          ) : (
            <View
              style={[
                ss.lessonCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              <Text style={[ss.lMeta, { color: C.text3, marginTop: 0 }]}>
                Brak zaplanowanych lekcji
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── STATIC STYLES ─────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: { fontSize: 11, fontWeight: "600", fontFamily: "monospace" },
  notifDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  logo: { height: 28, width: 120 },

  greeting: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  greetSub: {
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 2,
  },
  greetName: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },

  panelsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
  panel: { borderWidth: 1, borderRadius: 18, padding: 14 },
  panelLeft: { flex: 1.05 },
  panelRight: { flex: 0.95, gap: 8 },
  panelLabel: {
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  ptsLabel: { fontSize: 8, fontFamily: "monospace", marginBottom: 4 },
  ptsRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  ptsNum: { fontSize: 30, fontWeight: "700", lineHeight: 34 },
  ptsUnit: { fontSize: 10, opacity: 0.6, fontFamily: "monospace" },

  miniStats: { gap: 7, marginTop: 6 },
  miniStat: { gap: 3 },
  miniStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniLabel: { fontSize: 9, fontFamily: "monospace" },
  miniVal: { fontSize: 10, fontWeight: "500", fontFamily: "monospace" },
  progressBg: { height: 3, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },

  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    padding: 7,
    marginTop: 6,
  },
  rankIcon: { fontSize: 14 },
  rankText: { fontSize: 9, fontFamily: "monospace" },
  rankSub: { fontSize: 8, fontFamily: "monospace", marginTop: 1 },

  actionBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    justifyContent: "flex-end",
    minHeight: 72,
  },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: 10, fontWeight: "500", fontFamily: "monospace" },
  actionSub: { fontSize: 8, fontFamily: "monospace", marginTop: 1 },

  secHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  secTitle: {
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  secMore: { fontSize: 10, fontFamily: "monospace" },

  calStrip: { paddingHorizontal: 20, gap: 7 },
  calDay: {
    width: 44,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  calDn: { fontSize: 9, fontFamily: "monospace", letterSpacing: 0.5 },
  calNum: { fontSize: 17, fontWeight: "700", lineHeight: 20 },
  eventDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  lessonsList: { paddingHorizontal: 20, gap: 8 },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  timeCol: { width: 38, alignItems: "center" },
  lTime: { fontSize: 11, fontWeight: "500", fontFamily: "monospace" },
  lDay: { fontSize: 8, fontFamily: "monospace", marginTop: 2 },
  lDivider: { width: 1, alignSelf: "stretch" },
  lDot: { width: 8, height: 8, borderRadius: 4 },
  lInfo: { flex: 1 },
  lTitle: { fontSize: 12, fontWeight: "400" },
  lMeta: { fontSize: 9, fontFamily: "monospace", marginTop: 3 },
  badge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 8, fontFamily: "monospace", fontWeight: "500" },
});

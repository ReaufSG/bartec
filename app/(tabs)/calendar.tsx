import { DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  scheduleConfirmed?: boolean;
};

type DayDot = "none" | "teach" | "learn" | "both";

type CalendarCell = {
  key: string;
  day: number | null;
  inMonth: boolean;
  isToday: boolean;
  dot: DayDot;
  dateKey?: string;
};

const MONTH_RANGE = 36;
const INITIAL_INDEX = MONTH_RANGE;
const MONTH_OFFSETS = Array.from(
  { length: MONTH_RANGE * 2 + 1 },
  (_, i) => i - MONTH_RANGE,
);
const DAY_LABELS = ["PN", "WT", "ŚR", "CZ", "PT", "SB", "ND"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOnMonday(day: number): number {
  return day === 0 ? 6 : day - 1;
}

export default function FullCalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;
  const { width } = useWindowDimensions();

  const [lessons, setLessons] = useState<ApiLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    if (!auth?.userId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await trpc.getMyLessons.query({ userId: auth.userId });
      setLessons(data as ApiLesson[]);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadLessons();
    }, [loadLessons]),
  );

  const dotsByDay = useMemo(() => {
    const map = new Map<string, { teach: boolean; learn: boolean }>();

    lessons
      .filter((lesson) => !!lesson.scheduledAt)
      .forEach((lesson) => {
        const date = new Date(lesson.scheduledAt);
        if (Number.isNaN(date.getTime())) return;
        const key = toDateKey(date);
        const current = map.get(key) ?? { teach: false, learn: false };
        const isTeacher = lesson.teacherId === auth?.userId;
        if (isTeacher) {
          current.teach = true;
        } else {
          current.learn = true;
        }
        map.set(key, current);
      });

    return map;
  }, [lessons, auth?.userId]);

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, ApiLesson[]>();

    lessons
      .filter((lesson) => !!lesson.scheduledAt)
      .forEach((lesson) => {
        const d = new Date(lesson.scheduledAt);
        if (Number.isNaN(d.getTime())) return;
        const key = toDateKey(d);
        const group = map.get(key) ?? [];
        group.push(lesson);
        map.set(key, group);
      });

    map.forEach((arr) => {
      arr.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    });

    return map;
  }, [lessons]);

  const activeMonthDate = useMemo(() => {
    const offset = MONTH_OFFSETS[activeIndex] ?? 0;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  }, [activeIndex]);

  useEffect(() => {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === activeMonthDate.getFullYear() &&
      today.getMonth() === activeMonthDate.getMonth();
    const defaultDay = sameMonth ? today.getDate() : 1;
    setSelectedDateKey(
      toDateKey(
        new Date(
          activeMonthDate.getFullYear(),
          activeMonthDate.getMonth(),
          defaultDay,
        ),
      ),
    );
  }, [activeMonthDate]);

  const monthTitle = useMemo(() => {
    return activeMonthDate
      .toLocaleDateString("pl-PL", { month: "long", year: "numeric" })
      .replace(/^./, (s) => s.toUpperCase());
  }, [activeMonthDate]);

  const selectedDayLessons = useMemo(() => {
    if (!selectedDateKey) return [];
    return lessonsByDay.get(selectedDateKey) ?? [];
  }, [lessonsByDay, selectedDateKey]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDateKey) return "Wybrany dzień";
    const d = new Date(selectedDateKey);
    if (Number.isNaN(d.getTime())) return "Wybrany dzień";
    return d.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [selectedDateKey]);

  const pageWidth = width;

  return (
    <View
      style={[ss.screen, { backgroundColor: C.bg, paddingTop: insets.top + 8 }]}
    >
      <View style={ss.headerRow}>
        <TouchableOpacity
          style={[
            ss.backBtn,
            { borderColor: C.border2, backgroundColor: C.surface },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[ss.backBtnText, { color: C.text1 }]}>←</Text>
        </TouchableOpacity>
        <View style={ss.headerTextWrap}>
          <Text style={[ss.headerKicker, { color: C.text3 }]}>
            Pełny kalendarz
          </Text>
          <Text style={[ss.headerTitle, { color: C.text1 }]}>{monthTitle}</Text>
        </View>
      </View>

      <View
        style={[
          ss.legend,
          { borderColor: C.border, backgroundColor: C.surface },
        ]}
      >
        <View style={ss.legendItem}>
          <View style={[ss.legendDot, { backgroundColor: C.lime }]} />
          <Text style={[ss.legendText, { color: C.text3 }]}>uczysz</Text>
        </View>
        <View style={ss.legendItem}>
          <View style={[ss.legendDot, { backgroundColor: C.cyan }]} />
          <Text style={[ss.legendText, { color: C.text3 }]}>uczysz się</Text>
        </View>
        <View style={ss.legendItem}>
          <View style={[ss.legendDot, { backgroundColor: C.amber }]} />
          <Text style={[ss.legendText, { color: C.text3 }]}>oba</Text>
        </View>
      </View>

      <View style={ss.daysRow}>
        {DAY_LABELS.map((label) => (
          <Text key={label} style={[ss.dayLabel, { color: C.text3 }]}>
            {label}
          </Text>
        ))}
      </View>

      {loading ? (
        <View style={ss.loaderWrap}>
          <ActivityIndicator size="large" color={C.cyan} />
        </View>
      ) : (
        <FlatList
          data={MONTH_OFFSETS}
          keyExtractor={(item) => String(item)}
          horizontal
          pagingEnabled
          initialScrollIndex={INITIAL_INDEX}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
            setActiveIndex(idx);
          }}
          renderItem={({ item: monthOffset }) => {
            const now = new Date();
            const monthDate = new Date(
              now.getFullYear(),
              now.getMonth() + monthOffset,
              1,
            );
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();

            const firstOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const leading = startOnMonday(firstOfMonth.getDay());
            const trailing = (7 - ((leading + daysInMonth) % 7)) % 7;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const cells: CalendarCell[] = [];

            for (let i = 0; i < leading; i += 1) {
              cells.push({
                key: `p-${year}-${month}-${i}`,
                day: null,
                inMonth: false,
                isToday: false,
                dot: "none",
              });
            }

            for (let day = 1; day <= daysInMonth; day += 1) {
              const d = new Date(year, month, day);
              const key = toDateKey(d);
              const dotInfo = dotsByDay.get(key);
              const dot: DayDot = dotInfo
                ? dotInfo.teach && dotInfo.learn
                  ? "both"
                  : dotInfo.teach
                    ? "teach"
                    : "learn"
                : "none";

              cells.push({
                key: `c-${year}-${month}-${day}`,
                day,
                inMonth: true,
                isToday: d.getTime() === today.getTime(),
                dot,
                dateKey: key,
              });
            }

            for (let i = 1; i <= trailing; i += 1) {
              cells.push({
                key: `n-${year}-${month}-${i}`,
                day: null,
                inMonth: false,
                isToday: false,
                dot: "none",
              });
            }

            return (
              <View
                style={{
                  width: pageWidth,
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                }}
              >
                <View
                  style={[
                    ss.gridCard,
                    { borderColor: C.border, backgroundColor: C.surface },
                  ]}
                >
                  <View style={ss.gridWrap}>
                    {cells.map((cell) => {
                      const dotColor =
                        cell.dot === "teach"
                          ? C.lime
                          : cell.dot === "learn"
                            ? C.cyan
                            : cell.dot === "both"
                              ? C.amber
                              : "transparent";

                      return (
                        <View key={cell.key} style={ss.cell}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={!cell.inMonth || !cell.dateKey}
                            onPress={() => {
                              if (cell.dateKey)
                                setSelectedDateKey(cell.dateKey);
                            }}
                            style={[
                              ss.cellInner,
                              !cell.inMonth && ss.cellInnerEmpty,
                              cell.isToday && {
                                backgroundColor: C.cyanBg,
                                borderColor: C.cyanBdr,
                              },
                              selectedDateKey &&
                                cell.dateKey === selectedDateKey && {
                                  borderColor: C.amberBdr,
                                  backgroundColor: C.amberBg,
                                },
                            ]}
                          >
                            {cell.day != null ? (
                              <Text
                                style={[
                                  ss.cellText,
                                  { color: C.text1 },
                                  cell.isToday && { color: C.cyan },
                                  selectedDateKey &&
                                    cell.dateKey === selectedDateKey && {
                                      color: C.amber,
                                    },
                                ]}
                              >
                                {cell.day}
                              </Text>
                            ) : null}
                            {cell.dot !== "none" && (
                              <View
                                style={[
                                  ss.cellDot,
                                  { backgroundColor: dotColor },
                                ]}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {!loading && (
        <View
          style={[
            ss.bottomSheet,
            { borderColor: C.border, backgroundColor: C.surface },
          ]}
        >
          <Text style={[ss.bottomTitle, { color: C.text1 }]} numberOfLines={1}>
            {selectedDayLabel}
          </Text>
          <Text style={[ss.bottomSub, { color: C.text3 }]}>
            {selectedDayLessons.length > 0
              ? `${selectedDayLessons.length} lekcji`
              : "Brak lekcji w tym dniu"}
          </Text>

          <ScrollView
            style={ss.bottomList}
            contentContainerStyle={ss.bottomListContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedDayLessons.map((lesson) => {
              const d = new Date(lesson.scheduledAt);
              const isTeacher = lesson.teacherId === auth?.userId;
              const withUser = isTeacher
                ? lesson.studentUsername
                : lesson.teacherUsername;

              return (
                <View
                  key={lesson.id}
                  style={[
                    ss.lessonItem,
                    { borderColor: C.border2, backgroundColor: C.surface2 },
                  ]}
                >
                  <View style={ss.lessonItemTop}>
                    <Text style={[ss.lessonTime, { color: C.text1 }]}>
                      {d.toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text
                      style={[
                        ss.lessonStatus,
                        {
                          color:
                            lesson.status === "COMPLETED" ? C.lime : C.cyan,
                        },
                      ]}
                    >
                      {lesson.status === "COMPLETED"
                        ? "Wykonana"
                        : "Zaplanowana"}
                    </Text>
                  </View>
                  <Text
                    style={[ss.lessonTitle, { color: C.text1 }]}
                    numberOfLines={1}
                  >
                    {lesson.offerTitle}
                  </Text>
                  <Text style={[ss.lessonMeta, { color: C.text3 }]}>
                    {isTeacher ? "Uczeń" : "Nauczyciel"}: {withUser} ·{" "}
                    {lesson.durationMinutes} min
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 20, lineHeight: 22, fontFamily: "monospace" },
  headerTextWrap: { flex: 1 },
  headerKicker: {
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  legend: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: "monospace" },
  daysRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  dayLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 0.6,
  },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  gridCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 6,
  },
  gridWrap: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    padding: 2,
  },
  cellInner: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  cellInnerEmpty: {
    backgroundColor: "transparent",
  },
  cellText: { fontSize: 14, fontWeight: "600" },
  cellDot: { width: 7, height: 7, borderRadius: 4 },
  bottomSheet: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 170,
    maxHeight: 260,
  },
  bottomTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  bottomSub: { fontSize: 10, fontFamily: "monospace", marginBottom: 10 },
  bottomList: { flex: 1 },
  bottomListContent: { gap: 8, paddingBottom: 4 },
  lessonItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  lessonItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonTime: { fontSize: 12, fontWeight: "700", fontFamily: "monospace" },
  lessonStatus: { fontSize: 10, fontFamily: "monospace" },
  lessonTitle: { fontSize: 12, fontWeight: "600" },
  lessonMeta: { fontSize: 10, fontFamily: "monospace" },
});

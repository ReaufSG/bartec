import { DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatJoined(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type PointsRank = {
  medal: string;
  rankNo: string;
  topLabel: string;
};

function mapNameFont(
  font: "MONO" | "SANS" | "SERIF" | "DISPLAY" | "TECH" | undefined,
): string {
  if (font === "SANS") return "System";
  if (font === "SERIF") return "serif";
  if (font === "DISPLAY") return "serif";
  if (font === "TECH") return "monospace";
  return "monospace";
}

function mapBorderColor(
  C: typeof DARK,
  key: "CYAN" | "LIME" | "AMBER" | "ROSE" | "NAVY" | undefined,
): string {
  if (key === "LIME") return C.lime;
  if (key === "AMBER") return C.amber;
  if (key === "ROSE") return C.rose;
  if (key === "NAVY") return C.navy;
  return C.cyan;
}

function getPointsRank(
  rankPosition: number | null,
  totalUsers: number,
): PointsRank {
  if (!rankPosition) {
    return { medal: "🏅", rankNo: "#-", topLabel: "Top -" };
  }
  if (rankPosition === 1)
    return { medal: "🥇", rankNo: "#1", topLabel: "Top 1" };
  if (rankPosition === 2)
    return { medal: "🥈", rankNo: "#2", topLabel: "Top 2" };
  if (rankPosition === 3)
    return { medal: "🥉", rankNo: "#3", topLabel: "Top 3" };
  if (rankPosition === 4)
    return { medal: "🎖", rankNo: "#4", topLabel: "Top 4" };
  if (rankPosition === 5)
    return { medal: "🏅", rankNo: "#5", topLabel: "Top 5" };
  return {
    medal: "🏅",
    rankNo: `#${rankPosition}`,
    topLabel: `Top 5+/${Math.max(totalUsers, 1)}`,
  };
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const auth = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;

  const [notifications, setNotifications] = useState(true);
  const [ratingAvg, setRatingAvg] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileCreatedAt, setProfileCreatedAt] = useState<string | null>(null);
  const [nameFontKey, setNameFontKey] = useState<
    "MONO" | "SANS" | "SERIF" | "DISPLAY" | "TECH"
  >("MONO");
  const [borderColorKey, setBorderColorKey] = useState<
    "CYAN" | "LIME" | "AMBER" | "ROSE" | "NAVY"
  >("CYAN");
  const targetUserId = auth?.userId ?? null;

  useEffect(() => {
    AsyncStorage.getItem("notifications").then((val) => {
      if (val !== null) setNotifications(val !== "false");
    });
  }, []);

  const loadProfileData = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const profile = await trpc.getPublicProfile.query({
        userId: targetUserId,
      });
      setRatingAvg((profile as any).avgRating ?? null);
      setRatingCount((profile as any).ratingCount ?? 0);
      setPoints((profile as any).points ?? 0);
      setRankPosition((profile as any).rankPosition ?? null);
      setTotalUsers((profile as any).totalUsers ?? 0);
      setProfileUsername((profile as any).username ?? null);
      setProfileCreatedAt((profile as any).createdAt ?? null);
      setNameFontKey((profile as any).nameFont ?? "MONO");
      setBorderColorKey((profile as any).borderColor ?? "CYAN");
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się pobrać danych profilu");
    }
  }, [targetUserId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await AsyncStorage.setItem("notifications", String(val));
  };

  const displayName = auth?.username ?? "Użytkownik";
  const visibleName = profileUsername ?? displayName;
  const initials = visibleName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const joinedDate = formatJoined(
    new Date(profileCreatedAt ?? auth?.createdAt ?? Date.now()),
  );
  const pointsRank = useMemo(
    () => getPointsRank(rankPosition, totalUsers),
    [rankPosition, totalUsers],
  );
  const nameFont = useMemo(() => mapNameFont(nameFontKey), [nameFontKey]);
  const accountBorder = useMemo(
    () => mapBorderColor(C as typeof DARK, borderColorKey),
    [C, borderColorKey],
  );

  const handleLogout = () => {
    Alert.alert("Wyloguj się", "Na pewno chcesz się wylogować?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Wyloguj", style: "destructive", onPress: () => auth?.logout() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[s.navTitle, { color: C.text1 }]}>
          Pro<Text style={{ color: C.cyan }}>fil</Text>
        </Text>
        <TouchableOpacity
          style={[
            s.editBtn,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
          activeOpacity={0.7}
          onPress={loadProfileData}
        >
          <Text style={[s.editText, { color: C.text2 }]}>odśwież</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <View
          style={[
            s.avatarCard,
            { backgroundColor: C.surface, borderColor: accountBorder },
          ]}
        >
          <View
            style={[
              s.avatarCircle,
              { backgroundColor: C.cyanBg, borderColor: accountBorder },
            ]}
          >
            <Text style={[s.avatarInitials, { color: accountBorder }]}>
              {initials}
            </Text>
          </View>
          <View style={s.avatarInfo}>
            <Text
              style={[s.userName, { color: C.text1, fontFamily: nameFont }]}
            >
              {visibleName}
            </Text>
            <View
              style={[
                s.rankBadge,
                { backgroundColor: C.amberBg, borderColor: C.amberBdr },
              ]}
            >
              <Text style={s.rankIcon}>{pointsRank.medal}</Text>
              <Text style={[s.rankText, { color: C.amber }]}>
                Ranking punktów {pointsRank.rankNo} · {pointsRank.topLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.statsRow}>
          <View
            style={[
              s.statCell,
              { backgroundColor: C.surface, borderColor: C.amberBdr },
            ]}
          >
            <Text style={[s.statNum, { color: C.amber }]}>{points}</Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>punktów</Text>
          </View>
          <View
            style={[
              s.statCell,
              { backgroundColor: C.surface, borderColor: C.cyanBdr },
            ]}
          >
            <Text style={[s.statNum, { color: C.cyan }]}>{ratingCount}</Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>ocen</Text>
          </View>
          <View
            style={[
              s.statCell,
              { backgroundColor: C.surface, borderColor: C.limeBdr },
            ]}
          >
            <Text style={[s.statNum, { color: C.lime }]}>
              {ratingAvg ? ratingAvg.toFixed(1) : "-"} ★
            </Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>średnia ★</Text>
          </View>
        </View>

        <Text style={[s.sectionLabel, { color: C.text3 }]}>Dane konta</Text>
        <View
          style={[
            s.card,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <View style={s.infoRow}>
            <Text style={[s.infoLabel, { color: C.text3 }]}>Dołączył</Text>
            <Text style={[s.infoValue, { color: C.text1 }]}>{joinedDate}</Text>
          </View>
        </View>

        <Text style={[s.sectionLabel, { color: C.text3 }]}>Ustawienia</Text>
        <View
          style={[
            s.card,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <Text style={s.settingIcon}>🔔</Text>
              <View>
                <Text style={[s.settingLabel, { color: C.text1 }]}>
                  Powiadomienia
                </Text>
                <Text style={[s.settingSub, { color: C.text3 }]}>
                  {notifications ? "włączone" : "wyłączone"}
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: C.border2, true: C.limeBg }}
              thumbColor={notifications ? C.lime : C.text3}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            s.logoutBtn,
            { backgroundColor: C.roseBg, borderColor: C.roseBdr },
          ]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={[s.logoutText, { color: C.rose }]}>Wyloguj się</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  editBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editText: { fontSize: 10, fontFamily: "monospace" },

  avatarCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 22, fontWeight: "700", fontFamily: "monospace" },
  avatarInfo: { flex: 1, gap: 8 },
  userName: { fontSize: 16, fontWeight: "600" },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  rankIcon: { fontSize: 12 },
  rankText: { fontSize: 9, fontFamily: "monospace" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 18, fontWeight: "700", fontFamily: "monospace" },
  statLabel: { fontSize: 8, fontFamily: "monospace", letterSpacing: 0.5 },

  sectionLabel: {
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoLabel: { fontSize: 11, fontFamily: "monospace" },
  infoValue: {
    fontSize: 11,
    fontFamily: "monospace",
    flex: 1,
    textAlign: "right",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: { fontSize: 18 },
  settingLabel: { fontSize: 12, fontFamily: "monospace" },
  settingSub: { fontSize: 9, fontFamily: "monospace", marginTop: 2 },

  logoutBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { fontSize: 13, fontFamily: "monospace", fontWeight: "500" },
});

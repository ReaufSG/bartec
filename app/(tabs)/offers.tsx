import { Colors, DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Offer = {
  id: string;
  title: string;
  description: string;
  makerId: string;
  makerUsername?: string;
  maker?: { username?: string };
  username?: string;
  createdAt: string;
  updatedAt: string;
};

const FILTERS = [
  { key: "all", label: "Wszystkie" },
  { key: "mat", label: "Matematyka" },
  { key: "fiz", label: "Fizyka" },
  { key: "chem", label: "Chemia" },
  { key: "bio", label: "Biologia" },
  { key: "hist", label: "Historia" },
  { key: "ang", label: "Angielski" },
  { key: "pol", label: "Polski" },
  { key: "inf", label: "Informatyka" },
  { key: "geo", label: "Geografia" },
  { key: "szt", label: "Sztuka" },
];

const SUBJECT_MATCH: Record<string, string[]> = {
  mat: ["matematyka", "matma", "algebra", "geometria"],
  fiz: ["fizyka", "mechanika", "termodynamika", "elektrycznosc"],
  chem: ["chemia", "chemii", "chemicz", "organiczna"],
  bio: ["biologia", "biologii", "genetyka", "anatomia"],
  hist: ["historia", "history"],
  ang: ["angielski", "english", "ang"],
  pol: ["polski", "jezyk polski", "lektura", "gramatyka"],
  inf: ["informatyka", "programowanie", "python", "algorytm"],
  geo: ["geografia", "mapa", "geolog"],
  szt: ["sztuka", "rysunek", "malarstwo", "plastyka"],
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatTime(date: string): string {
  const d = new Date(date);
  const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "przed chwilą";
  if (diffH < 24) return `${diffH} godz. temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return d.toLocaleDateString("pl-PL");
}

function getInitials(username?: string): string {
  const cleaned = username?.trim() ?? "";
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

function OfferCard({
  item,
  C,
  onAccept,
  onDelete,
  isOwn,
  accepting,
  deleting,
}: {
  item: Offer;
  C: Colors;
  onAccept: (id: string) => void;
  onDelete: (id: string) => void;
  isOwn: boolean;
  accepting: boolean;
  deleting: boolean;
}) {
  const isTeach = item.title.startsWith("Uczę:");
  const badgeBg = isTeach ? C.cyanBg : C.limeBg;
  const badgeBdr = isTeach ? C.cyanBdr : C.limeBdr;
  const badgeCol = isTeach ? C.cyan : C.lime;
  const authorName =
    item.makerUsername?.trim() ||
    item.maker?.username?.trim() ||
    item.username?.trim() ||
    `użytkownik ${item.makerId.slice(0, 6)}`;

  return (
    <View
      style={[ss.card, { backgroundColor: C.surface, borderColor: C.border }]}
    >
      <View style={ss.cardTop}>
        <View
          style={[
            ss.typeBadge,
            { backgroundColor: badgeBg, borderColor: badgeBdr },
          ]}
        >
          <Text style={[ss.typeTxt, { color: badgeCol }]}>
            {isTeach ? "🎓 uczy" : "📚 szuka nauki"}
          </Text>
        </View>
        <Text style={[ss.cardTime, { color: C.text3 }]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>

      <Text style={[ss.cardTitle, { color: C.text1 }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[ss.cardDesc, { color: C.text2 }]} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={[ss.cardFooter, { borderTopColor: C.border }]}>
        <View style={ss.authorWrap}>
          <View
            style={[
              ss.authorAvatar,
              { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
            ]}
          >
            <Text style={[ss.authorAvatarTxt, { color: C.cyan }]}>
              {getInitials(authorName)}
            </Text>
          </View>
          <Text style={[ss.authorName, { color: C.text3 }]} numberOfLines={1}>
            {authorName}
          </Text>
        </View>
        {!isOwn && (
          <TouchableOpacity
            style={[
              ss.acceptBtn,
              { backgroundColor: C.limeBg, borderColor: C.limeBdr },
              accepting && { opacity: 0.6 },
            ]}
            activeOpacity={0.75}
            onPress={() => onAccept(item.id)}
            disabled={accepting}
          >
            {accepting ? (
              <ActivityIndicator color={C.lime} size="small" />
            ) : (
              <Text style={[ss.acceptTxt, { color: C.lime }]}>
                {isTeach ? "chcę się uczyć ✓" : "mogę nauczyć ✓"}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {isOwn && (
          <TouchableOpacity
            style={[
              ss.deleteBtn,
              { backgroundColor: C.roseBg, borderColor: C.roseBdr },
              deleting && { opacity: 0.6 },
            ]}
            activeOpacity={0.75}
            onPress={() => onDelete(item.id)}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={C.rose} size="small" />
            ) : (
              <Text style={[ss.deleteTxt, { color: C.rose }]}>usuń</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function Explore() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;
  const auth = useContext(TokenContext);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchOffers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const all = await trpc.fetchOffers.query();
      const normalized = (all as Offer[]).map((o) => ({
        ...o,
        makerUsername: o.makerUsername ?? o.maker?.username ?? o.username,
      }));
      setOffers(normalized);
    } catch (e: any) {
      setError(e?.message ?? "Błąd pobierania ofert");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers(true);
    }, [fetchOffers]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers(true);
  };

  const handleAccept = async (offerId: string) => {
    if (!auth?.userId) {
      Alert.alert("Błąd", "Nie jesteś zalogowany");
      return;
    }
    setAccepting(offerId);
    try {
      await trpc.accept.mutate({ offerId, takerId: auth.userId });
      Alert.alert(
        "Sukces!",
        "Zaakceptowałeś ofertę. Skontaktuj się z autorem przez czat.",
      );
      await fetchOffers(true);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się zaakceptować");
    } finally {
      setAccepting(null);
    }
  };

  const handleDelete = (offerId: string) => {
    if (!auth?.userId) {
      Alert.alert("Błąd", "Nie jesteś zalogowany");
      return;
    }
    const offer = offers.find((o) => o.id === offerId);
    if (!offer || offer.makerId !== auth.userId) {
      Alert.alert("Błąd", "Możesz usunąć tylko własną ofertę");
      return;
    }

    Alert.alert("Usuń ofertę", "Na pewno chcesz usunąć tę ofertę?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          setDeleting(offerId);
          try {
            await trpc.deleteOffer.mutate({
              id: offerId,
              makerId: auth.userId,
            });
            await fetchOffers(true);
          } catch (e: any) {
            Alert.alert("Błąd", e?.message ?? "Nie udało się usunąć oferty");
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const offersWithoutOwn = auth?.userId
    ? offers.filter((o) => o.makerId !== auth.userId)
    : offers;

  const filtered =
    filter === "all"
      ? offersWithoutOwn
      : offersWithoutOwn.filter((o) => {
          const haystack = normalizeText(`${o.title} ${o.description}`);
          const needles = SUBJECT_MATCH[filter] ?? [filter];
          return needles.some((needle) =>
            haystack.includes(normalizeText(needle)),
          );
        });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[ss.navTitle, { color: C.text1 }]}>
          Ofer<Text style={{ color: C.cyan }}>ty</Text>
        </Text>
        <View
          style={[
            ss.countBadge,
            { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
          ]}
        >
          <Text style={[ss.countText, { color: C.cyan }]}>
            {loading ? "..." : `${filtered.length} aktywnych`}
          </Text>
        </View>
      </View>

      <View style={ss.filterWrap}>
        <TouchableOpacity
          style={[
            ss.filterTrigger,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
          onPress={() => setFilterOpen((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={[ss.filterTriggerLabel, { color: C.text3 }]}>
            Filtr przedmiotu
          </Text>
          <View style={ss.filterTriggerRight}>
            <Text style={[ss.filterTriggerValue, { color: C.cyan }]}>
              {activeFilter.label}
            </Text>
            <Text style={[ss.filterChevron, { color: C.text3 }]}>
              {filterOpen ? "▴" : "▾"}
            </Text>
          </View>
        </TouchableOpacity>

        {filterOpen && (
          <View
            style={[
              ss.filterMenu,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            {FILTERS.map((f) => {
              const active = f.key === filter;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    ss.filterMenuItem,
                    active && {
                      backgroundColor: C.cyanBg,
                      borderColor: C.cyanBdr,
                    },
                  ]}
                  onPress={() => {
                    setFilter(f.key);
                    setFilterOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      ss.filterMenuText,
                      { color: active ? C.cyan : C.text2 },
                    ]}
                  >
                    {f.label}
                  </Text>
                  {active && (
                    <Text style={[ss.filterMenuTick, { color: C.cyan }]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {loading ? (
        <View style={ss.center}>
          <ActivityIndicator color={C.cyan} size="large" />
        </View>
      ) : error ? (
        <View style={ss.center}>
          <Text style={[ss.errorTxt, { color: C.rose }]}>{error}</Text>
          <TouchableOpacity
            style={[
              ss.retryBtn,
              { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
            ]}
            onPress={() => fetchOffers()}
          >
            <Text style={[ss.retryTxt, { color: C.cyan }]}>
              spróbuj ponownie
            </Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={ss.center}>
          <Text style={ss.emptyEmoji}>🔍</Text>
          <Text style={[ss.emptyTitle, { color: C.text2 }]}>Brak ofert</Text>
          <Text style={[ss.emptySub, { color: C.text3 }]}>
            Zmień filtr lub wróć później
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={ss.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={C.cyan}
            />
          }
          renderItem={({ item }) => (
            <OfferCard
              item={item}
              C={C}
              onAccept={handleAccept}
              onDelete={handleDelete}
              isOwn={item.makerId === auth?.userId}
              accepting={accepting === item.id}
              deleting={deleting === item.id}
            />
          )}
        />
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  navTitle: { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  countBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { fontSize: 10, fontFamily: "monospace" },

  filterWrap: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterTrigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTriggerLabel: { fontSize: 10, fontFamily: "monospace" },
  filterTriggerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  filterTriggerValue: {
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  filterChevron: { fontSize: 11, fontFamily: "monospace" },
  filterMenu: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 4,
  },
  filterMenuItem: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterMenuText: { fontSize: 11, fontFamily: "monospace", fontWeight: "500" },
  filterMenuTick: { fontSize: 11, fontFamily: "monospace", fontWeight: "700" },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTxt: { fontSize: 13, fontFamily: "monospace", textAlign: "center" },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryTxt: { fontSize: 11, fontFamily: "monospace" },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "monospace",
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTxt: { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },
  cardTime: { fontSize: 9, fontFamily: "monospace" },
  cardTitle: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  cardDesc: { fontSize: 11, fontFamily: "monospace", lineHeight: 16 },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  authorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  authorAvatarTxt: { fontSize: 9, fontFamily: "monospace", fontWeight: "700" },
  authorName: { fontSize: 9, fontFamily: "monospace", flexShrink: 1 },
  acceptBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: "center",
  },
  acceptTxt: { fontSize: 10, fontFamily: "monospace", fontWeight: "500" },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: "center",
  },
  deleteTxt: { fontSize: 10, fontFamily: "monospace", fontWeight: "500" },
});

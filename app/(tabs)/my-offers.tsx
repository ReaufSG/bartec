import AddOfferModal from "@/components/AddOfferModal";
import { Colors, DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Offer = {
  id: string;
  title: string;
  description: string;
  makerId: string;
  createdAt: string;
  updatedAt: string;
};

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "przed chwilą";
  if (diffH < 24) return `${diffH} godz. temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return d.toLocaleDateString("pl-PL");
}

function OfferRow({
  item,
  C,
  onDelete,
  onEdit,
}: {
  item: Offer;
  C: Colors;
  onDelete: (id: string) => void;
  onEdit: (item: Offer) => void;
}) {
  const isTeach = item.title.startsWith("Uczę:");
  const badgeBg = isTeach ? C.cyanBg : C.limeBg;
  const badgeBdr = isTeach ? C.cyanBdr : C.limeBdr;
  const badgeCol = isTeach ? C.cyan : C.lime;

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
            {isTeach ? "🎓 uczę" : "📚 szukam"}
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
        <Text style={[ss.footerId, { color: C.text3 }]}>
          id: {item.id.slice(0, 8)}...
        </Text>
        <View style={ss.actions}>
          <TouchableOpacity
            style={[
              ss.editBtn,
              { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
            ]}
            activeOpacity={0.7}
            onPress={() => onEdit(item)}
          >
            <Text style={[ss.editTxt, { color: C.cyan }]}>edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ss.deleteBtn,
              { backgroundColor: C.roseBg, borderColor: C.roseBdr },
            ]}
            activeOpacity={0.7}
            onPress={() => onDelete(item.id)}
          >
            <Text style={[ss.deleteTxt, { color: C.rose }]}>usuń</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MyOffers() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;
  const auth = useContext(TokenContext);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Offer | null>(null);

  const fetchOffers = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const all = await trpc.fetchOffers.query();
      const mine = auth?.userId
        ? all.filter((o: Offer) => o.makerId === auth.userId)
        : all;
      setOffers(mine);
    } catch (e: any) {
      setError(e?.message ?? "Błąd pobierania ofert");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers(true);
  };

  const handleDelete = (id: string) => {
    if (!auth?.userId) {
      Alert.alert("Błąd", "Nie jesteś zalogowany");
      return;
    }

    Alert.alert("Usuń ofertę", "Na pewno chcesz usunąć tę ofertę?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          try {
            await trpc.deleteOffer.mutate({ id, makerId: auth.userId });
            await fetchOffers(true);
          } catch (e: any) {
            Alert.alert("Błąd", e?.message ?? "Nie udało się usunąć");
          }
        },
      },
    ]);
  };

  const handleEdit = (item: Offer) => {
    setEditTarget(item);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditTarget(null);
  };

  const handleSubmit = async (data: {
    type: "teach" | "learn";
    subject: string;
    description: string;
  }) => {
    if (!auth?.userId) throw new Error("Nie jesteś zalogowany");

    const subjectMap: Record<string, string> = {
      mat: "Matematyka",
      fiz: "Fizyka",
      chem: "Chemia",
      bio: "Biologia",
      hist: "Historia",
      geo: "Geografia",
      ang: "Angielski",
      pol: "Polski",
      inf: "Informatyka",
      szt: "Sztuka",
      muz: "Muzyka",
      wf: "W-F",
    };
    const subjectLabel = subjectMap[data.subject] ?? data.subject;
    const title =
      data.type === "teach"
        ? `Uczę: ${subjectLabel}`
        : `Szukam nauki: ${subjectLabel}`;

    if (editTarget) {
      await trpc.updateOffer.mutate({
        id: editTarget.id,
        title,
        description: data.description,
      });
    } else {
      await trpc.postOffer.mutate({
        title,
        description: data.description,
        makerId: auth.userId,
      });
    }
    await fetchOffers(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[ss.navTitle, { color: C.text1 }]}>
            Moje <Text style={{ color: C.cyan }}>oferty</Text>
          </Text>
          <Text style={[ss.navSub, { color: C.text3 }]}>
            {loading ? "..." : `${offers.length} aktywnych`}
          </Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: C.cyan }]}
          activeOpacity={0.75}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[ss.addBtnText, { color: C.bg }]}>+ nowa oferta</Text>
        </TouchableOpacity>
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
      ) : offers.length === 0 ? (
        <View style={ss.center}>
          <Text style={ss.emptyEmoji}>📋</Text>
          <Text style={[ss.emptyTitle, { color: C.text2 }]}>
            Brak aktywnych ofert
          </Text>
          <Text style={[ss.emptySub, { color: C.text3 }]}>
            Dodaj pierwszą ofertę i zacznij wymieniać wiedzę
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
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
            <OfferRow
              item={item}
              C={C}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        />
      )}

      <AddOfferModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editTarget={
          editTarget
            ? {
                type: editTarget.title.startsWith("Uczę:") ? "teach" : "learn",
                subject:
                  editTarget.title.split(": ")[1]?.toLowerCase().slice(0, 3) ??
                  "",
                description: editTarget.description,
              }
            : null
        }
      />
    </View>
  );
}

const ss = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  navTitle: { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  navSub: { fontSize: 9, fontFamily: "monospace", marginTop: 2 },
  addBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 11, fontWeight: "600", fontFamily: "monospace" },

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
  footerId: { fontSize: 8, fontFamily: "monospace" },
  actions: { flexDirection: "row", gap: 6 },
  editBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editTxt: { fontSize: 10, fontFamily: "monospace" },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteTxt: { fontSize: 10, fontFamily: "monospace" },
});

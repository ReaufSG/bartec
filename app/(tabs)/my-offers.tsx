import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#05070d",
  surface: "#0d1221",
  surface2: "#090d18",
  border: "rgba(80,120,180,0.14)",
  border2: "rgba(80,120,180,0.26)",
  text1: "#e8eef8",
  text2: "#8fa8cc",
  text3: "#4d6485",
  cyan: "#5bc8e8",
  cyanBg: "rgba(91,200,232,0.08)",
  cyanBdr: "rgba(91,200,232,0.22)",
  lime: "#a8e063",
  limeBg: "rgba(168,224,99,0.08)",
  limeBdr: "rgba(168,224,99,0.22)",
  amber: "#f5c842",
  amberBg: "rgba(245,200,66,0.08)",
  amberBdr: "rgba(245,200,66,0.22)",
  rose: "#e8637a",
  roseBg: "rgba(232,99,122,0.08)",
  roseBdr: "rgba(232,99,122,0.22)",
  navy: "#2e4268",
};

type MyOffer = {
  id: string;
  emoji: string;
  title: string;
  gives: string;
  wants: string;
  views: number;
  matches: number;
  time: string;
  tagColor: string;
  tagBg: string;
  tagBdr: string;
};

const MY_OFFERS: MyOffer[] = [
  {
    id: "1",
    emoji: "📐",
    title: "Całkowanie i granice — analiza matematyczna",
    gives: "Matematyka",
    wants: "Angielski B2",
    views: 24,
    matches: 3,
    time: "2 godz. temu",
    tagColor: C.cyan,
    tagBg: C.cyanBg,
    tagBdr: C.cyanBdr,
  },
  {
    id: "2",
    emoji: "📐",
    title: "Równania różniczkowe — poziom studia",
    gives: "Matematyka",
    wants: "Chemia organiczna",
    views: 11,
    matches: 1,
    time: "wczoraj",
    tagColor: C.cyan,
    tagBg: C.cyanBg,
    tagBdr: C.cyanBdr,
  },
  {
    id: "3",
    emoji: "💻",
    title: "Algorytmy i struktury danych — Python",
    gives: "Informatyka",
    wants: "Fizyka — fale",
    views: 18,
    matches: 2,
    time: "3 dni temu",
    tagColor: C.lime,
    tagBg: C.limeBg,
    tagBdr: C.limeBdr,
  },
];

function OfferRow({
  item,
  onDelete,
}: {
  item: MyOffer;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={s.card}>
      {/* top */}
      <View style={s.cardTop}>
        <View
          style={[
            s.emojiBox,
            { backgroundColor: item.tagBg, borderColor: item.tagBdr },
          ]}
        >
          <Text style={s.emoji}>{item.emoji}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={s.cardTime}>{item.time}</Text>
        </View>
      </View>

      {/* exchange */}
      <View style={s.exchangeRow}>
        <View
          style={[
            s.pill,
            { backgroundColor: item.tagBg, borderColor: item.tagBdr },
          ]}
        >
          <Text style={[s.pillText, { color: item.tagColor }]}>
            daje: {item.gives}
          </Text>
        </View>
        <Text style={s.arrow}>⇄</Text>
        <View
          style={[
            s.pill,
            { backgroundColor: C.limeBg, borderColor: C.limeBdr },
          ]}
        >
          <Text style={[s.pillText, { color: C.lime }]}>
            szuka: {item.wants}
          </Text>
        </View>
      </View>

      {/* stats + actions */}
      <View style={s.cardFooter}>
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.text2 }]}>{item.views}</Text>
            <Text style={s.statLbl}>wyświetleń</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: C.cyan }]}>{item.matches}</Text>
            <Text style={s.statLbl}>dopasowań</Text>
          </View>
        </View>
        <View style={s.actions}>
          <TouchableOpacity style={s.editBtn} activeOpacity={0.7}>
            <Text style={s.editText}>edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.deleteBtn}
            activeOpacity={0.7}
            onPress={() => onDelete(item.id)}
          >
            <Text style={s.deleteText}>usuń</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MyOffers() {
  const insets = useSafeAreaInsets();

  const handleDelete = (id: string) => {
    // podłącz pod swój state management
    console.log("delete", id);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={s.navTitle}>
            Moje <Text style={{ color: C.cyan }}>oferty</Text>
          </Text>
          <Text style={s.navSub}>{MY_OFFERS.length} aktywne</Text>
        </View>
        <TouchableOpacity style={s.addBtn} activeOpacity={0.75}>
          <Text style={s.addBtnText}>+ nowa oferta</Text>
        </TouchableOpacity>
      </View>

      {MY_OFFERS.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📋</Text>
          <Text style={s.emptyTitle}>Brak aktywnych ofert</Text>
          <Text style={s.emptySub}>
            Dodaj pierwszą ofertę i zacznij wymieniać wiedzę
          </Text>
        </View>
      ) : (
        <FlatList
          data={MY_OFFERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <OfferRow item={item} onDelete={handleDelete} />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topNav: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text1,
    fontFamily: "monospace",
  },
  navSub: {
    fontSize: 9,
    color: C.text3,
    fontFamily: "monospace",
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: C.cyan,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.bg,
    fontFamily: "monospace",
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },

  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  emoji: { fontSize: 20 },
  cardMeta: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: 12,
    color: C.text1,
    fontWeight: "400",
    lineHeight: 17,
  },
  cardTime: { fontSize: 9, color: C.text3, fontFamily: "monospace" },

  exchangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  pill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },
  arrow: { fontSize: 10, color: C.text3 },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statItem: { alignItems: "center", gap: 2 },
  statNum: { fontSize: 15, fontWeight: "700", fontFamily: "monospace" },
  statLbl: { fontSize: 8, color: C.text3, fontFamily: "monospace" },
  statDivider: { width: 1, height: 24, backgroundColor: C.border },

  actions: { flexDirection: "row", gap: 6 },
  editBtn: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: { fontSize: 10, color: C.text2, fontFamily: "monospace" },
  deleteBtn: {
    backgroundColor: C.roseBg,
    borderWidth: 1,
    borderColor: C.roseBdr,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: { fontSize: 10, color: C.rose, fontFamily: "monospace" },

  // empty state
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: C.text2,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 12,
    color: C.text3,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "monospace",
  },
});

import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DARK, LIGHT, Colors } from "@/lib/colors";

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

function getMyOffers(C: Colors): MyOffer[] {
  return [
    { id: "1", emoji: "📐", title: "Całkowanie i granice — analiza matematyczna", gives: "Matematyka",  wants: "Angielski B2",    views: 24, matches: 3, time: "2 godz. temu", tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr },
    { id: "2", emoji: "📐", title: "Równania różniczkowe — poziom studia",        gives: "Matematyka",  wants: "Chemia organiczna",views: 11, matches: 1, time: "wczoraj",      tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr },
    { id: "3", emoji: "💻", title: "Algorytmy i struktury danych — Python",        gives: "Informatyka", wants: "Fizyka — fale",   views: 18, matches: 2, time: "3 dni temu",   tagColor: C.lime, tagBg: C.limeBg, tagBdr: C.limeBdr },
  ];
}

function OfferRow({ item, onDelete, C }: { item: MyOffer; onDelete: (id: string) => void; C: Colors }) {
  return (
    <View style={[ss.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={ss.cardTop}>
        <View style={[ss.emojiBox, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
          <Text style={ss.emoji}>{item.emoji}</Text>
        </View>
        <View style={ss.cardMeta}>
          <Text style={[ss.cardTitle, { color: C.text1 }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[ss.cardTime, { color: C.text3 }]}>{item.time}</Text>
        </View>
      </View>

      <View style={ss.exchangeRow}>
        <View style={[ss.pill, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
          <Text style={[ss.pillText, { color: item.tagColor }]}>daje: {item.gives}</Text>
        </View>
        <Text style={[ss.arrow, { color: C.text3 }]}>⇄</Text>
        <View style={[ss.pill, { backgroundColor: C.limeBg, borderColor: C.limeBdr }]}>
          <Text style={[ss.pillText, { color: C.lime }]}>szuka: {item.wants}</Text>
        </View>
      </View>

      <View style={[ss.cardFooter, { borderTopColor: C.border }]}>
        <View style={ss.statsRow}>
          <View style={ss.statItem}>
            <Text style={[ss.statNum, { color: C.text2 }]}>{item.views}</Text>
            <Text style={[ss.statLbl, { color: C.text3 }]}>wyświetleń</Text>
          </View>
          <View style={[ss.statDivider, { backgroundColor: C.border }]} />
          <View style={ss.statItem}>
            <Text style={[ss.statNum, { color: C.cyan }]}>{item.matches}</Text>
            <Text style={[ss.statLbl, { color: C.text3 }]}>dopasowań</Text>
          </View>
        </View>
        <View style={ss.actions}>
          <TouchableOpacity style={[ss.editBtn, { backgroundColor: C.surface2, borderColor: C.border }]} activeOpacity={0.7}>
            <Text style={[ss.editText, { color: C.text2 }]}>edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[ss.deleteBtn, { backgroundColor: C.roseBg, borderColor: C.roseBdr }]} activeOpacity={0.7} onPress={() => onDelete(item.id)}>
            <Text style={[ss.deleteText, { color: C.rose }]}>usuń</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MyOffers() {
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C           = colorScheme === "dark" ? DARK : LIGHT;
  const MY_OFFERS   = getMyOffers(C);

  const handleDelete = (id: string) => {
    console.log("delete", id);
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
          <Text style={[ss.navSub, { color: C.text3 }]}>{MY_OFFERS.length} aktywne</Text>
        </View>
        <TouchableOpacity style={[ss.addBtn, { backgroundColor: C.cyan }]} activeOpacity={0.75}>
          <Text style={[ss.addBtnText, { color: C.bg }]}>+ nowa oferta</Text>
        </TouchableOpacity>
      </View>

      {MY_OFFERS.length === 0 ? (
        <View style={ss.empty}>
          <Text style={ss.emptyEmoji}>📋</Text>
          <Text style={[ss.emptyTitle, { color: C.text2 }]}>Brak aktywnych ofert</Text>
          <Text style={[ss.emptySub, { color: C.text3 }]}>Dodaj pierwszą ofertę i zacznij wymieniać wiedzę</Text>
        </View>
      ) : (
        <FlatList
          data={MY_OFFERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={ss.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => <OfferRow item={item} onDelete={handleDelete} C={C} />}
        />
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  topNav:     { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  navTitle:   { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  navSub:     { fontSize: 9, fontFamily: "monospace", marginTop: 2 },
  addBtn:     { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 11, fontWeight: "600", fontFamily: "monospace" },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card:     { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  cardTop:  { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  emojiBox: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  emoji:    { fontSize: 20 },
  cardMeta: { flex: 1, gap: 3 },
  cardTitle:{ fontSize: 12, fontWeight: "400", lineHeight: 17 },
  cardTime: { fontSize: 9, fontFamily: "monospace" },

  exchangeRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  pill:        { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  pillText:    { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },
  arrow:       { fontSize: 10 },

  cardFooter:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1 },
  statsRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
  statItem:    { alignItems: "center", gap: 2 },
  statNum:     { fontSize: 15, fontWeight: "700", fontFamily: "monospace" },
  statLbl:     { fontSize: 8, fontFamily: "monospace" },
  statDivider: { width: 1, height: 24 },

  actions:    { flexDirection: "row", gap: 6 },
  editBtn:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editText:   { fontSize: 10, fontFamily: "monospace" },
  deleteBtn:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  deleteText: { fontSize: 10, fontFamily: "monospace" },

  empty:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySub:   { fontSize: 12, textAlign: "center", lineHeight: 18, fontFamily: "monospace" },
});

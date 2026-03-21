import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DARK, LIGHT, Colors } from '@/lib/colors';

type Offer = {
  id: string;
  emoji: string;
  subject: string;
  title: string;
  gives: string;
  wants: string;
  user: string;
  initials: string;
  time: string;
  tagColor: string;
  tagBg: string;
  tagBdr: string;
  avColor: string;
  avBg: string;
  avBdr: string;
};

function getOffers(C: Colors): Offer[] {
  return [
    { id: '1', emoji: '📐', subject: 'mat.', title: 'Całkowanie i granice — analiza matematyczna', gives: 'Matematyka', wants: 'Angielski B2',    user: 'Marek K.', initials: 'MK', time: '2 godz.', tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,  avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr  },
    { id: '2', emoji: '🧬', subject: 'bio.', title: 'Biologia molekularna — zakres maturalny',      gives: 'Biologia',   wants: 'Fizyka — fale',   user: 'Ania S.',   initials: 'AS', time: '5 godz.', tagColor: C.lime,  tagBg: C.limeBg,  tagBdr: C.limeBdr,  avColor: C.lime,  avBg: C.limeBg,  avBdr: C.limeBdr  },
    { id: '3', emoji: '💻', subject: 'it.',  title: 'Python od podstaw — algorytmy i struktury',   gives: 'Python',     wants: 'Historia XX w.', user: 'Piotr W.', initials: 'PW', time: 'wczoraj', tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,  avColor: C.text2, avBg: 'rgba(80,120,200,0.12)', avBdr: 'rgba(80,120,200,0.22)' },
    { id: '4', emoji: '📜', subject: 'hist.',title: 'Historia XX w. — powtórka maturalna',          gives: 'Historia',   wants: 'Chemia org.',    user: 'Kasia M.', initials: 'KM', time: 'wczoraj', tagColor: C.amber, tagBg: C.amberBg, tagBdr: C.amberBdr, avColor: C.amber, avBg: C.amberBg, avBdr: C.amberBdr },
    { id: '5', emoji: '⚗️', subject: 'chem.',title: 'Chemia organiczna — alkeny i alkiny',          gives: 'Chemia',     wants: 'Matematyka',      user: 'Tomek R.', initials: 'TR', time: '2 dni',   tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr,  avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr  },
    { id: '6', emoji: '🗣️', subject: 'ang.', title: 'Angielski C1 — konwersacje i gramatyka',       gives: 'Angielski',  wants: 'Fizyka',          user: 'Julia P.', initials: 'JP', time: '2 dni',   tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr,  avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr  },
    { id: '7', emoji: '⚡', subject: 'fiz.', title: 'Fizyka — mechanika i termodynamika',            gives: 'Fizyka',     wants: 'Biologia',        user: 'Bartek N.',initials: 'BN', time: '3 dni',   tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,  avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr  },
    { id: '8', emoji: '🎨', subject: 'szt.', title: 'Plastyka i historia sztuki — matura rozszerzona',gives: 'Sztuka',   wants: 'Matematyka',      user: 'Zosia L.', initials: 'ZL', time: '4 dni',   tagColor: C.lime,  tagBg: C.limeBg,  tagBdr: C.limeBdr,  avColor: C.lime,  avBg: C.limeBg,  avBdr: C.limeBdr  },
  ];
}

function OfferCard({ item, C }: { item: Offer; C: Colors }) {
  return (
    <TouchableOpacity
      style={[ss.card, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.75}
    >
      <View style={[ss.emojiBox, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
        <Text style={ss.emoji}>{item.emoji}</Text>
      </View>

      <View style={ss.cardBody}>
        <View style={ss.titleRow}>
          <Text style={[ss.cardTitle, { color: C.text1 }]} numberOfLines={2}>{item.title}</Text>
          <View style={[ss.subjectTag, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
            <Text style={[ss.subjectText, { color: item.tagColor }]}>{item.subject}</Text>
          </View>
        </View>

        <View style={ss.exchangeBox}>
          <Text style={[ss.exLabel, { color: C.text3 }]}>daje</Text>
          <Text style={[ss.exPill, { color: item.tagColor }]}>{item.gives}</Text>
          <Text style={[ss.exArrow, { color: C.text3 }]}>⇄</Text>
          <Text style={[ss.exLabel, { color: C.text3 }]}>szuka</Text>
          <Text style={[ss.exPill, { color: C.lime }]}>{item.wants}</Text>
        </View>

        <View style={[ss.cardFooter, { borderTopColor: C.border }]}>
          <View style={[ss.avatar, { backgroundColor: item.avBg, borderColor: item.avBdr }]}>
            <Text style={[ss.avatarText, { color: item.avColor }]}>{item.initials}</Text>
          </View>
          <Text style={[ss.userName, { color: C.text2 }]}>{item.user}</Text>
          <Text style={[ss.dot, { color: C.text3 }]}>·</Text>
          <Text style={[ss.timeText, { color: C.text3 }]}>{item.time} temu</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Explore() {
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;
  const OFFERS      = getOffers(C);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[ss.navTitle, { color: C.text1 }]}>
          Ofer<Text style={{ color: C.cyan }}>ty</Text>
        </Text>
        <View style={[ss.countBadge, { backgroundColor: C.cyanBg, borderColor: C.cyanBdr }]}>
          <Text style={[ss.countText, { color: C.cyan }]}>312 aktywnych</Text>
        </View>
      </View>

      <FlatList
        data={OFFERS}
        keyExtractor={item => item.id}
        contentContainerStyle={ss.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <OfferCard item={item} C={C} />}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  topNav:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  navTitle:   { fontSize: 20, fontWeight: '700', fontFamily: 'monospace' },
  countBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  countText:  { fontSize: 10, fontFamily: 'monospace' },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card:     { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  emoji:    { fontSize: 22 },

  cardBody:   { flex: 1, gap: 7 },
  titleRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle:  { flex: 1, fontSize: 12, fontWeight: '400', lineHeight: 17 },
  subjectTag: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0 },
  subjectText:{ fontSize: 9, fontFamily: 'monospace', fontWeight: '500' },

  exchangeBox: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  exLabel:     { fontSize: 8, fontFamily: 'monospace' },
  exPill:      { fontSize: 9, fontFamily: 'monospace', fontWeight: '500' },
  exArrow:     { fontSize: 9 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 7, borderTopWidth: 1 },
  avatar:     { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarText: { fontSize: 7, fontFamily: 'monospace', fontWeight: '600' },
  userName:   { fontSize: 9, fontFamily: 'monospace' },
  dot:        { fontSize: 9 },
  timeText:   { fontSize: 9, fontFamily: 'monospace' },
});

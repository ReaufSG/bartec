import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg:       '#05070d',
  surface:  '#0d1221',
  surface2: '#090d18',
  border:   'rgba(80,120,180,0.14)',
  text1:    '#e8eef8',
  text2:    '#8fa8cc',
  text3:    '#4d6485',
  cyan:     '#5bc8e8',
  cyanBg:   'rgba(91,200,232,0.08)',
  cyanBdr:  'rgba(91,200,232,0.22)',
  lime:     '#a8e063',
  limeBg:   'rgba(168,224,99,0.08)',
  limeBdr:  'rgba(168,224,99,0.22)',
  amber:    '#f5c842',
  amberBg:  'rgba(245,200,66,0.08)',
  amberBdr: 'rgba(245,200,66,0.22)',
  rose:     '#e8637a',
  roseBg:   'rgba(232,99,122,0.08)',
  roseBdr:  'rgba(232,99,122,0.22)',
};

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

const OFFERS: Offer[] = [
  {
    id: '1', emoji: '📐', subject: 'mat.',
    title: 'Całkowanie i granice — analiza matematyczna',
    gives: 'Matematyka', wants: 'Angielski B2',
    user: 'Marek K.', initials: 'MK', time: '2 godz.',
    tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr,
    avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr,
  },
  {
    id: '2', emoji: '🧬', subject: 'bio.',
    title: 'Biologia molekularna — zakres maturalny',
    gives: 'Biologia', wants: 'Fizyka — fale',
    user: 'Ania S.', initials: 'AS', time: '5 godz.',
    tagColor: C.lime, tagBg: C.limeBg, tagBdr: C.limeBdr,
    avColor: C.lime,  avBg: C.limeBg,  avBdr: C.limeBdr,
  },
  {
    id: '3', emoji: '💻', subject: 'it.',
    title: 'Python od podstaw — algorytmy i struktury danych',
    gives: 'Python', wants: 'Historia XX w.',
    user: 'Piotr W.', initials: 'PW', time: 'wczoraj',
    tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr,
    avColor: C.text2, avBg: 'rgba(80,120,200,0.12)', avBdr: 'rgba(80,120,200,0.22)',
  },
  {
    id: '4', emoji: '📜', subject: 'hist.',
    title: 'Historia XX w. — powtórka maturalna',
    gives: 'Historia', wants: 'Chemia organiczna',
    user: 'Kasia M.', initials: 'KM', time: 'wczoraj',
    tagColor: C.amber, tagBg: C.amberBg, tagBdr: C.amberBdr,
    avColor: C.amber,  avBg: C.amberBg,  avBdr: C.amberBdr,
  },
  {
    id: '5', emoji: '⚗️', subject: 'chem.',
    title: 'Chemia organiczna — alkeny i alkiny',
    gives: 'Chemia', wants: 'Matematyka',
    user: 'Tomek R.', initials: 'TR', time: '2 dni',
    tagColor: C.rose, tagBg: C.roseBg, tagBdr: C.roseBdr,
    avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr,
  },
  {
    id: '6', emoji: '🗣️', subject: 'ang.',
    title: 'Angielski C1 — konwersacje i gramatyka',
    gives: 'Angielski', wants: 'Fizyka',
    user: 'Julia P.', initials: 'JP', time: '2 dni',
    tagColor: C.rose, tagBg: C.roseBg, tagBdr: C.roseBdr,
    avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr,
  },
  {
    id: '7', emoji: '⚡', subject: 'fiz.',
    title: 'Fizyka — mechanika i termodynamika',
    gives: 'Fizyka', wants: 'Biologia',
    user: 'Bartek N.', initials: 'BN', time: '3 dni',
    tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr,
    avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr,
  },
  {
    id: '8', emoji: '🎨', subject: 'szt.',
    title: 'Plastyka i historia sztuki — matura rozszerzona',
    gives: 'Sztuka', wants: 'Matematyka',
    user: 'Zosia L.', initials: 'ZL', time: '4 dni',
    tagColor: C.lime, tagBg: C.limeBg, tagBdr: C.limeBdr,
    avColor: C.lime,  avBg: C.limeBg,  avBdr: C.limeBdr,
  },
];

function OfferCard({ item }: { item: Offer }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.75}>
      {/* emoji */}
      <View style={[s.emojiBox, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
        <Text style={s.emoji}>{item.emoji}</Text>
      </View>

      {/* body */}
      <View style={s.cardBody}>
        {/* title row */}
        <View style={s.titleRow}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[s.subjectTag, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
            <Text style={[s.subjectText, { color: item.tagColor }]}>{item.subject}</Text>
          </View>
        </View>

        {/* exchange */}
        <View style={s.exchangeBox}>
          <Text style={s.exLabel}>daje</Text>
          <Text style={[s.exPill, { color: item.tagColor }]}>{item.gives}</Text>
          <Text style={s.exArrow}>⇄</Text>
          <Text style={s.exLabel}>szuka</Text>
          <Text style={[s.exPill, { color: C.lime }]}>{item.wants}</Text>
        </View>

        {/* footer */}
        <View style={s.cardFooter}>
          <View style={[s.avatar, { backgroundColor: item.avBg, borderColor: item.avBdr }]}>
            <Text style={[s.avatarText, { color: item.avColor }]}>{item.initials}</Text>
          </View>
          <Text style={s.userName}>{item.user}</Text>
          <Text style={s.dot}>·</Text>
          <Text style={s.timeText}>{item.time} temu</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Explore() {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={s.navTitle}>
          Ofer<Text style={{ color: C.cyan }}>ty</Text>
        </Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>312 aktywnych</Text>
        </View>
      </View>

      <FlatList
        data={OFFERS}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <OfferCard item={item} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  navTitle: { fontSize: 20, fontWeight: '700', color: C.text1, fontFamily: 'monospace' },
  countBadge: {
    backgroundColor: C.cyanBg, borderWidth: 1, borderColor: C.cyanBdr,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  countText: { fontSize: 10, color: C.cyan, fontFamily: 'monospace' },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 13,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  emojiBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  emoji: { fontSize: 22 },

  cardBody: { flex: 1, gap: 7 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1, fontSize: 12, color: C.text1, fontWeight: '400', lineHeight: 17 },
  subjectTag: {
    borderWidth: 1, borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0,
  },
  subjectText: { fontSize: 9, fontFamily: 'monospace', fontWeight: '500' },

  exchangeBox: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  exLabel:  { fontSize: 8, color: C.text3, fontFamily: 'monospace' },
  exPill:   { fontSize: 9, fontFamily: 'monospace', fontWeight: '500' },
  exArrow:  { fontSize: 9, color: C.text3 },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 7, borderTopWidth: 1, borderTopColor: C.border,
  },
  avatar: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  avatarText: { fontSize: 7, fontFamily: 'monospace', fontWeight: '600' },
  userName:   { fontSize: 9, color: C.text2, fontFamily: 'monospace' },
  dot:        { fontSize: 9, color: C.text3 },
  timeText:   { fontSize: 9, color: C.text3, fontFamily: 'monospace' },
});

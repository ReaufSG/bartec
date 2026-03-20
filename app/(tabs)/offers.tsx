import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── THEME ─────────────────────────────────────────────────────────────────────
const C = {
  bg:       '#05070d',
  surface:  '#0d1221',
  surface2: '#090d18',
  border:   'rgba(80,120,180,0.14)',
  border2:  'rgba(80,120,180,0.26)',
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
  navy:     '#2e4268',
};

const SCREEN_W = Dimensions.get('window').width;
const CARD_W   = (SCREEN_W - 20 * 2 - 10) / 2;

// ── DATA ──────────────────────────────────────────────────────────────────────
type Offer = {
  id: string;
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
  emoji: string;
};

const OFFERS: Offer[] = [
  {
    id: '1', emoji: '📐',
    subject: 'mat.',
    title: 'Całkowanie i granice — analiza mat.',
    gives: 'Matematyka',
    wants: 'Angielski B2',
    user: 'Marek K.', initials: 'MK', time: '2 godz.',
    tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,
    avColor: C.cyan,   avBg: C.cyanBg,   avBdr: C.cyanBdr,
  },
  {
    id: '2', emoji: '🧬',
    subject: 'bio.',
    title: 'Biologia mol. zakres maturalny',
    gives: 'Biologia',
    wants: 'Fizyka — fale',
    user: 'Ania S.', initials: 'AS', time: '5 godz.',
    tagColor: C.lime,  tagBg: C.limeBg,  tagBdr: C.limeBdr,
    avColor: C.lime,   avBg: C.limeBg,   avBdr: C.limeBdr,
  },
  {
    id: '3', emoji: '💻',
    subject: 'it.',
    title: 'Python od podstaw — algo i struktury',
    gives: 'Python',
    wants: 'Historia XX w.',
    user: 'Piotr W.', initials: 'PW', time: 'wczoraj',
    tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,
    avColor: C.text2,  avBg: 'rgba(80,120,200,0.12)', avBdr: 'rgba(80,120,200,0.22)',
  },
  {
    id: '4', emoji: '📜',
    subject: 'hist.',
    title: 'Historia XX w. — powtórka maturalna',
    gives: 'Historia',
    wants: 'Chemia org.',
    user: 'Kasia M.', initials: 'KM', time: 'wczoraj',
    tagColor: C.amber, tagBg: C.amberBg, tagBdr: C.amberBdr,
    avColor: C.amber,  avBg: C.amberBg,  avBdr: C.amberBdr,
  },
  {
    id: '5', emoji: '⚗️',
    subject: 'chem.',
    title: 'Chemia organiczna — alkeny i alkiny',
    gives: 'Chemia',
    wants: 'Matematyka',
    user: 'Tomek R.', initials: 'TR', time: '2 dni',
    tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr,
    avColor: C.rose,   avBg: C.roseBg,   avBdr: C.roseBdr,
  },
  {
    id: '6', emoji: '🗣️',
    subject: 'ang.',
    title: 'Angielski C1 — konwersacje i gramatyka',
    gives: 'Angielski',
    wants: 'Fizyka',
    user: 'Julia P.', initials: 'JP', time: '2 dni',
    tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr,
    avColor: C.rose,   avBg: C.roseBg,   avBdr: C.roseBdr,
  },
  {
    id: '7', emoji: '⚡',
    subject: 'fiz.',
    title: 'Fizyka — mechanika i termodynamika',
    gives: 'Fizyka',
    wants: 'Biologia',
    user: 'Bartek N.', initials: 'BN', time: '3 dni',
    tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr,
    avColor: C.cyan,   avBg: C.cyanBg,   avBdr: C.cyanBdr,
  },
  {
    id: '8', emoji: '🎨',
    subject: 'szt.',
    title: 'Plastyka i historia sztuki — matura',
    gives: 'Sztuka',
    wants: 'Matematyka',
    user: 'Zosia L.', initials: 'ZL', time: '4 dni',
    tagColor: C.lime,  tagBg: C.limeBg,  tagBdr: C.limeBdr,
    avColor: C.lime,   avBg: C.limeBg,   avBdr: C.limeBdr,
  },
];

// ── CARD ──────────────────────────────────────────────────────────────────────
function OfferCard({ item }: { item: Offer }) {
  return (
    <TouchableOpacity
      style={[s.card, { width: CARD_W }]}
      activeOpacity={0.75}
    >
      {/* top row: emoji + tag */}
      <View style={s.cardTop}>
        <View style={[s.emojiBox, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
          <Text style={s.emoji}>{item.emoji}</Text>
        </View>
        <View style={[s.subjectTag, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
          <Text style={[s.subjectText, { color: item.tagColor }]}>{item.subject}</Text>
        </View>
      </View>

      {/* title */}
      <Text style={s.cardTitle} numberOfLines={3}>{item.title}</Text>

      {/* exchange row */}
      <View style={s.exchangeBox}>
        <Text style={s.exLabel}>daje</Text>
        <Text style={[s.exPill, { color: item.tagColor }]} numberOfLines={1}>{item.gives}</Text>
        <Text style={s.exArrow}>⇄</Text>
        <Text style={s.exLabel}>szuka</Text>
      </View>
      <Text style={[s.wantsPill, { color: C.lime }]} numberOfLines={1}>{item.wants}</Text>

      {/* footer */}
      <View style={s.cardFooter}>
        <View style={[s.avatar, { backgroundColor: item.avBg, borderColor: item.avBdr }]}>
          <Text style={[s.avatarText, { color: item.avColor }]}>{item.initials}</Text>
        </View>
        <View style={s.footerInfo}>
          <Text style={s.userName} numberOfLines={1}>{item.user}</Text>
          <Text style={s.timeText}>{item.time} temu</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function Explore() {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={s.navTitle}>
          Ofer<Text style={{ color: C.cyan }}>ty</Text>
        </Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>312 aktywnych</Text>
        </View>
      </View>

      {/* GRID */}
      <FlatList
        data={OFFERS}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.listContent}
        columnWrapperStyle={s.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <OfferCard item={item} />}
      />
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  navTitle: { fontSize: 20, fontWeight: '700', color: C.text1, fontFamily: 'monospace' },
  countBadge: {
    backgroundColor: C.cyanBg, borderWidth: 1, borderColor: C.cyanBdr,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  countText: { fontSize: 10, color: C.cyan, fontFamily: 'monospace' },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { gap: 10, marginBottom: 10 },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 12,
    gap: 8,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emojiBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  emoji: { fontSize: 18 },
  subjectTag: {
    borderWidth: 1, borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  subjectText: { fontSize: 9, fontFamily: 'monospace', fontWeight: '500' },

  cardTitle: {
    fontSize: 11, color: C.text1, fontWeight: '400', lineHeight: 16,
    minHeight: 48,
  },

  exchangeBox: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  exLabel:  { fontSize: 8, color: C.text3, fontFamily: 'monospace' },
  exPill:   { fontSize: 9, fontFamily: 'monospace', fontWeight: '500', flex: 1 },
  exArrow:  { fontSize: 9, color: C.text3 },
  wantsPill: { fontSize: 9, fontFamily: 'monospace', fontWeight: '500', marginTop: -4 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  avatar: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  avatarText: { fontSize: 8, fontFamily: 'monospace', fontWeight: '600' },
  footerInfo: { flex: 1 },
  userName: { fontSize: 9, color: C.text2, fontFamily: 'monospace' },
  timeText: { fontSize: 8, color: C.text3, fontFamily: 'monospace', marginTop: 1 },
});

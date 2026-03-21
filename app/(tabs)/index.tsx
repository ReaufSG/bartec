import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { TokenContext } from '@/lib/context';
import { DARK, LIGHT } from '@/lib/colors';

// ── DATA ──────────────────────────────────────────────────────────────────────
const CALENDAR_DAYS = [
  { dn: 'PN', num: 16, hasEvent: false },
  { dn: 'WT', num: 17, hasEvent: true  },
  { dn: 'ŚR', num: 18, hasEvent: true  },
  { dn: 'CZ', num: 19, hasEvent: true  },
  { dn: 'PT', num: 20, hasEvent: true, today: true },
  { dn: 'SB', num: 21, hasEvent: false },
  { dn: 'ND', num: 22, hasEvent: true  },
];

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Colors = typeof DARK;
type Lesson = {
  id: string; time: string; day: string; title: string; meta: string;
  dot: string; badge: string; badgeBg: string; badgeColor: string; badgeBdr: string;
  isNext: boolean;
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function SectionHeader({ title, onMore, C }: { title: string; onMore?: () => void; C: Colors }) {
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

function CalDay({ item, C }: { item: typeof CALENDAR_DAYS[0]; C: Colors }) {
  return (
    <View style={[
      ss.calDay, { backgroundColor: C.surface, borderColor: C.border },
      item.today && { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
    ]}>
      <Text style={[ss.calDn, { color: C.text3 }, item.today && { color: C.cyan }]}>{item.dn}</Text>
      <Text style={[ss.calNum, { color: C.text2 }, item.today && { color: C.text1 }]}>{item.num}</Text>
      {item.hasEvent && <View style={[ss.eventDot, { backgroundColor: C.lime }]} />}
    </View>
  );
}

function LessonCard({ item, C }: { item: Lesson; C: Colors }) {
  return (
    <View style={[
      ss.lessonCard, { backgroundColor: C.surface, borderColor: C.border },
      item.isNext && { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
    ]}>
      <View style={ss.timeCol}>
        <Text style={[ss.lTime, { color: C.text1 }]}>{item.time}</Text>
        <Text style={[ss.lDay,  { color: C.text3 }]}>{item.day}</Text>
      </View>
      <View style={[ss.lDivider, { backgroundColor: C.border }]} />
      <View style={[ss.lDot, { backgroundColor: item.dot }]} />
      <View style={ss.lInfo}>
        <Text style={[ss.lTitle, { color: C.text1 }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[ss.lMeta,  { color: C.text3 }]}>{item.meta}</Text>
      </View>
      <View style={[ss.badge, { backgroundColor: item.badgeBg, borderColor: item.badgeBdr }]}>
        <Text style={[ss.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
      </View>
    </View>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function Index() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const auth        = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;

  const username = auth?.username ?? 'Użytkownik';
  const initials = username.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const LESSONS: Lesson[] = [
    { id: '1', time: '11:30', day: 'dziś',  title: 'Matematyka — całkowanie',   meta: 'z: Ania S. · 60 min · online',  dot: C.cyan,  badge: 'teraz', badgeBg: C.cyanBg,  badgeColor: C.cyan,  badgeBdr: C.cyanBdr,  isNext: true  },
    { id: '2', time: '14:00', day: 'dziś',  title: 'Angielski B2 konwersacje',  meta: 'z: Piotr W. · 45 min · online', dot: C.lime,  badge: 'daję',  badgeBg: C.limeBg,  badgeColor: C.lime,  badgeBdr: C.limeBdr,  isNext: false },
    { id: '3', time: '16:30', day: 'jutro', title: 'Chemia organiczna — alkeny',meta: 'z: Kasia M. · 60 min · offline', dot: C.amber, badge: 'biorę', badgeBg: C.amberBg, badgeColor: C.amber, badgeBdr: C.amberBdr, isNext: false },
    { id: '4', time: '10:00', day: 'ND',    title: 'Historia XX w. — powtórka', meta: 'z: Tomek R. · 90 min · online',  dot: C.rose,  badge: 'daję',  badgeBg: C.limeBg,  badgeColor: C.lime,  badgeBdr: C.limeBdr,  isNext: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      {/* TOP NAVBAR */}
      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[ss.profileBtn, { backgroundColor: C.cyanBg, borderColor: C.cyanBdr }]}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={[ss.profileInitials, { color: C.cyan }]}>{initials}</Text>
          <View style={[ss.notifDot, { backgroundColor: C.lime, borderColor: C.bg }]} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/bartec_logotyp.png')}
          style={ss.logo}
          resizeMode="contain"
        />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView style={ss.scroll} contentContainerStyle={ss.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={ss.greeting}>
          <Text style={[ss.greetSub,  { color: C.text3 }]}>// Dzień dobry</Text>
          <Text style={[ss.greetName, { color: C.text1 }]}>{username}</Text>
        </View>

        {/* PANELS ROW */}
        <View style={ss.panelsRow}>

          {/* LEFT */}
          <View style={[ss.panel, ss.panelLeft, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[ss.panelLabel, { color: C.text3 }]}>Twoje konto</Text>
            <View>
              <Text style={[ss.ptsLabel, { color: C.text3 }]}>punkty reputacji</Text>
              <View style={ss.ptsRow}>
                <Text style={[ss.ptsNum, { color: C.amber }]}>840</Text>
                <Text style={[ss.ptsUnit, { color: C.amber }]}>pkt</Text>
              </View>
            </View>
            <View style={ss.miniStats}>
              {[
                { label: 'wymian',          val: '12',    color: C.cyan,  w: '60%' },
                { label: 'ofert aktywnych', val: '3',     color: C.lime,  w: '30%' },
                { label: 'ocena',           val: '4.8 ★', color: C.amber, w: '96%' },
              ].map(({ label, val, color, w }) => (
                <View key={label} style={ss.miniStat}>
                  <View style={ss.miniStatRow}>
                    <Text style={[ss.miniLabel, { color: C.text3 }]}>{label}</Text>
                    <Text style={[ss.miniVal, { color }]}>{val}</Text>
                  </View>
                  <View style={[ss.progressBg, { backgroundColor: C.border }]}>
                    <View style={[ss.progressFill, { width: w as any, backgroundColor: color }]} />
                  </View>
                </View>
              ))}
            </View>
            <View style={[ss.rankBadge, { backgroundColor: C.amberBg, borderColor: C.amberBdr }]}>
              <Text style={ss.rankIcon}>🏅</Text>
              <View>
                <Text style={[ss.rankText, { color: C.amber }]}>Ekspert Matematyki</Text>
                <Text style={[ss.rankSub,  { color: C.text3 }]}>top 5% · 3 odznaki</Text>
              </View>
            </View>
          </View>

          {/* RIGHT */}
          <View style={[ss.panel, ss.panelRight, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[ss.panelLabel, { color: C.text3 }]}>Szybkie akcje</Text>
            {[
              { icon: '📝', label: 'Nowa oferta',    sub: 'dodaj ogłoszenie',  bg: C.cyanBg,  bdr: C.cyanBdr  },
              { icon: '🔍', label: 'Szukaj wymiany', sub: 'przeglądaj oferty', bg: C.limeBg,  bdr: C.limeBdr  },
              { icon: '📋', label: 'Historia',        sub: 'twoje sesje',       bg: C.amberBg, bdr: C.amberBdr },
            ].map(({ icon, label, sub, bg, bdr }) => (
              <TouchableOpacity key={label} style={[ss.actionBtn, { backgroundColor: bg, borderColor: bdr }]} activeOpacity={0.75}>
                <Text style={ss.actionIcon}>{icon}</Text>
                <Text style={[ss.actionLabel, { color: C.text1 }]}>{label}</Text>
                <Text style={[ss.actionSub,   { color: C.text3 }]}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* CALENDAR */}
        <SectionHeader title="// Kalendarz · Marzec 2026" onMore={() => {}} C={C} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ss.calStrip}>
          {CALENDAR_DAYS.map(d => <CalDay key={d.num} item={d} C={C} />)}
        </ScrollView>

        {/* UPCOMING */}
        <SectionHeader title="// Nadchodzące spotkania" onMore={() => {}} C={C} />
        <View style={ss.lessonsList}>
          {LESSONS.map(l => <LessonCard key={l.id} item={l} C={C} />)}
        </View>

      </ScrollView>
    </View>
  );
}

// ── STATIC STYLES ─────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  topNav:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  profileBtn:      { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  profileInitials: { fontSize: 11, fontWeight: '600', fontFamily: 'monospace' },
  notifDot:        { position: 'absolute', top: 1, right: 1, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  logo:            { height: 28, width: 120 },

  greeting:  { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  greetSub:  { fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 2 },
  greetName: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },

  panelsRow:  { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  panel:      { borderWidth: 1, borderRadius: 18, padding: 14 },
  panelLeft:  { flex: 1.05 },
  panelRight: { flex: 0.95, gap: 8 },
  panelLabel: { fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  ptsLabel:     { fontSize: 8, fontFamily: 'monospace', marginBottom: 4 },
  ptsRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  ptsNum:       { fontSize: 30, fontWeight: '700', lineHeight: 34 },
  ptsUnit:      { fontSize: 10, opacity: 0.6, fontFamily: 'monospace' },

  miniStats:    { gap: 7, marginTop: 6 },
  miniStat:     { gap: 3 },
  miniStatRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniLabel:    { fontSize: 9, fontFamily: 'monospace' },
  miniVal:      { fontSize: 10, fontWeight: '500', fontFamily: 'monospace' },
  progressBg:   { height: 3, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },

  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 8, padding: 7, marginTop: 6 },
  rankIcon:  { fontSize: 14 },
  rankText:  { fontSize: 9, fontFamily: 'monospace' },
  rankSub:   { fontSize: 8, fontFamily: 'monospace', marginTop: 1 },

  actionBtn:   { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, justifyContent: 'flex-end', minHeight: 72 },
  actionIcon:  { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: 10, fontWeight: '500', fontFamily: 'monospace' },
  actionSub:   { fontSize: 8, fontFamily: 'monospace', marginTop: 1 },

  secHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  secTitle:  { fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' },
  secMore:   { fontSize: 10, fontFamily: 'monospace' },

  calStrip:  { paddingHorizontal: 20, gap: 7 },
  calDay:    { width: 44, borderRadius: 12, paddingVertical: 9, alignItems: 'center', gap: 4, borderWidth: 1 },
  calDn:     { fontSize: 9, fontFamily: 'monospace', letterSpacing: 0.5 },
  calNum:    { fontSize: 17, fontWeight: '700', lineHeight: 20 },
  eventDot:  { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  lessonsList: { paddingHorizontal: 20, gap: 8 },
  lessonCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 13 },
  timeCol:     { width: 38, alignItems: 'center' },
  lTime:       { fontSize: 11, fontWeight: '500', fontFamily: 'monospace' },
  lDay:        { fontSize: 8, fontFamily: 'monospace', marginTop: 2 },
  lDivider:    { width: 1, alignSelf: 'stretch' },
  lDot:        { width: 8, height: 8, borderRadius: 4 },
  lInfo:       { flex: 1 },
  lTitle:      { fontSize: 12, fontWeight: '400' },
  lMeta:       { fontSize: 9, fontFamily: 'monospace', marginTop: 3 },
  badge:       { borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText:   { fontSize: 8, fontFamily: 'monospace', fontWeight: '500' },
});

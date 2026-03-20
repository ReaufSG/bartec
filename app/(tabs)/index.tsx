import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React from 'react';

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
  navy:     '#2e4268',
};

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

const LESSONS = [
  {
    id: '1', time: '11:30', day: 'dziś',
    title: 'Matematyka — całkowanie',
    meta: 'z: Ania S. · 60 min · online',
    dot: C.cyan, badge: 'teraz',
    badgeBg: C.cyanBg, badgeColor: C.cyan, badgeBdr: C.cyanBdr,
    isNext: true,
  },
  {
    id: '2', time: '14:00', day: 'dziś',
    title: 'Angielski B2 konwersacje',
    meta: 'z: Piotr W. · 45 min · online',
    dot: C.lime, badge: 'daję',
    badgeBg: C.limeBg, badgeColor: C.lime, badgeBdr: C.limeBdr,
    isNext: false,
  },
  {
    id: '3', time: '16:30', day: 'jutro',
    title: 'Chemia organiczna — alkeny',
    meta: 'z: Kasia M. · 60 min · offline',
    dot: C.amber, badge: 'biorę',
    badgeBg: C.amberBg, badgeColor: C.amber, badgeBdr: C.amberBdr,
    isNext: false,
  },
  {
    id: '4', time: '10:00', day: 'ND',
    title: 'Historia XX w. — powtórka',
    meta: 'z: Tomek R. · 90 min · online',
    dot: C.rose, badge: 'daję',
    badgeBg: C.limeBg, badgeColor: C.lime, badgeBdr: C.limeBdr,
    isNext: false,
  },
];

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function SectionHeader({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
      {onMore && (
        <TouchableOpacity onPress={onMore}>
          <Text style={s.secMore}>wszystkie →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CalDay({ item }: { item: typeof CALENDAR_DAYS[0] }) {
  return (
    <View style={[s.calDay, item.today && s.calDayToday]}>
      <Text style={[s.calDn, item.today && s.calDnToday]}>{item.dn}</Text>
      <Text style={[s.calNum, item.today && s.calNumToday]}>{item.num}</Text>
      {item.hasEvent && <View style={s.eventDot} />}
    </View>
  );
}

function LessonCard({ item }: { item: typeof LESSONS[0] }) {
  return (
    <View style={[s.lessonCard, item.isNext && s.lessonCardNext]}>
      <View style={s.timeCol}>
        <Text style={s.lTime}>{item.time}</Text>
        <Text style={s.lDay}>{item.day}</Text>
      </View>
      <View style={s.lDivider} />
      <View style={[s.lDot, { backgroundColor: item.dot }]} />
      <View style={s.lInfo}>
        <Text style={s.lTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.lMeta}>{item.meta}</Text>
      </View>
      <View style={[s.badge, { backgroundColor: item.badgeBg, borderColor: item.badgeBdr }]}>
        <Text style={[s.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
      </View>
    </View>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.profileBtn} onPress={() => router.push('/profile' as any)}>
          <Text style={s.profileInitials}>MK</Text>
          <View style={s.notifDot} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/bartec_logotyp.png')}
          style={s.logo}
          resizeMode="contain"
        />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={s.greeting}>
          <Text style={s.greetSub}>// Dzień dobry</Text>
          <Text style={s.greetName}>Marek Kowalski</Text>
        </View>

        {/* PANELS ROW */}
        <View style={s.panelsRow}>

          {/* LEFT — statystyki */}
          <View style={[s.panel, s.panelLeft]}>
            <Text style={s.panelLabel}>Twoje konto</Text>
            <View>
              <Text style={s.ptsLabel}>punkty reputacji</Text>
              <View style={s.ptsRow}>
                <Text style={s.ptsNum}>840</Text>
                <Text style={s.ptsUnit}>pkt</Text>
              </View>
            </View>
            <View style={s.miniStats}>
              {[
                { label: 'wymian',          val: '12',    color: C.cyan,  w: '60%' },
                { label: 'ofert aktywnych', val: '3',     color: C.lime,  w: '30%' },
                { label: 'ocena',           val: '4.8 ★', color: C.amber, w: '96%' },
              ].map(({ label, val, color, w }) => (
                <View key={label} style={s.miniStat}>
                  <View style={s.miniStatRow}>
                    <Text style={s.miniLabel}>{label}</Text>
                    <Text style={[s.miniVal, { color }]}>{val}</Text>
                  </View>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: w as any, backgroundColor: color }]} />
                  </View>
                </View>
              ))}
            </View>
            <View style={s.rankBadge}>
              <Text style={s.rankIcon}>🏅</Text>
              <View>
                <Text style={s.rankText}>Ekspert Matematyki</Text>
                <Text style={s.rankSub}>top 5% · 3 odznaki</Text>
              </View>
            </View>
          </View>

          {/* RIGHT — akcje */}
          <View style={[s.panel, s.panelRight]}>
            <Text style={s.panelLabel}>Szybkie akcje</Text>
            {[
              { icon: '📝', label: 'Nowa oferta',    sub: 'dodaj ogłoszenie',  bg: C.cyanBg,  bdr: C.cyanBdr  },
              { icon: '🔍', label: 'Szukaj wymiany', sub: 'przeglądaj oferty', bg: C.limeBg,  bdr: C.limeBdr  },
              { icon: '📋', label: 'Historia',        sub: 'twoje sesje',       bg: C.amberBg, bdr: C.amberBdr },
            ].map(({ icon, label, sub, bg, bdr }) => (
              <TouchableOpacity
                key={label}
                style={[s.actionBtn, { backgroundColor: bg, borderColor: bdr }]}
                activeOpacity={0.75}
              >
                <Text style={s.actionIcon}>{icon}</Text>
                <Text style={s.actionLabel}>{label}</Text>
                <Text style={s.actionSub}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* CALENDAR */}
        <SectionHeader title="// Kalendarz · Marzec 2026" onMore={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.calStrip}
        >
          {CALENDAR_DAYS.map(d => <CalDay key={d.num} item={d} />)}
        </ScrollView>

        {/* UPCOMING */}
        <SectionHeader title="// Nadchodzące spotkania" onMore={() => {}} />
        <View style={s.lessonsList}>
          {LESSONS.map(l => <LessonCard key={l.id} item={l} />)}
        </View>

      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  profileBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.cyanBg, borderWidth: 1.5, borderColor: C.cyanBdr,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { color: C.cyan, fontSize: 11, fontWeight: '600', fontFamily: 'monospace' },
  notifDot: {
    position: 'absolute', top: 1, right: 1,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: C.lime, borderWidth: 1.5, borderColor: C.bg,
  },
  logo: { height: 28, width: 120 },

  greeting:  { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  greetSub:  { fontSize: 10, color: C.text3, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 2 },
  greetName: { fontSize: 22, fontWeight: '700', color: C.text1, letterSpacing: -0.5 },

  panelsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  panel: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 18, padding: 14,
  },
  panelLeft:  { flex: 1.05 },
  panelRight: { flex: 0.95, gap: 8 },
  panelLabel: {
    fontSize: 9, color: C.text3, fontFamily: 'monospace',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
  },

  ptsLabel: { fontSize: 8, color: C.text3, fontFamily: 'monospace', marginBottom: 4 },
  ptsRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  ptsNum:   { fontSize: 30, fontWeight: '700', color: C.amber, lineHeight: 34 },
  ptsUnit:  { fontSize: 10, color: C.amber, opacity: 0.6, fontFamily: 'monospace' },

  miniStats:   { gap: 7, marginTop: 6 },
  miniStat:    { gap: 3 },
  miniStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniLabel:   { fontSize: 9, color: C.text3, fontFamily: 'monospace' },
  miniVal:     { fontSize: 10, fontWeight: '500', fontFamily: 'monospace' },
  progressBg:   { height: 3, backgroundColor: 'rgba(80,120,180,0.1)', borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },

  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,200,66,0.07)',
    borderWidth: 1, borderColor: 'rgba(245,200,66,0.15)',
    borderRadius: 8, padding: 7, marginTop: 6,
  },
  rankIcon: { fontSize: 14 },
  rankText: { fontSize: 9, color: C.amber, fontFamily: 'monospace' },
  rankSub:  { fontSize: 8, color: '#7a6020', fontFamily: 'monospace', marginTop: 1 },

  actionBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 10, justifyContent: 'flex-end', minHeight: 72,
  },
  actionIcon:  { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: 10, fontWeight: '500', color: C.text1, fontFamily: 'monospace' },
  actionSub:   { fontSize: 8, color: C.text3, fontFamily: 'monospace', marginTop: 1 },

  secHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10,
  },
  secTitle: { fontSize: 10, color: C.text3, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' },
  secMore:  { fontSize: 10, color: C.cyan, fontFamily: 'monospace' },

  calStrip:    { paddingHorizontal: 20, gap: 7 },
  calDay: {
    width: 44, borderRadius: 12, paddingVertical: 9, alignItems: 'center', gap: 4,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  calDayToday: { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
  calDn:       { fontSize: 9, color: C.text3, fontFamily: 'monospace', letterSpacing: 0.5 },
  calDnToday:  { color: C.cyan },
  calNum:      { fontSize: 17, fontWeight: '700', color: C.text2, lineHeight: 20 },
  calNumToday: { color: C.text1 },
  eventDot:    { width: 4, height: 4, borderRadius: 2, backgroundColor: C.lime, marginTop: 2 },

  lessonsList: { paddingHorizontal: 20, gap: 8 },
  lessonCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 13,
  },
  lessonCardNext: { borderColor: C.cyanBdr, backgroundColor: 'rgba(91,200,232,0.03)' },
  timeCol:  { width: 38, alignItems: 'center' },
  lTime:    { fontSize: 11, fontWeight: '500', color: C.text1, fontFamily: 'monospace' },
  lDay:     { fontSize: 8, color: C.text3, fontFamily: 'monospace', marginTop: 2 },
  lDivider: { width: 1, alignSelf: 'stretch', backgroundColor: C.border },
  lDot:     { width: 8, height: 8, borderRadius: 4 },
  lInfo:    { flex: 1 },
  lTitle:   { fontSize: 12, color: C.text1, fontWeight: '400' },
  lMeta:    { fontSize: 9, color: C.text3, fontFamily: 'monospace', marginTop: 3 },
  badge:     { borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 8, fontFamily: 'monospace', fontWeight: '500' },
});

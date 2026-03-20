import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

const USER = {
  initials:  'MK',
  name:      'Marek Kowalski',
  email:     'marek.k@studyswap.pl',
  school:    'LO im. Kopernika, Kraków',
  grade:     'Klasa 3',
  joined:    'Styczeń 2026',
  points:    840,
  swaps:     12,
  rating:    4.8,
  rank:      'Ekspert Matematyki',
};

const INFO_ROWS = [
  { label: 'Email',   value: USER.email   },
  { label: 'Szkoła',  value: USER.school  },
  { label: 'Klasa',   value: USER.grade   },
  { label: 'Dołączył', value: USER.joined },
];

export default function Profile() {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Wyloguj się',
      'Na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={s.navTitle}>
          Pro<Text style={{ color: C.cyan }}>fil</Text>
        </Text>
        <TouchableOpacity style={s.editBtn} activeOpacity={0.7}>
          <Text style={s.editText}>edytuj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* AVATAR CARD */}
        <View style={s.avatarCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitials}>{USER.initials}</Text>
          </View>
          <View style={s.avatarInfo}>
            <Text style={s.userName}>{USER.name}</Text>
            <View style={s.rankBadge}>
              <Text style={s.rankIcon}>🏅</Text>
              <Text style={s.rankText}>{USER.rank}</Text>
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={s.statsRow}>
          <View style={[s.statCell, { borderColor: C.amberBdr }]}>
            <Text style={[s.statNum, { color: C.amber }]}>{USER.points}</Text>
            <Text style={s.statLabel}>punktów</Text>
          </View>
          <View style={[s.statCell, { borderColor: C.cyanBdr }]}>
            <Text style={[s.statNum, { color: C.cyan }]}>{USER.swaps}</Text>
            <Text style={s.statLabel}>wymian</Text>
          </View>
          <View style={[s.statCell, { borderColor: C.limeBdr }]}>
            <Text style={[s.statNum, { color: C.lime }]}>{USER.rating} ★</Text>
            <Text style={s.statLabel}>ocena</Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <Text style={s.sectionLabel}>// dane konta</Text>
        <View style={s.infoCard}>
          {INFO_ROWS.map((row, i) => (
            <View key={row.label} style={[s.infoRow, i < INFO_ROWS.length - 1 && s.infoRowBorder]}>
              <Text style={s.infoLabel}>{row.label}</Text>
              <Text style={s.infoValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={s.logoutText}>Wyloguj się</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  navTitle: { fontSize: 20, fontWeight: '700', color: C.text1, fontFamily: 'monospace' },
  editBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  editText: { fontSize: 10, color: C.text2, fontFamily: 'monospace' },

  // avatar card
  avatarCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: C.cyanBg, borderWidth: 2, borderColor: C.cyanBdr,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 22, fontWeight: '700', color: C.cyan, fontFamily: 'monospace' },
  avatarInfo: { flex: 1, gap: 8 },
  userName: { fontSize: 16, fontWeight: '600', color: C.text1 },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.amberBg, borderWidth: 1, borderColor: C.amberBdr,
    borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  rankIcon: { fontSize: 12 },
  rankText: { fontSize: 9, color: C.amber, fontFamily: 'monospace' },

  // stats
  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },
  statCell: {
    flex: 1, backgroundColor: C.surface,
    borderWidth: 1, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  statNum:   { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
  statLabel: { fontSize: 8, color: C.text3, fontFamily: 'monospace', letterSpacing: 0.5 },

  // info
  sectionLabel: {
    fontSize: 9, color: C.text3, fontFamily: 'monospace',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  infoCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, marginBottom: 24, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  infoLabel: { fontSize: 11, color: C.text3, fontFamily: 'monospace' },
  infoValue: { fontSize: 11, color: C.text1, fontFamily: 'monospace', flex: 1, textAlign: 'right' },

  // logout
  logoutBtn: {
    backgroundColor: C.roseBg, borderWidth: 1, borderColor: C.roseBdr,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { fontSize: 13, color: C.rose, fontFamily: 'monospace', fontWeight: '500' },
});

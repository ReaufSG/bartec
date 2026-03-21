import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenContext } from '@/lib/context';
import { DARK, LIGHT } from '@/lib/colors';

const USER = {
  points: 840,
  swaps:  12,
  rating: 4.8,
  rank:   'Ekspert Matematyki',
};

function formatJoined(date: Date): string {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function Profile() {
  const insets      = useSafeAreaInsets();
  const auth        = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('notifications').then(val => {
      if (val !== null) setNotifications(val !== 'false');
    });
  }, []);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await AsyncStorage.setItem('notifications', String(val));
  };

  const displayName = auth?.username ?? 'Użytkownik';
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const joinedDate  = formatJoined(new Date(auth?.createdAt ?? Date.now()));

  const handleLogout = () => {
    Alert.alert(
      'Wyloguj się',
      'Na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', style: 'destructive', onPress: () => auth?.logout() },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[s.navTitle, { color: C.text1 }]}>
          Pro<Text style={{ color: C.cyan }}>fil</Text>
        </Text>
        <TouchableOpacity
          style={[s.editBtn, { backgroundColor: C.surface, borderColor: C.border }]}
          activeOpacity={0.7}
        >
          <Text style={[s.editText, { color: C.text2 }]}>edytuj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* AVATAR CARD */}
        <View style={[s.avatarCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[s.avatarCircle, { backgroundColor: C.cyanBg, borderColor: C.cyanBdr }]}>
            <Text style={[s.avatarInitials, { color: C.cyan }]}>{initials}</Text>
          </View>
          <View style={s.avatarInfo}>
            <Text style={[s.userName, { color: C.text1 }]}>{displayName}</Text>
            <View style={[s.rankBadge, { backgroundColor: C.amberBg, borderColor: C.amberBdr }]}>
              <Text style={s.rankIcon}>🏅</Text>
              <Text style={[s.rankText, { color: C.amber }]}>{USER.rank}</Text>
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={s.statsRow}>
          <View style={[s.statCell, { backgroundColor: C.surface, borderColor: C.amberBdr }]}>
            <Text style={[s.statNum, { color: C.amber }]}>{USER.points}</Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>punktów</Text>
          </View>
          <View style={[s.statCell, { backgroundColor: C.surface, borderColor: C.cyanBdr }]}>
            <Text style={[s.statNum, { color: C.cyan }]}>{USER.swaps}</Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>wymian</Text>
          </View>
          <View style={[s.statCell, { backgroundColor: C.surface, borderColor: C.limeBdr }]}>
            <Text style={[s.statNum, { color: C.lime }]}>{USER.rating} ★</Text>
            <Text style={[s.statLabel, { color: C.text3 }]}>ocena</Text>
          </View>
        </View>

        {/* DANE KONTA */}
        <Text style={[s.sectionLabel, { color: C.text3 }]}>// dane konta</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.infoRow}>
            <Text style={[s.infoLabel, { color: C.text3 }]}>Dołączył</Text>
            <Text style={[s.infoValue, { color: C.text1 }]}>{joinedDate}</Text>
          </View>
        </View>

        {/* USTAWIENIA */}
        <Text style={[s.sectionLabel, { color: C.text3 }]}>// ustawienia</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <Text style={s.settingIcon}>🔔</Text>
              <View>
                <Text style={[s.settingLabel, { color: C.text1 }]}>Powiadomienia</Text>
                <Text style={[s.settingSub, { color: C.text3 }]}>{notifications ? 'włączone' : 'wyłączone'}</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: C.border2, true: C.limeBg }}
              thumbColor={notifications ? C.lime : C.text3}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: C.roseBg, borderColor: C.roseBdr }]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={[s.logoutText, { color: C.rose }]}>Wyloguj się</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  topNav:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  navTitle:  { fontSize: 20, fontWeight: '700', fontFamily: 'monospace' },
  editBtn:   { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  editText:  { fontSize: 10, fontFamily: 'monospace' },

  avatarCard:     { borderWidth: 1, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  avatarCircle:   { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 22, fontWeight: '700', fontFamily: 'monospace' },
  avatarInfo:     { flex: 1, gap: 8 },
  userName:       { fontSize: 16, fontWeight: '600' },
  rankBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  rankIcon:       { fontSize: 12 },
  rankText:       { fontSize: 9, fontFamily: 'monospace' },

  statsRow:  { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCell:  { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 4 },
  statNum:   { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
  statLabel: { fontSize: 8, fontFamily: 'monospace', letterSpacing: 0.5 },

  sectionLabel: { fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  card:      { borderWidth: 1, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  infoRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  infoLabel: { fontSize: 11, fontFamily: 'monospace' },
  infoValue: { fontSize: 11, fontFamily: 'monospace', flex: 1, textAlign: 'right' },

  settingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { fontSize: 18 },
  settingLabel:{ fontSize: 12, fontFamily: 'monospace' },
  settingSub:  { fontSize: 9, fontFamily: 'monospace', marginTop: 2 },

  logoutBtn:  { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText: { fontSize: 13, fontFamily: 'monospace', fontWeight: '500' },
});

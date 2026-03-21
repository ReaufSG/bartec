import { Tabs } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { DARK, LIGHT } from '@/lib/colors';

// ── ICONS ─────────────────────────────────────────────────────────────────────
function IconHome({ color, doorColor }: { color: string; doorColor: string }) {
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center' }}>
      <View style={[ic.roof, { borderBottomColor: color }]} />
      <View style={[ic.wall, { backgroundColor: color }]}>
        <View style={[ic.door, { backgroundColor: doorColor }]} />
      </View>
    </View>
  );
}

function IconOffers({ color }: { color: string }) {
  return (
    <View style={ic.grid}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={[ic.gridCell, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function IconMyOffers({ color }: { color: string }) {
  return (
    <View style={{ width: 20, height: 20, justifyContent: 'space-between' }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2, backgroundColor: color }} />
          <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: color }} />
        </View>
      ))}
    </View>
  );
}

function IconChat({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 20 }}>
      <View style={[ic.bubble, { backgroundColor: color }]} />
      <View style={[ic.tail, { borderTopColor: color }]} />
    </View>
  );
}

function IconStore({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[ic.storeHandle, { borderColor: color }]} />
      <View style={[ic.storeBag, { backgroundColor: color }]} />
    </View>
  );
}

const ic = StyleSheet.create({
  roof:     { width: 0, height: 0, borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  wall:     { width: 16, height: 11, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', paddingHorizontal: 2 },
  door:     { width: 5, height: 7 },
  grid:     { width: 20, height: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  gridCell: { width: 8, height: 8, borderRadius: 2 },
  bubble:   { width: 20, height: 14, borderRadius: 4 },
  tail:     { width: 0, height: 0, borderTopWidth: 5, borderRightWidth: 6, borderRightColor: 'transparent', marginLeft: 3, marginTop: -1 },
  storeBag: { width: 13, height: 11, borderWidth: 1.5, borderRadius: 2 },
  storeHandle: { width: 7, height: 4, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderRadius: 5, borderBottomWidth: 0, marginTop: -2 },
});

// ── LAYOUT ────────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface2,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor:       C.cyan,
        tabBarInactiveTintColor:     C.navy,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'monospace',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarActiveBackgroundColor: C.cyanBg,
        tabBarItemStyle: {
          borderRadius: 10,
          marginHorizontal: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconHome color={color} doorColor={C.surface2} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Oferty',
          tabBarIcon: ({ color }) => <IconOffers color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-offers"
        options={{
          title: 'Moje',
          tabBarIcon: ({ color }) => <IconMyOffers color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Czat',
          tabBarIcon: ({ color }) => <IconChat color={color} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Sklep',
          tabBarIcon: ({ color }) => <IconStore color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
    </Tabs>
  );
}

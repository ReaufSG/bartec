import React, { useState } from 'react';
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

type StoreItem = {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  description: string;
  tagColor: string;
  tagBg: string;
  tagBdr: string;
};

function getStoreItems(C: Colors): StoreItem[] {
  return [
    { id: '1', emoji: '⭐', name: 'Premium Badge', cost: 100, description: 'Zabłyśnij w stylu', tagColor: C.amber, tagBg: C.amberBg, tagBdr: C.amberBdr },
    { id: '2', emoji: '🎨', name: 'Custom Theme', cost: 250, description: 'Odblokuj nowy motyw', tagColor: C.rose, tagBg: C.roseBg, tagBdr: C.roseBdr },
    { id: '3', emoji: '🚀', name: 'Boost Pass', cost: 500, description: 'Zwiększ widoczność profilu', tagColor: C.cyan, tagBg: C.cyanBg, tagBdr: C.cyanBdr },
    { id: '4', emoji: '💎', name: 'VIP Status', cost: 750, description: 'Odznaka elitarna na rok', tagColor: C.lime, tagBg: C.limeBg, tagBdr: C.limeBdr },
    { id: '5', emoji: '🪦', name: 'KYS', cost: -99999, description: 'Wyślij team elimanyjny do swojego domu', tagColor: C.lime, tagBg: C.limeBg, tagBdr: C.limeBdr },
  ];
}

function StoreCard({ item, C, canAfford, onPress }: { item: StoreItem; C: Colors; canAfford: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[ss.card, { backgroundColor: C.surface, borderColor: C.border, opacity: canAfford ? 1 : 0.6 }]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!canAfford}
    >
      <View style={[ss.emojiBox, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
        <Text style={ss.emoji}>{item.emoji}</Text>
      </View>

      <View style={ss.cardBody}>
        <Text style={[ss.cardTitle, { color: C.text1 }]}>{item.name}</Text>
        <Text style={[ss.cardDescription, { color: C.text3 }]}>{item.description}</Text>
      </View>

      <View style={[ss.costBadge, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
        <Text style={[ss.costText, { color: item.tagColor }]}>{item.cost}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Store() {
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;
  const STORE_LIST  = getStoreItems(C);
  const [credits, setCredits] = useState(1000);

  const purchaseItem = (item: StoreItem) => {
    if (credits >= item.cost) {
      setCredits(credits - item.cost);
      alert(`Zakupiłeś: ${item.name}!`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[ss.navTitle, { color: C.text1 }]}>
          Skl<Text style={{ color: C.cyan }}>ep</Text>
        </Text>
        <View style={[ss.creditsBadge, { backgroundColor: C.limeBg, borderColor: C.limeBdr }]}>
          <Text style={[ss.creditsText, { color: C.lime }]}>{credits} pkt</Text>
        </View>
      </View>

      <FlatList
        data={STORE_LIST}
        keyExtractor={item => item.id}
        contentContainerStyle={ss.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <StoreCard
            item={item}
            C={C}
            canAfford={credits >= item.cost}
            onPress={() => purchaseItem(item)}
          />
        )}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  topNav:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  navTitle:   { fontSize: 20, fontWeight: '700', fontFamily: 'monospace' },
  creditsBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  creditsText:  { fontSize: 10, fontFamily: 'monospace' },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card:     { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  emoji:    { fontSize: 22 },

  cardBody:   { flex: 1, gap: 4 },
  cardTitle:  { fontSize: 12, fontWeight: '600', fontFamily: 'monospace' },
  cardDescription: { fontSize: 10, lineHeight: 14 },

  costBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexShrink: 0 },
  costText:  { fontSize: 10, fontFamily: 'monospace', fontWeight: '600' },
});
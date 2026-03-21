import { Colors, DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StoreItem = {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  description: string;
  kind: "HAND_RAISE" | "FONT" | "BORDER";
  value?: string;
  tagColor: string;
  tagBg: string;
  tagBdr: string;
};

function getStoreItems(C: Colors): StoreItem[] {
  return [
    {
      id: "1",
      emoji: "✋",
      name: "R-ka na lekcję",
      cost: 1000,
      description: "Jednorazowe podniesienie ręki przed lekcją",
      kind: "HAND_RAISE",
      tagColor: C.amber,
      tagBg: C.amberBg,
      tagBdr: C.amberBdr,
    },
    {
      id: "2",
      emoji: "𝓕",
      name: "Font nazwy: Serif",
      cost: 800,
      description: "Zmienia styl nazwy profilu",
      kind: "FONT",
      value: "SERIF",
      tagColor: C.rose,
      tagBg: C.roseBg,
      tagBdr: C.roseBdr,
    },
    {
      id: "3",
      emoji: "𝗙",
      name: "Font nazwy: Sans",
      cost: 800,
      description: "Nowoczesny styl nazwy profilu",
      kind: "FONT",
      value: "SANS",
      tagColor: C.cyan,
      tagBg: C.cyanBg,
      tagBdr: C.cyanBdr,
    },
    {
      id: "4",
      emoji: "🟠",
      name: "Obramówka konta: Amber",
      cost: 650,
      description: "Kolor obramówki panelu konta",
      kind: "BORDER",
      value: "AMBER",
      tagColor: C.amber,
      tagBg: C.amberBg,
      tagBdr: C.amberBdr,
    },
    {
      id: "5",
      emoji: "🟣",
      name: "Obramówka konta: Rose",
      cost: 650,
      description: "Kolor obramówki panelu konta",
      kind: "BORDER",
      value: "ROSE",
      tagColor: C.rose,
      tagBg: C.roseBg,
      tagBdr: C.roseBdr,
    },
    {
      id: "6",
      emoji: "🟢",
      name: "Obramówka konta: Lime",
      cost: 650,
      description: "Kolor obramówki panelu konta",
      kind: "BORDER",
      value: "LIME",
      tagColor: C.lime,
      tagBg: C.limeBg,
      tagBdr: C.limeBdr,
    },
    {
      id: "7",
      emoji: "🅳",
      name: "Font nazwy: Display",
      cost: 900,
      description: "Mocny, wyrazisty styl nazwy",
      kind: "FONT",
      value: "DISPLAY",
      tagColor: C.amber,
      tagBg: C.amberBg,
      tagBdr: C.amberBdr,
    },
    {
      id: "8",
      emoji: "⌘",
      name: "Font nazwy: Tech",
      cost: 950,
      description: "Techniczny styl nazwy z większym spacingiem",
      kind: "FONT",
      value: "TECH",
      tagColor: C.cyan,
      tagBg: C.cyanBg,
      tagBdr: C.cyanBdr,
    },
    {
      id: "9",
      emoji: "🔵",
      name: "Obramówka konta: Navy",
      cost: 700,
      description: "Granatowy akcent obramówki konta",
      kind: "BORDER",
      value: "NAVY",
      tagColor: C.navy,
      tagBg: C.cyanBg,
      tagBdr: C.cyanBdr,
    },
  ];
}

function StoreCard({
  item,
  C,
  canAfford,
  onPress,
}: {
  item: StoreItem;
  C: Colors;
  canAfford: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        ss.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          opacity: canAfford ? 1 : 0.6,
        },
      ]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!canAfford}
    >
      <View
        style={[
          ss.emojiBox,
          { backgroundColor: item.tagBg, borderColor: item.tagBdr },
        ]}
      >
        <Text style={ss.emoji}>{item.emoji}</Text>
      </View>

      <View style={ss.cardBody}>
        <Text style={[ss.cardTitle, { color: C.text1 }]}>{item.name}</Text>
        <Text style={[ss.cardDescription, { color: C.text3 }]}>
          {item.description}
        </Text>
      </View>

      <View
        style={[
          ss.costBadge,
          { backgroundColor: item.tagBg, borderColor: item.tagBdr },
        ]}
      >
        <Text style={[ss.costText, { color: item.tagColor }]}>{item.cost}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Store() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;
  const auth = useContext(TokenContext);
  const STORE_LIST = getStoreItems(C);
  const [credits, setCredits] = useState(0);
  const [handRaises, setHandRaises] = useState(0);
  const [nameFont, setNameFont] = useState("MONO");
  const [borderColor, setBorderColor] = useState("CYAN");

  const loadCredits = useCallback(async () => {
    if (!auth?.userId) {
      setCredits(0);
      return;
    }
    try {
      const stats = await trpc.getHomeStats.query({ userId: auth.userId });
      setCredits((stats as any).points ?? 0);
      setHandRaises((stats as any).handRaises ?? 0);
      setNameFont((stats as any).nameFont ?? "MONO");
      setBorderColor((stats as any).borderColor ?? "CYAN");
    } catch {
      setCredits(0);
      setHandRaises(0);
      setNameFont("MONO");
      setBorderColor("CYAN");
    }
  }, [auth?.userId]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  useFocusEffect(
    useCallback(() => {
      loadCredits();
    }, [loadCredits]),
  );

  const purchaseItem = (item: StoreItem) => {
    if (!auth?.userId) {
      Alert.alert("Błąd", "Nie jesteś zalogowany.");
      return;
    }

    Alert.alert("Potwierdź zakup", `Kupić ${item.name} za ${item.cost} pkt?`, [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Kup",
        onPress: async () => {
          try {
            const res = await trpc.purchaseStoreItem.mutate({
              userId: auth.userId,
              itemId: item.id,
            });
            setCredits((res as any).pointsLeft ?? 0);
            setHandRaises((res as any).handRaises ?? handRaises);
            setNameFont((res as any).nameFont ?? nameFont);
            setBorderColor((res as any).borderColor ?? borderColor);
            Alert.alert("Sukces", `Zakupiono: ${item.name}`);
          } catch (e: any) {
            Alert.alert(
              "Błąd",
              e?.message ?? "Nie udało się kupić przedmiotu.",
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[ss.navTitle, { color: C.text1 }]}>
          Skl<Text style={{ color: C.cyan }}>ep</Text>
        </Text>
        <View
          style={[
            ss.creditsBadge,
            { backgroundColor: C.limeBg, borderColor: C.limeBdr },
          ]}
        >
          <Text style={[ss.creditsText, { color: C.lime }]}>{credits} pkt</Text>
        </View>
      </View>

      <View style={ss.effectsRow}>
        <Text style={[ss.effectText, { color: C.text3 }]}>
          R-ka: {handRaises}
        </Text>
        <Text style={[ss.effectText, { color: C.text3 }]}>
          Font: {nameFont}
        </Text>
        <Text style={[ss.effectText, { color: C.text3 }]}>
          Obramówka: {borderColor}
        </Text>
      </View>

      <FlatList
        data={STORE_LIST}
        keyExtractor={(item) => item.id}
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
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  creditsBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  creditsText: { fontSize: 10, fontFamily: "monospace" },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  effectsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  effectText: { fontSize: 10, fontFamily: "monospace" },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },

  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 12, fontWeight: "600", fontFamily: "monospace" },
  cardDescription: { fontSize: 10, lineHeight: 14 },

  costBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  costText: { fontSize: 10, fontFamily: "monospace", fontWeight: "600" },
});

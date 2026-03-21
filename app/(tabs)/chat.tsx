import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DARK, LIGHT, Colors } from "@/lib/colors";

type Convo = {
  id: string;
  initials: string;
  name: string;
  subject: string;
  lastMsg: string;
  time: string;
  unread: number;
  avColor: string;
  avBg: string;
  avBdr: string;
  tagColor: string;
  tagBg: string;
  tagBdr: string;
  online: boolean;
};

function getConvos(C: Colors): Convo[] {
  return [
    { id: "1", initials: "AS", name: "Ania S.",   subject: "Matematyka ⇄ Biologia",       lastMsg: "Dobra, to widzimy się jutro o 15:00 👍",          time: "11:32",   unread: 2, online: true,  avColor: C.lime,  avBg: C.limeBg,  avBdr: C.limeBdr,  tagColor: C.lime,  tagBg: C.limeBg,  tagBdr: C.limeBdr  },
    { id: "2", initials: "PW", name: "Piotr W.",  subject: "Python ⇄ Historia",            lastMsg: "Możesz mi przesłać notatki z tej lekcji?",         time: "10:15",   unread: 1, online: false, avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr,  tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr  },
    { id: "3", initials: "KM", name: "Kasia M.",  subject: "Angielski ⇄ Chemia",          lastMsg: "Super, to do zobaczenia w środę!",                 time: "wczoraj", unread: 0, online: true,  avColor: C.amber, avBg: C.amberBg, avBdr: C.amberBdr, tagColor: C.amber, tagBg: C.amberBg, tagBdr: C.amberBdr },
    { id: "4", initials: "TR", name: "Tomek R.",  subject: "Historia ⇄ Fizyka",            lastMsg: "Dzięki za dzisiejszą sesję, bardzo pomogło!",      time: "wczoraj", unread: 0, online: false, avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr,  tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr  },
    { id: "5", initials: "JP", name: "Julia P.",  subject: "Angielski ⇄ Matematyka",      lastMsg: "Kiedy możemy się umówić na następną sesję?",       time: "pon.",    unread: 0, online: false, avColor: C.rose,  avBg: C.roseBg,  avBdr: C.roseBdr,  tagColor: C.rose,  tagBg: C.roseBg,  tagBdr: C.roseBdr  },
    { id: "6", initials: "BN", name: "Bartek N.", subject: "Fizyka ⇄ Biologia",           lastMsg: "Ok, zaczynamy od termodynamiki.",                  time: "niedz.",  unread: 0, online: false, avColor: C.cyan,  avBg: C.cyanBg,  avBdr: C.cyanBdr,  tagColor: C.cyan,  tagBg: C.cyanBg,  tagBdr: C.cyanBdr  },
  ];
}

function ConvoItem({ item, C }: { item: Convo; C: Colors }) {
  const hasUnread = item.unread > 0;
  return (
    <TouchableOpacity
      style={[
        ss.convoRow, { backgroundColor: C.surface, borderColor: C.border },
        hasUnread && { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
      ]}
      activeOpacity={0.7}
    >
      <View style={ss.avWrap}>
        <View style={[ss.avatar, { backgroundColor: item.avBg, borderColor: item.avBdr }]}>
          <Text style={[ss.avText, { color: item.avColor }]}>{item.initials}</Text>
        </View>
        {item.online && (
          <View style={[ss.onlineDot, { backgroundColor: C.lime, borderColor: C.surface }]} />
        )}
      </View>

      <View style={ss.convoContent}>
        <View style={ss.convoTop}>
          <Text style={[ss.convoName, { color: hasUnread ? C.text1 : C.text2 }, hasUnread && { fontWeight: "500" }]}>
            {item.name}
          </Text>
          <Text style={[ss.convoTime, { color: hasUnread ? C.cyan : C.text3 }]}>{item.time}</Text>
        </View>
        <View style={[ss.subjectTag, { backgroundColor: item.tagBg, borderColor: item.tagBdr }]}>
          <Text style={[ss.subjectText, { color: item.tagColor }]}>{item.subject}</Text>
        </View>
        <View style={ss.convoBottom}>
          <Text style={[ss.lastMsg, { color: hasUnread ? C.text2 : C.text3 }]} numberOfLines={1}>
            {item.lastMsg}
          </Text>
          {hasUnread && (
            <View style={[ss.unreadBadge, { backgroundColor: C.cyan }]}>
              <Text style={[ss.unreadText, { color: C.bg }]}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Chat() {
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C           = colorScheme === "dark" ? DARK : LIGHT;
  const CONVOS      = getConvos(C);
  const unreadTotal = CONVOS.reduce((a, c) => a + c.unread, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={[ss.navTitle, { color: C.text1 }]}>
          Cz<Text style={{ color: C.cyan }}>at</Text>
        </Text>
        {unreadTotal > 0 && (
          <View style={[ss.unreadTotal, { backgroundColor: C.cyanBg, borderColor: C.cyanBdr }]}>
            <Text style={[ss.unreadTotalText, { color: C.cyan }]}>{unreadTotal} nowe</Text>
          </View>
        )}
      </View>

      <FlatList
        data={CONVOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={ss.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => <ConvoItem item={item} C={C} />}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  topNav:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  navTitle:        { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  unreadTotal:     { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  unreadTotalText: { fontSize: 10, fontFamily: "monospace" },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  convoRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderRadius: 16, padding: 13 },
  avWrap:      { position: "relative", flexShrink: 0 },
  avatar:      { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  avText:      { fontSize: 13, fontFamily: "monospace", fontWeight: "600" },
  onlineDot:   { position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },

  convoContent: { flex: 1, gap: 5 },
  convoTop:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convoName:    { fontSize: 13, fontWeight: "400", fontFamily: "monospace" },
  convoTime:    { fontSize: 9, fontFamily: "monospace" },

  subjectTag:  { alignSelf: "flex-start", borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  subjectText: { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },

  convoBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  lastMsg:     { flex: 1, fontSize: 11, fontFamily: "monospace" },

  unreadBadge: { borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadText:  { fontSize: 9, fontWeight: "700", fontFamily: "monospace" },
});

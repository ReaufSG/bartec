import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#05070d",
  surface: "#0d1221",
  surface2: "#090d18",
  border: "rgba(80,120,180,0.14)",
  text1: "#e8eef8",
  text2: "#8fa8cc",
  text3: "#4d6485",
  cyan: "#5bc8e8",
  cyanBg: "rgba(91,200,232,0.08)",
  cyanBdr: "rgba(91,200,232,0.22)",
  lime: "#a8e063",
  limeBg: "rgba(168,224,99,0.08)",
  limeBdr: "rgba(168,224,99,0.22)",
  amber: "#f5c842",
  amberBg: "rgba(245,200,66,0.08)",
  amberBdr: "rgba(245,200,66,0.22)",
  rose: "#e8637a",
  roseBg: "rgba(232,99,122,0.08)",
  roseBdr: "rgba(232,99,122,0.22)",
};

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

const CONVOS: Convo[] = [
  {
    id: "1",
    initials: "AS",
    name: "Ania S.",
    subject: "Matematyka ⇄ Biologia",
    lastMsg: "Dobra, to widzimy się jutro o 15:00 👍",
    time: "11:32",
    unread: 2,
    online: true,
    avColor: C.lime,
    avBg: C.limeBg,
    avBdr: C.limeBdr,
    tagColor: C.lime,
    tagBg: C.limeBg,
    tagBdr: C.limeBdr,
  },
  {
    id: "2",
    initials: "PW",
    name: "Piotr W.",
    subject: "Python ⇄ Historia",
    lastMsg: "Możesz mi przesłać notatki z tej lekcji?",
    time: "10:15",
    unread: 1,
    online: false,
    avColor: C.cyan,
    avBg: C.cyanBg,
    avBdr: C.cyanBdr,
    tagColor: C.cyan,
    tagBg: C.cyanBg,
    tagBdr: C.cyanBdr,
  },
  {
    id: "3",
    initials: "KM",
    name: "Kasia M.",
    subject: "Angielski ⇄ Chemia",
    lastMsg: "Super, to do zobaczenia w środę!",
    time: "wczoraj",
    unread: 0,
    online: true,
    avColor: C.amber,
    avBg: C.amberBg,
    avBdr: C.amberBdr,
    tagColor: C.amber,
    tagBg: C.amberBg,
    tagBdr: C.amberBdr,
  },
  {
    id: "4",
    initials: "TR",
    name: "Tomek R.",
    subject: "Historia ⇄ Fizyka",
    lastMsg: "Dzięki za dzisiejszą sesję, bardzo pomogło!",
    time: "wczoraj",
    unread: 0,
    online: false,
    avColor: C.rose,
    avBg: C.roseBg,
    avBdr: C.roseBdr,
    tagColor: C.rose,
    tagBg: C.roseBg,
    tagBdr: C.roseBdr,
  },
  {
    id: "5",
    initials: "JP",
    name: "Julia P.",
    subject: "Angielski ⇄ Matematyka",
    lastMsg: "Kiedy możemy się umówić na następną sesję?",
    time: "pon.",
    unread: 0,
    online: false,
    avColor: C.rose,
    avBg: C.roseBg,
    avBdr: C.roseBdr,
    tagColor: C.rose,
    tagBg: C.roseBg,
    tagBdr: C.roseBdr,
  },
  {
    id: "6",
    initials: "BN",
    name: "Bartek N.",
    subject: "Fizyka ⇄ Biologia",
    lastMsg: "Ok, zaczynamy od termodynamiki.",
    time: "niedz.",
    unread: 0,
    online: false,
    avColor: C.cyan,
    avBg: C.cyanBg,
    avBdr: C.cyanBdr,
    tagColor: C.cyan,
    tagBg: C.cyanBg,
    tagBdr: C.cyanBdr,
  },
];

function ConvoItem({ item }: { item: Convo }) {
  const hasUnread = item.unread > 0;
  return (
    <TouchableOpacity
      style={[s.convoRow, hasUnread && s.convoRowUnread]}
      activeOpacity={0.7}
    >
      {/* avatar */}
      <View style={s.avWrap}>
        <View
          style={[
            s.avatar,
            { backgroundColor: item.avBg, borderColor: item.avBdr },
          ]}
        >
          <Text style={[s.avText, { color: item.avColor }]}>
            {item.initials}
          </Text>
        </View>
        {item.online && <View style={s.onlineDot} />}
      </View>

      {/* content */}
      <View style={s.convoContent}>
        <View style={s.convoTop}>
          <Text style={[s.convoName, hasUnread && s.convoNameUnread]}>
            {item.name}
          </Text>
          <Text style={[s.convoTime, hasUnread && s.convoTimeUnread]}>
            {item.time}
          </Text>
        </View>
        <View
          style={[
            s.subjectTag,
            { backgroundColor: item.tagBg, borderColor: item.tagBdr },
          ]}
        >
          <Text style={[s.subjectText, { color: item.tagColor }]}>
            {item.subject}
          </Text>
        </View>
        <View style={s.convoBottom}>
          <Text
            style={[s.lastMsg, hasUnread && s.lastMsgUnread]}
            numberOfLines={1}
          >
            {item.lastMsg}
          </Text>
          {hasUnread && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const unreadTotal = CONVOS.reduce((a, c) => a + c.unread, 0);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* TOP NAVBAR */}
      <View style={[s.topNav, { paddingTop: insets.top + 8 }]}>
        <Text style={s.navTitle}>
          Cz<Text style={{ color: C.cyan }}>at</Text>
        </Text>
        {unreadTotal > 0 && (
          <View style={s.unreadTotal}>
            <Text style={s.unreadTotalText}>{unreadTotal} nowe</Text>
          </View>
        )}
      </View>

      <FlatList
        data={CONVOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => <ConvoItem item={item} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text1,
    fontFamily: "monospace",
  },
  unreadTotal: {
    backgroundColor: C.cyanBg,
    borderWidth: 1,
    borderColor: C.cyanBdr,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadTotalText: { fontSize: 10, color: C.cyan, fontFamily: "monospace" },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  separator: { height: 8 },

  convoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 13,
  },
  convoRowUnread: {
    borderColor: "rgba(91,200,232,0.25)",
    backgroundColor: "rgba(91,200,232,0.03)",
  },

  avWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  avText: { fontSize: 13, fontFamily: "monospace", fontWeight: "600" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.surface,
  },

  convoContent: { flex: 1, gap: 5 },
  convoTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convoName: {
    fontSize: 13,
    fontWeight: "400",
    color: C.text2,
    fontFamily: "monospace",
  },
  convoNameUnread: { color: C.text1, fontWeight: "500" },
  convoTime: { fontSize: 9, color: C.text3, fontFamily: "monospace" },
  convoTimeUnread: { color: C.cyan },

  subjectTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  subjectText: { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },

  convoBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  lastMsg: { flex: 1, fontSize: 11, color: C.text3, fontFamily: "monospace" },
  lastMsgUnread: { color: C.text2 },

  unreadBadge: {
    backgroundColor: C.cyan,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 9,
    color: C.bg,
    fontWeight: "700",
    fontFamily: "monospace",
  },
});

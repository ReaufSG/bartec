import { DARK, LIGHT } from "@/lib/colors";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const SUBJECTS = [
  { key: "mat", label: "Matematyka", emoji: "📐" },
  { key: "fiz", label: "Fizyka", emoji: "⚡" },
  { key: "chem", label: "Chemia", emoji: "⚗️" },
  { key: "bio", label: "Biologia", emoji: "🧬" },
  { key: "hist", label: "Historia", emoji: "📜" },
  { key: "geo", label: "Geografia", emoji: "🌍" },
  { key: "ang", label: "Angielski", emoji: "🗣️" },
  { key: "pol", label: "Polski", emoji: "📖" },
  { key: "inf", label: "Informatyka", emoji: "💻" },
  { key: "szt", label: "Sztuka", emoji: "🎨" },
  { key: "muz", label: "Muzyka", emoji: "🎵" },
  { key: "wf", label: "W-F", emoji: "⚽" },
];

type OfferType = "teach" | "learn";

type EditTarget = {
  type: OfferType;
  subject: string;
  description: string;
} | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: OfferType;
    subject: string;
    description: string;
  }) => Promise<void>;
  editTarget: EditTarget;
};

export default function AddOfferModal({
  visible,
  onClose,
  onSubmit,
  editTarget,
}: Props) {
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;

  const [type, setType] = useState<OfferType>("teach");
  const [subject, setSubject] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!editTarget;

  // wypełnij formularz przy edycji
  useEffect(() => {
    if (editTarget) {
      setType(editTarget.type);
      setSubject(editTarget.subject || null);
      setDescription(editTarget.description);
    } else {
      setType("teach");
      setSubject(null);
      setDescription("");
    }
    setError(null);
  }, [editTarget, visible]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!subject) {
      setError("Wybierz przedmiot");
      return;
    }
    if (!description.trim()) {
      setError("Opisz temat / dział");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ type, subject, description: description.trim() });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Coś poszło nie tak");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={ss.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={ss.kavWrap}
      >
        <View
          style={[
            ss.sheet,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <View style={[ss.handle, { backgroundColor: C.border }]} />

          <View style={ss.header}>
            <Text style={[ss.title, { color: C.text1 }]}>
              {isEdit ? "Edytuj " : "Nowa "}
              <Text style={{ color: C.cyan }}>
                {isEdit ? "ofertę" : "oferta"}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={[
                ss.closeBtn,
                { backgroundColor: C.surface2, borderColor: C.border },
              ]}
            >
              <Text style={[ss.closeTxt, { color: C.text2 }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={ss.body}
          >
            {/* TYPE TOGGLE */}
            <Text style={[ss.label, { color: C.text3 }]}>// typ oferty</Text>
            <View
              style={[
                ss.toggle,
                { backgroundColor: C.surface2, borderColor: C.border },
              ]}
            >
              {(["teach", "learn"] as OfferType[]).map((t) => {
                const active = type === t;
                const activeBg = t === "teach" ? C.cyanBg : C.limeBg;
                const activeBdr = t === "teach" ? C.cyanBdr : C.limeBdr;
                const activeCol = t === "teach" ? C.cyan : C.lime;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      ss.toggleBtn,
                      active && {
                        backgroundColor: activeBg,
                        borderWidth: 1,
                        borderColor: activeBdr,
                      },
                    ]}
                    onPress={() => setType(t)}
                    activeOpacity={0.75}
                  >
                    <Text style={ss.toggleEmoji}>
                      {t === "teach" ? "🎓" : "📚"}
                    </Text>
                    <Text
                      style={[
                        ss.toggleTxt,
                        { color: active ? activeCol : C.text3 },
                      ]}
                    >
                      {t === "teach" ? "Uczę kogoś" : "Chcę się nauczyć"}
                    </Text>
                    <Text
                      style={[
                        ss.toggleSub,
                        { color: active ? activeCol : C.text3, opacity: 0.7 },
                      ]}
                    >
                      {t === "teach" ? "dostaję punkty" : "ktoś dostaje punkty"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SUBJECT GRID */}
            <Text style={[ss.label, { color: C.text3 }]}>// przedmiot</Text>
            <View style={ss.subjectGrid}>
              {SUBJECTS.map((s) => {
                const active = subject === s.key;
                const activeCol = type === "teach" ? C.cyan : C.lime;
                const activeBg = type === "teach" ? C.cyanBg : C.limeBg;
                const activeBdr = type === "teach" ? C.cyanBdr : C.limeBdr;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      ss.subjectBtn,
                      { backgroundColor: C.surface2, borderColor: C.border },
                      active && {
                        backgroundColor: activeBg,
                        borderColor: activeBdr,
                      },
                    ]}
                    onPress={() => setSubject(s.key)}
                    activeOpacity={0.75}
                  >
                    <Text style={ss.subjectEmoji}>{s.emoji}</Text>
                    <Text
                      style={[
                        ss.subjectTxt,
                        { color: active ? activeCol : C.text2 },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DESCRIPTION */}
            <Text style={[ss.label, { color: C.text3 }]}>// dział / temat</Text>
            <TextInput
              style={[
                ss.input,
                {
                  backgroundColor: C.surface2,
                  borderColor: C.border,
                  color: C.text1,
                },
              ]}
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setError(null);
              }}
              placeholder={
                type === "teach"
                  ? "np. Całkowanie, granice, pochodne..."
                  : "np. Chemia organiczna — alkeny i alkiny..."
              }
              placeholderTextColor={C.text3}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCapitalize="none"
            />

            {error && (
              <View
                style={[
                  ss.errorBox,
                  { backgroundColor: C.roseBg, borderColor: C.roseBdr },
                ]}
              >
                <Text style={[ss.errorTxt, { color: C.rose }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                ss.submitBtn,
                { backgroundColor: type === "teach" ? C.cyan : C.lime },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} size="small" />
              ) : (
                <Text style={[ss.submitTxt, { color: C.bg }]}>
                  {isEdit
                    ? "Zapisz zmiany →"
                    : type === "teach"
                      ? "Dodaj ofertę nauki →"
                      : "Szukaj nauczyciela →"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ss = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  kavWrap: { justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "monospace" },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: { fontSize: 12, fontFamily: "monospace" },

  body: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
  label: {
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
  },

  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
    gap: 3,
  },
  toggleEmoji: { fontSize: 20 },
  toggleTxt: { fontSize: 11, fontFamily: "monospace", fontWeight: "500" },
  toggleSub: { fontSize: 8, fontFamily: "monospace" },

  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  subjectBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subjectEmoji: { fontSize: 14 },
  subjectTxt: { fontSize: 10, fontFamily: "monospace", fontWeight: "500" },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: "monospace",
    minHeight: 100,
  },
  errorBox: { borderWidth: 1, borderRadius: 8, padding: 10 },
  errorTxt: { fontSize: 11, fontFamily: "monospace" },
  submitBtn: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitTxt: { fontSize: 14, fontWeight: "600", fontFamily: "monospace" },
});

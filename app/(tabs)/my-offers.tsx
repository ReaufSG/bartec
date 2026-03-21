import AddOfferModal from "@/components/AddOfferModal";
import { DARK, LIGHT } from "@/lib/colors";
import { TokenContext } from "@/lib/context";
import { trpc } from "@/lib/trpc_client";
import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Offer = {
  id: string;
  title: string;
  description: string;
  makerId: string;
  createdAt: string;
  updatedAt: string;
  accept?: { id: string } | null;
};

type Lesson = {
  id: string;
  offerId: string;
  offerTitle: string;
  offerDescription: string;
  scheduledAt: string;
  durationMinutes: number;
  scheduleConfirmed?: boolean;
  status: "SCHEDULED" | "COMPLETED";
  lessonRating: number | null;
  lessonReview: string | null;
  raisedHandByStudent?: boolean;
  teacherId: string;
  teacherUsername: string;
  studentId: string;
  studentUsername: string;
  canRate: boolean;
  canMarkCompleted: boolean;
  canSetSchedule?: boolean;
};

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function getDefaultScheduleDate(): Date {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d;
}

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "przed chwilą";
  if (diffH < 24) return `${diffH} godz. temu`;
  if (diffD < 7) return `${diffD} dni temu`;
  return d.toLocaleDateString("pl-PL");
}

function formatLessonDate(date: string): string {
  return new Date(date).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyOffers() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? DARK : LIGHT;
  const auth = useContext(TokenContext);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Offer | null>(null);
  const [busyLessonOfferId, setBusyLessonOfferId] = useState<string | null>(
    null,
  );

  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<Lesson | null>(null);
  const [rateValue, setRateValue] = useState("5");
  const [rateReview, setRateReview] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<Lesson | null>(null);
  const [scheduleAt, setScheduleAt] = useState(getDefaultScheduleDate());
  const [scheduleDuration, setScheduleDuration] = useState(60);
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [all, myLessons] = await Promise.all([
          trpc.fetchOffers.query(),
          auth?.userId ? trpc.getMyLessons.query({ userId: auth.userId }) : [],
        ]);

        const mine = auth?.userId
          ? (all as Offer[]).filter(
              (o) => o.makerId === auth.userId && !o.accept,
            )
          : (all as Offer[]);
        setOffers(mine);

        const sortedLessons = [...((myLessons as Lesson[]) ?? [])].sort(
          (a, b) => {
            const aUnfinished = a.status !== "COMPLETED";
            const bUnfinished = b.status !== "COMPLETED";

            if (aUnfinished !== bUnfinished) {
              return aUnfinished ? -1 : 1;
            }

            if (!aUnfinished && !bUnfinished) {
              const aUnrated = a.lessonRating == null;
              const bUnrated = b.lessonRating == null;
              if (aUnrated !== bUnrated) {
                return aUnrated ? -1 : 1;
              }
            }

            const aTime = new Date(a.scheduledAt).getTime();
            const bTime = new Date(b.scheduledAt).getTime();
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
            if (Number.isNaN(aTime)) return 1;
            if (Number.isNaN(bTime)) return -1;
            return aTime - bTime;
          },
        );

        setLessons(sortedLessons);
      } catch (e: any) {
        setError(e?.message ?? "Błąd pobierania danych");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [auth?.userId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleDelete = (id: string) => {
    const userId = auth?.userId;
    if (!userId) {
      Alert.alert("Błąd", "Nie jesteś zalogowany");
      return;
    }

    Alert.alert("Usuń ofertę", "Na pewno chcesz usunąć tę ofertę?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          try {
            await trpc.deleteOffer.mutate({ id, makerId: userId });
            await fetchData(true);
          } catch (e: any) {
            Alert.alert("Błąd", e?.message ?? "Nie udało się usunąć");
          }
        },
      },
    ]);
  };

  const handleEdit = (item: Offer) => {
    setEditTarget(item);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditTarget(null);
  };

  const handleSubmit = async (data: {
    type: "teach" | "learn";
    subject: string;
    description: string;
  }) => {
    if (!auth?.userId) throw new Error("Nie jesteś zalogowany");

    const subjectMap: Record<string, string> = {
      mat: "Matematyka",
      fiz: "Fizyka",
      chem: "Chemia",
      bio: "Biologia",
      hist: "Historia",
      geo: "Geografia",
      ang: "Angielski",
      pol: "Polski",
      inf: "Informatyka",
      szt: "Sztuka",
      muz: "Muzyka",
      wf: "W-F",
    };
    const subjectLabel = subjectMap[data.subject] ?? data.subject;
    const title =
      data.type === "teach"
        ? `Uczę: ${subjectLabel}`
        : `Szukam nauki: ${subjectLabel}`;

    if (editTarget) {
      await trpc.updateOffer.mutate({
        id: editTarget.id,
        title,
        description: data.description,
      });
    } else {
      await trpc.postOffer.mutate({
        title,
        description: data.description,
        makerId: auth.userId,
      });
    }
    await fetchData(true);
  };

  const handleCompleteLesson = async (lesson: Lesson) => {
    if (!auth?.userId) return;
    setBusyLessonOfferId(lesson.offerId);
    try {
      await trpc.completeLesson.mutate({
        offerId: lesson.offerId,
        userId: auth.userId,
      });
      await fetchData(true);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się oznaczyć lekcji");
    } finally {
      setBusyLessonOfferId(null);
    }
  };

  const handleUseHandRaise = async (lesson: Lesson) => {
    if (!auth?.userId) return;
    setBusyLessonOfferId(lesson.offerId);
    try {
      await trpc.useLessonHandRaise.mutate({
        offerId: lesson.offerId,
        userId: auth.userId,
      });
      Alert.alert("Sukces", "Użyto R-ki dla tej lekcji.");
      await fetchData(true);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się użyć R-ki");
    } finally {
      setBusyLessonOfferId(null);
    }
  };

  const openScheduleModal = (lesson: Lesson) => {
    setScheduleTarget(lesson);
    setScheduleAt(new Date(lesson.scheduledAt));
    setScheduleDuration(lesson.durationMinutes || 60);
    setPickerMode(null);
    setScheduleModalOpen(true);
  };

  const handleSchedulePickerChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") {
      setPickerMode(null);
    }
    if (event.type === "dismissed" || !selected) return;

    const updated = new Date(scheduleAt);
    if ((pickerMode ?? "date") === "date") {
      updated.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
    } else {
      updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    setScheduleAt(updated);
  };

  const submitSchedule = async () => {
    if (!auth?.userId || !scheduleTarget) return;
    if (scheduleAt.getTime() <= Date.now()) {
      Alert.alert("Błąd", "Termin lekcji musi być w przyszłości");
      return;
    }

    setBusyLessonOfferId(scheduleTarget.offerId);
    try {
      await trpc.setLessonSchedule.mutate({
        offerId: scheduleTarget.offerId,
        userId: auth.userId,
        scheduledAt: scheduleAt.toISOString(),
        durationMinutes: scheduleDuration,
      });
      setScheduleModalOpen(false);
      setScheduleTarget(null);
      await fetchData(true);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się ustawić terminu");
    } finally {
      setBusyLessonOfferId(null);
    }
  };

  const openRateModal = (lesson: Lesson) => {
    setRateTarget(lesson);
    setRateValue("5");
    setRateReview("");
    setRateModalOpen(true);
  };

  const submitRating = async () => {
    if (!auth?.userId || !rateTarget) return;

    const parsed = Number(rateValue);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      Alert.alert("Nieprawidłowa ocena", "Podaj ocenę od 1 do 5");
      return;
    }

    setBusyLessonOfferId(rateTarget.offerId);
    try {
      await trpc.rateLesson.mutate({
        offerId: rateTarget.offerId,
        userId: auth.userId,
        rating: parsed,
        review: rateReview.trim() || undefined,
      });
      setRateModalOpen(false);
      setRateTarget(null);
      await fetchData(true);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się zapisać oceny");
    } finally {
      setBusyLessonOfferId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View style={[ss.topNav, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[ss.navTitle, { color: C.text1 }]}>
            Moje <Text style={{ color: C.cyan }}>oferty</Text>
          </Text>
          <Text style={[ss.navSub, { color: C.text3 }]}>
            {loading
              ? "..."
              : `${offers.length} aktywnych · ${lessons.length} lekcji`}
          </Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: C.cyan }]}
          activeOpacity={0.75}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[ss.addBtnText, { color: C.bg }]}>+ nowa oferta</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={ss.center}>
          <ActivityIndicator color={C.cyan} size="large" />
        </View>
      ) : error ? (
        <View style={ss.center}>
          <Text style={[ss.errorTxt, { color: C.rose }]}>{error}</Text>
          <TouchableOpacity
            style={[
              ss.retryBtn,
              { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
            ]}
            onPress={() => fetchData()}
          >
            <Text style={[ss.retryTxt, { color: C.cyan }]}>
              spróbuj ponownie
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={ss.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={C.cyan}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Text style={[ss.sectionLabel, { color: C.text3 }]}>
            // aktywne oferty
          </Text>
          {offers.length === 0 ? (
            <View
              style={[
                ss.emptyBox,
                { borderColor: C.border, backgroundColor: C.surface },
              ]}
            >
              <Text style={[ss.emptyText, { color: C.text3 }]}>
                Brak aktywnych ofert
              </Text>
            </View>
          ) : (
            offers.map((item) => (
              <View
                key={item.id}
                style={[
                  ss.card,
                  { backgroundColor: C.surface, borderColor: C.border },
                ]}
              >
                <View style={ss.cardTop}>
                  <View
                    style={[
                      ss.typeBadge,
                      {
                        backgroundColor: item.title.startsWith("Uczę:")
                          ? C.cyanBg
                          : C.limeBg,
                        borderColor: item.title.startsWith("Uczę:")
                          ? C.cyanBdr
                          : C.limeBdr,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        ss.typeTxt,
                        {
                          color: item.title.startsWith("Uczę:")
                            ? C.cyan
                            : C.lime,
                        },
                      ]}
                    >
                      {item.title.startsWith("Uczę:") ? "🎓 uczę" : "📚 szukam"}
                    </Text>
                  </View>
                  <Text style={[ss.cardTime, { color: C.text3 }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>

                <Text
                  style={[ss.cardTitle, { color: C.text1 }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[ss.cardDesc, { color: C.text2 }]}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>

                <View style={[ss.cardFooter, { borderTopColor: C.border }]}>
                  <Text style={[ss.footerId, { color: C.text3 }]}>
                    id: {item.id.slice(0, 8)}...
                  </Text>
                  <View style={ss.actions}>
                    <TouchableOpacity
                      style={[
                        ss.editBtn,
                        { backgroundColor: C.cyanBg, borderColor: C.cyanBdr },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={[ss.editTxt, { color: C.cyan }]}>
                        edytuj
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        ss.deleteBtn,
                        { backgroundColor: C.roseBg, borderColor: C.roseBdr },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={[ss.deleteTxt, { color: C.rose }]}>
                        usuń
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          <Text style={[ss.sectionLabel, { color: C.text3, marginTop: 16 }]}>
            // zaakceptowane lekcje
          </Text>
          {lessons.length === 0 ? (
            <View
              style={[
                ss.emptyBox,
                { borderColor: C.border, backgroundColor: C.surface },
              ]}
            >
              <Text style={[ss.emptyText, { color: C.text3 }]}>
                Brak zaakceptowanych lekcji
              </Text>
            </View>
          ) : (
            lessons.map((lesson) => {
              const busy = busyLessonOfferId === lesson.offerId;
              const isTeacher = auth?.userId === lesson.teacherId;
              return (
                <View
                  key={lesson.id}
                  style={[
                    ss.lessonCard,
                    { backgroundColor: C.surface, borderColor: C.border },
                  ]}
                >
                  <Text style={[ss.lessonTitle, { color: C.text1 }]}>
                    {lesson.offerTitle}
                  </Text>
                  <Text style={[ss.lessonMeta, { color: C.text3 }]}>
                    Termin: {formatLessonDate(lesson.scheduledAt)}
                  </Text>
                  {!lesson.scheduleConfirmed && (
                    <Text style={[ss.lessonMeta, { color: C.amber }]}>
                      Termin niepotwierdzony przez nauczyciela
                    </Text>
                  )}
                  <Text style={[ss.lessonMeta, { color: C.text3 }]}>
                    Czas trwania: {lesson.durationMinutes} min
                  </Text>
                  <Text style={[ss.lessonMeta, { color: C.text3 }]}>
                    {isTeacher
                      ? `Uczeń: ${lesson.studentUsername}`
                      : `Nauczyciel: ${lesson.teacherUsername}`}
                  </Text>
                  <Text
                    style={[
                      ss.lessonMeta,
                      {
                        color: lesson.status === "COMPLETED" ? C.lime : C.cyan,
                      },
                    ]}
                  >
                    Status:{" "}
                    {lesson.status === "COMPLETED"
                      ? "zakończona"
                      : "zaplanowana"}
                  </Text>
                  {lesson.lessonRating != null && (
                    <Text style={[ss.lessonMeta, { color: C.amber }]}>
                      Ocena: {lesson.lessonRating} ★
                    </Text>
                  )}
                  {lesson.raisedHandByStudent && (
                    <Text style={[ss.lessonMeta, { color: C.rose }]}>
                      R-ka użyta przez ucznia
                    </Text>
                  )}

                  <View style={ss.lessonActions}>
                    {lesson.canSetSchedule && (
                      <TouchableOpacity
                        style={[
                          ss.lessonBtn,
                          {
                            borderColor: C.amberBdr,
                            backgroundColor: C.amberBg,
                          },
                          busy && { opacity: 0.6 },
                        ]}
                        disabled={busy}
                        onPress={() => openScheduleModal(lesson)}
                      >
                        <Text style={[ss.lessonBtnTxt, { color: C.amber }]}>
                          Ustaw termin
                        </Text>
                      </TouchableOpacity>
                    )}
                    {lesson.canMarkCompleted && (
                      <TouchableOpacity
                        style={[
                          ss.lessonBtn,
                          { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
                          busy && { opacity: 0.6 },
                        ]}
                        disabled={busy}
                        onPress={() => handleCompleteLesson(lesson)}
                      >
                        <Text style={[ss.lessonBtnTxt, { color: C.cyan }]}>
                          Oznacz zakończenie
                        </Text>
                      </TouchableOpacity>
                    )}
                    {lesson.canRate && (
                      <TouchableOpacity
                        style={[
                          ss.lessonBtn,
                          { borderColor: C.limeBdr, backgroundColor: C.limeBg },
                          busy && { opacity: 0.6 },
                        ]}
                        disabled={busy}
                        onPress={() => openRateModal(lesson)}
                      >
                        <Text style={[ss.lessonBtnTxt, { color: C.lime }]}>
                          Wystaw ocenę
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!isTeacher &&
                      lesson.status === "SCHEDULED" &&
                      !lesson.raisedHandByStudent && (
                        <TouchableOpacity
                          style={[
                            ss.lessonBtn,
                            {
                              borderColor: C.roseBdr,
                              backgroundColor: C.roseBg,
                            },
                            busy && { opacity: 0.6 },
                          ]}
                          disabled={busy}
                          onPress={() => handleUseHandRaise(lesson)}
                        >
                          <Text style={[ss.lessonBtnTxt, { color: C.rose }]}>
                            Użyj R-ki
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <AddOfferModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editTarget={
          editTarget
            ? {
                type: editTarget.title.startsWith("Uczę:") ? "teach" : "learn",
                subject:
                  editTarget.title.split(": ")[1]?.toLowerCase().slice(0, 3) ??
                  "",
                description: editTarget.description,
              }
            : null
        }
      />

      <Modal
        visible={scheduleModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setScheduleModalOpen(false)}
      >
        <View style={ss.modalOverlay}>
          <View
            style={[
              ss.modalCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <Text style={[ss.modalTitle, { color: C.text1 }]}>
              Ustaw termin lekcji
            </Text>
            <Text style={[ss.modalHint, { color: C.text3 }]}>
              {formatLessonDate(scheduleAt.toISOString())}
            </Text>

            <Text style={[ss.modalHint, { color: C.text3 }]}>
              Czas trwania:
            </Text>
            <View style={ss.durationRow}>
              {DURATION_OPTIONS.map((minutes) => {
                const active = scheduleDuration === minutes;
                return (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      ss.durationBtn,
                      {
                        borderColor: active ? C.cyanBdr : C.border,
                        backgroundColor: active ? C.cyanBg : C.surface2,
                      },
                    ]}
                    onPress={() => setScheduleDuration(minutes)}
                  >
                    <Text
                      style={[
                        ss.durationBtnTxt,
                        { color: active ? C.cyan : C.text2 },
                      ]}
                    >
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {Platform.OS === "ios" ? (
              <View style={ss.iosPickerWrap}>
                <DateTimePicker
                  value={scheduleAt}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    if (!date) return;
                    const updated = new Date(scheduleAt);
                    updated.setFullYear(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                    );
                    setScheduleAt(updated);
                  }}
                />
                <DateTimePicker
                  value={scheduleAt}
                  mode="time"
                  display="spinner"
                  onChange={(_, date) => {
                    if (!date) return;
                    const updated = new Date(scheduleAt);
                    updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
                    setScheduleAt(updated);
                  }}
                />
              </View>
            ) : (
              <View style={ss.androidPickerButtons}>
                <TouchableOpacity
                  style={[
                    ss.pickerBtn,
                    { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
                  ]}
                  onPress={() => setPickerMode("date")}
                >
                  <Text style={[ss.pickerBtnTxt, { color: C.cyan }]}>
                    Wybierz dzień
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    ss.pickerBtn,
                    { borderColor: C.limeBdr, backgroundColor: C.limeBg },
                  ]}
                  onPress={() => setPickerMode("time")}
                >
                  <Text style={[ss.pickerBtnTxt, { color: C.lime }]}>
                    Wybierz godzinę
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {Platform.OS === "android" && pickerMode && (
              <DateTimePicker
                value={scheduleAt}
                mode={pickerMode}
                minimumDate={pickerMode === "date" ? new Date() : undefined}
                is24Hour
                onChange={handleSchedulePickerChange}
              />
            )}

            <View style={ss.modalActions}>
              <TouchableOpacity
                style={[
                  ss.modalBtn,
                  { borderColor: C.border2, backgroundColor: C.surface2 },
                ]}
                onPress={() => {
                  setScheduleModalOpen(false);
                  setScheduleTarget(null);
                }}
              >
                <Text style={[ss.modalBtnTxt, { color: C.text2 }]}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  ss.modalBtn,
                  { borderColor: C.cyanBdr, backgroundColor: C.cyanBg },
                ]}
                onPress={submitSchedule}
              >
                <Text style={[ss.modalBtnTxt, { color: C.cyan }]}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={rateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRateModalOpen(false)}
      >
        <View style={ss.modalOverlay}>
          <View
            style={[
              ss.modalCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <Text style={[ss.modalTitle, { color: C.text1 }]}>Oceń lekcję</Text>
            <TextInput
              value={rateValue}
              onChangeText={setRateValue}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                ss.modalInput,
                {
                  borderColor: C.border2,
                  color: C.text1,
                  backgroundColor: C.surface2,
                },
              ]}
            />
            <TextInput
              value={rateReview}
              onChangeText={setRateReview}
              multiline
              placeholder="Komentarz (opcjonalnie)"
              placeholderTextColor={C.text3}
              style={[
                ss.modalInput,
                ss.modalReview,
                {
                  borderColor: C.border2,
                  color: C.text1,
                  backgroundColor: C.surface2,
                },
              ]}
            />
            <View style={ss.modalActions}>
              <TouchableOpacity
                style={[
                  ss.modalBtn,
                  { borderColor: C.border2, backgroundColor: C.surface2 },
                ]}
                onPress={() => {
                  setRateModalOpen(false);
                  setRateTarget(null);
                }}
              >
                <Text style={[ss.modalBtnTxt, { color: C.text2 }]}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  ss.modalBtn,
                  { borderColor: C.limeBdr, backgroundColor: C.limeBg },
                ]}
                onPress={submitRating}
              >
                <Text style={[ss.modalBtnTxt, { color: C.lime }]}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ss = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  navTitle: { fontSize: 20, fontWeight: "700", fontFamily: "monospace" },
  navSub: { fontSize: 9, fontFamily: "monospace", marginTop: 2 },
  addBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 11, fontWeight: "600", fontFamily: "monospace" },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTxt: { fontSize: 13, fontFamily: "monospace", textAlign: "center" },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryTxt: { fontSize: 11, fontFamily: "monospace" },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  emptyBox: { borderWidth: 1, borderRadius: 12, padding: 12 },
  emptyText: { fontSize: 11, fontFamily: "monospace" },

  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTxt: { fontSize: 9, fontFamily: "monospace", fontWeight: "500" },
  cardTime: { fontSize: 9, fontFamily: "monospace" },
  cardTitle: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  cardDesc: { fontSize: 11, fontFamily: "monospace", lineHeight: 16 },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerId: { fontSize: 8, fontFamily: "monospace" },
  actions: { flexDirection: "row", gap: 6 },
  editBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editTxt: { fontSize: 10, fontFamily: "monospace" },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteTxt: { fontSize: 10, fontFamily: "monospace" },

  lessonCard: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 },
  lessonTitle: { fontSize: 12, fontWeight: "600" },
  lessonMeta: { fontSize: 10, fontFamily: "monospace" },
  lessonActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  lessonBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lessonBtnTxt: { fontSize: 10, fontFamily: "monospace", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  modalTitle: { fontSize: 15, fontWeight: "700" },
  modalHint: { fontSize: 10, fontFamily: "monospace" },
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  durationBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  durationBtnTxt: { fontSize: 10, fontFamily: "monospace", fontWeight: "600" },
  iosPickerWrap: {
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    overflow: "hidden",
  },
  androidPickerButtons: { flexDirection: "row", gap: 8 },
  pickerBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  pickerBtnTxt: { fontSize: 11, fontFamily: "monospace", fontWeight: "600" },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: "monospace",
  },
  modalReview: { minHeight: 80, textAlignVertical: "top" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  modalBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalBtnTxt: { fontSize: 11, fontFamily: "monospace", fontWeight: "600" },
});

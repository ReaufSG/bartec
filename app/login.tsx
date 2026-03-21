import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext, useState } from 'react';
import { TokenContext } from '@/lib/context';
import { DARK, LIGHT } from '@/lib/colors';

type Mode = 'login' | 'register';

export default function Login() {
  const insets      = useSafeAreaInsets();
  const auth        = useContext(TokenContext);
  const colorScheme = useColorScheme();
  const C           = colorScheme === 'dark' ? DARK : LIGHT;

  const [mode,     setMode]     = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await auth!.login({ username: trimmedUsername, password: trimmedPassword });
      } else {
        await auth!.createUser({ username: trimmedUsername, password: trimmedPassword });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Coś poszło nie tak');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      <View style={[s.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>

        {/* LOGO */}
        <View style={s.logoWrap}>
          <Image
            source={require('@/assets/images/bartec_logotyp.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={[s.tagline, { color: C.text3 }]}>// barterowa platforma nauki</Text>
        </View>

        {/* CARD */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>

          {/* MODE TOGGLE */}
          <View style={[s.toggle, { backgroundColor: C.surface2, borderColor: C.border }]}>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'login' && { backgroundColor: C.cyanBg, borderWidth: 1, borderColor: C.cyanBdr }]}
              onPress={() => { setMode('login'); setError(null); }}
              activeOpacity={0.75}
            >
              <Text style={[s.toggleText, { color: mode === 'login' ? C.cyan : C.text3 }]}>
                Logowanie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'register' && { backgroundColor: C.cyanBg, borderWidth: 1, borderColor: C.cyanBdr }]}
              onPress={() => { setMode('register'); setError(null); }}
              activeOpacity={0.75}
            >
              <Text style={[s.toggleText, { color: mode === 'register' ? C.cyan : C.text3 }]}>
                Rejestracja
              </Text>
            </TouchableOpacity>
          </View>

          {/* INPUTS */}
          <View style={s.inputs}>
            <View style={s.inputWrap}>
              <Text style={[s.inputLabel, { color: C.text3 }]}>nazwa użytkownika</Text>
              <TextInput
                style={[s.input, { backgroundColor: C.surface2, borderColor: C.border2, color: C.text1 }]}
                value={username}
                onChangeText={t => { setUsername(t); setError(null); }}
                placeholder="np. jan_kowalski"
                placeholderTextColor={C.text3}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={s.inputWrap}>
              <Text style={[s.inputLabel, { color: C.text3 }]}>hasło</Text>
              <TextInput
                style={[s.input, { backgroundColor: C.surface2, borderColor: C.border2, color: C.text1 }]}
                value={password}
                onChangeText={t => { setPassword(t); setError(null); }}
                placeholder="••••••••"
                placeholderTextColor={C.text3}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* ERROR */}
          {error && (
            <View style={[s.errorBox, { backgroundColor: C.roseBg, borderColor: C.roseBdr }]}>
              <Text style={[s.errorText, { color: C.rose }]}>{error}</Text>
            </View>
          )}

          {/* SUBMIT */}
          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: C.cyan }, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} size="small" />
            ) : (
              <Text style={[s.submitText, { color: C.bg }]}>
                {mode === 'login' ? 'Zaloguj się →' : 'Zarejestruj się →'}
              </Text>
            )}
          </TouchableOpacity>

        </View>

        {/* BOTTOM NOTE */}
        <Text style={[s.bottomNote, { color: C.text3 }]}>
          {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
          <Text
            style={{ color: C.cyan }}
            onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          >
            {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
          </Text>
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 28 },

  logoWrap: { alignItems: 'center', gap: 10 },
  logo:     { height: 48, width: 220 },
  tagline:  { fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.8 },

  card:      { borderWidth: 1, borderRadius: 20, padding: 20, gap: 16 },

  toggle:    { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 3 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleText:{ fontSize: 12, fontFamily: 'monospace' },

  inputs:     { gap: 12 },
  inputWrap:  { gap: 5 },
  inputLabel: { fontSize: 9, fontFamily: 'monospace', letterSpacing: 0.8, textTransform: 'uppercase' },
  input:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: 'monospace' },

  errorBox:  { borderWidth: 1, borderRadius: 8, padding: 10 },
  errorText: { fontSize: 11, fontFamily: 'monospace' },

  submitBtn:         { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },

  bottomNote: { textAlign: 'center', fontSize: 11, fontFamily: 'monospace' },
});

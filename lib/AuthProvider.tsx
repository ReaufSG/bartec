import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { TokenContext } from "./context";
import { trpc } from "./trpc_client";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken,  setUserToken]  = useState<string | null>(null);
  const [username,   setUsername]   = useState<string | null>(null);
  const [userId,     setUserId]     = useState<string | null>(null);
  const [createdAt,  setCreatedAt]  = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const [token, name, id, created] = await AsyncStorage.multiGet([
          'userToken', 'username', 'userId', 'createdAt'
        ]).then(pairs => pairs.map(p => p[1]));

        setUserToken(token ?? null);
        setUsername(name ?? null);
        setCreatedAt(created ?? null);

        // jeśli userId brak ale token jest — wyciągnij z JWT
        if (!id && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserId(payload.userId ?? null);
            if (payload.userId) {
              await AsyncStorage.setItem('userId', payload.userId);
            }
          } catch {
            setUserId(null);
          }
        } else {
          setUserId(id ?? null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inLogin = segments[0] === "login";
    if (!userToken && !inLogin) {
      router.replace("/login");
    } else if (userToken && inLogin) {
      router.replace("/(tabs)");
    }
  }, [userToken, loading, segments]);

  const login = async (credentials: typeof trpc.login.mutate.arguments) => {
    const result = await trpc.login.mutate(credentials);
    const token = (result as any).toke ?? result.token;
    if (!token) throw new Error("No token returned from server");
    await AsyncStorage.multiSet([
      ['userToken',  token],
      ['username',   result.username],
      ['userId',     result.id],
      ['createdAt',  String(result.createdAt)],
    ]);
    setUserToken(token);
    setUsername(result.username);
    setUserId(result.id);
    setCreatedAt(String(result.createdAt));
  };

  const createUser = async (credentials: typeof trpc.createUser.mutate.arguments) => {
    const result = await trpc.createUser.mutate(credentials);
    const token = result.token;
    if (!token) throw new Error("No token returned from server");
    await AsyncStorage.multiSet([
      ['userToken',  token],
      ['username',   result.user.username],
      ['userId',     result.user.id],
      ['createdAt',  String(result.user.createdAt)],
    ]);
    setUserToken(token);
    setUsername(result.user.username);
    setUserId(result.user.id);
    setCreatedAt(String(result.user.createdAt));
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'username', 'userId', 'createdAt']);
    setUserToken(null);
    setUsername(null);
    setUserId(null);
    setCreatedAt(null);
  };

  return (
    <TokenContext.Provider
      value={{ userToken, username, userId, createdAt, login, logout, loading, createUser }}
    >
      {children}
    </TokenContext.Provider>
  );
};

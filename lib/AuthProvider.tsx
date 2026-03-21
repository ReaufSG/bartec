import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { TokenContext } from "./context";
import { trpc } from "./trpc_client";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken,  setUserToken]  = useState<string | null>(null);
  const [username,   setUsername]   = useState<string | null>(null);
  const [createdAt,  setCreatedAt]  = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const router   = useRouter();
  const segments = useSegments();

  // Ładuj dane przy starcie
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token     = await AsyncStorage.getItem("userToken");
        const name      = await AsyncStorage.getItem("username");
        const created   = await AsyncStorage.getItem("createdAt");
        setUserToken(token);
        setUsername(name);
        setCreatedAt(created);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // Guard
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
    const created = result.createdAt ?? new Date().toISOString();
    await AsyncStorage.setItem("userToken",  token);
    await AsyncStorage.setItem("username",   result.username);
    await AsyncStorage.setItem("createdAt",  created);
    setUserToken(token);
    setUsername(result.username);
    setCreatedAt(created);
  };

  const createUser = async (
    credentials: typeof trpc.createUser.mutate.arguments,
  ) => {
    const result = await trpc.createUser.mutate(credentials);
    const token = result.token;
    if (!token) throw new Error("No token returned from server");
    const created = result.user.createdAt ?? new Date().toISOString();
    await AsyncStorage.setItem("userToken",  token);
    await AsyncStorage.setItem("username",   result.user.username);
    await AsyncStorage.setItem("createdAt",  created);
    setUserToken(token);
    setUsername(result.user.username);
    setCreatedAt(created);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("createdAt");
    setUserToken(null);
    setUsername(null);
    setCreatedAt(null);
  };

  return (
    <TokenContext.Provider
      value={{ userToken, username, createdAt, login, logout, loading, createUser }}
    >
      {children}
    </TokenContext.Provider>
  );
};

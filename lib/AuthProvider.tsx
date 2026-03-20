import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "./trpc_client";
import { TokenContext } from "./context";
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setUserToken(token);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (credentials: typeof trpc.login.mutate.arguments) => {
    const token = (await trpc.login.mutate(credentials)).toke;
    await AsyncStorage.setItem("userToken", token);
    setUserToken(token);
  };
  const createUser = async (
    credentials: typeof trpc.createUser.mutate.arguments,
  ) => {
    const token = (await trpc.createUser.mutate(credentials)).token;
    await AsyncStorage.setItem("userToken", token);
    setUserToken(token);
  };
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setUserToken(null);
  };

  const value = {
    userToken,
    login,
    logout,
    loading,
    createUser,
  };
  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};

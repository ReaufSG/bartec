import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { createContext } from "react";

export const TokenContext = createContext<null | value>(null);
type value = {
  userToken: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  createUser: (credentials: any) => Promise<void>;
};

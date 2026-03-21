import { createContext } from "react";

export const TokenContext = createContext<null | value>(null);

type value = {
  userToken:  string | null;
  username:   string | null;
  userId:     string | null;
  createdAt:  string | null;
  login:      (credentials: any) => Promise<void>;
  logout:     () => Promise<void>;
  createUser: (credentials: any) => Promise<void>;
  loading:    boolean;
};

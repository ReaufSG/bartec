import { Button } from "@react-navigation/elements";
import { useContext, useState } from "react";
import { TextInput, View } from "react-native";
import { trpc } from "@/lib/trpc_client";
import { TokenContext } from "@/lib/context";
import React from "react";
export default function Login() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  let storage = useContext(TokenContext);
  return (
    <View style={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
      <TextInput value={name} onChangeText={setName} placeholder="Name" />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        onPress={() =>
          storage!
            .login({ username: name, password })
            .catch((e) => console.error(e))
        }
      >Login</Button>
      <Button
        onPress={() =>
          storage!
            .createUser({ username: name, password })
            .catch((e) => console.error(e))
        }
      >SignUp</Button>
    </View>
  );
}

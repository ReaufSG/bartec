import { Button } from "@react-navigation/elements";
import { useContext, useState } from "react";
import { TextInput, View } from "react-native";
import { trpc } from "@/lib/trpc_client";
import { TokenContext } from "@/lib/context";
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
        title="Login"
        onPress={() =>
          storage!
            .login({ username: name, password })
            .catch((e) => console.error(e))
        }
      />
      <Button
        title="SignUp"
        onPress={() =>
          storage!
            .createUser({ username: name, password })
            .catch((e) => console.error(e))
        }
      />
    </View>
  );
}

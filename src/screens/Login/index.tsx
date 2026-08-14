import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "LoginScreen">;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleEntrar() {
    // Verificação: sem isso, um nome vazio (ou só espaços) navegaria pra Home
    // com userName === "" — aqui garantimos que sempre existe um nome de verdade.
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      setErro("Digite seu nome para continuar");
      return;
    }

    setErro(null);
    // replace (não navigate): remove a LoginScreen da pilha, então o botão
    // de voltar a partir da Home não retorna pra tela de login.
    navigation.replace("HomeScreen", { userName: nomeLimpo });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.eyebrow}>SENSORES</Text>
          <Text style={styles.title}>Como podemos te chamar?</Text>
          <Text style={styles.subtitle}>
            Digite seu nome para entrar no app.
          </Text>

          <TextInput
            style={[styles.input, erro && styles.inputErro]}
            placeholder="Seu nome"
            placeholderTextColor="#9AA39D"
            value={nome}
            onChangeText={(texto) => {
              setNome(texto);
              if (erro) setErro(null); // Some com o erro assim que a pessoa volta a digitar
            }}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleEntrar}
          />

          {erro && <Text style={styles.erroTexto}>{erro}</Text>}

          <TouchableOpacity
            style={styles.botao}
            onPress={handleEntrar}
            activeOpacity={0.85}
          >
            <Text style={styles.botaoTexto}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center", // Centraliza o formulário verticalmente na tela
    paddingHorizontal: 24,
  },

  eyebrow: {
    color: "#25883E",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  title: {
    color: "#18211B",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },

  subtitle: {
    color: "#66706A",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 28,
  },

  // Campo de texto para o nome
  input: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E8E5",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#18211B",
  },

  // Borda vermelha quando a validação falha
  inputErro: {
    borderColor: "#F0C9C9",
    backgroundColor: "#FCF2F2",
  },

  erroTexto: {
    color: "#B12727",
    fontSize: 13,
    marginTop: 8,
  },

  botao: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#25883E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

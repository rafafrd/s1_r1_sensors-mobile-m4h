import React, { useMemo, useState } from "react";
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
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "LoginScreen">;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            placeholderTextColor={colors.textPlaceholder}
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
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.2,
    },

    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: "700",
      marginTop: 8,
    },

    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 8,
      marginBottom: 28,
    },

    // Campo de texto para o nome
    input: {
      height: 54,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.textPrimary,
    },

    // Borda vermelha quando a validação falha
    inputErro: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorBg,
    },

    erroTexto: {
      color: colors.error,
      fontSize: 13,
      marginTop: 8,
    },

    botao: {
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },

    botaoTexto: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Accelerometer } from "expo-sensors";
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

// Sensibilidade do gesto de "balançar" e tempo mínimo entre disparos
const LIMIAR_BALANCO = 1.7;
const INTERVALO_ENTRE_BALANCOS_MS = 1200;

export default function LanternaScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [ligada, setLigada] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Ref espelhando o estado "ligada" para ser lido dentro do listener do acelerômetro
  // sem precisar recriar a assinatura a cada toggle
  const ligadaRef = useRef(ligada);
  const ultimaLeitura = useRef({ x: 0, y: 0, z: 0 });
  const ultimoBalancoEm = useRef(0);

  useEffect(() => {
    ligadaRef.current = ligada;
  }, [ligada]);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const deltaX = Math.abs(x - ultimaLeitura.current.x);
      const deltaY = Math.abs(y - ultimaLeitura.current.y);
      ultimaLeitura.current = { x, y, z };

      const movimentoLateral = deltaX + deltaY;
      const agora = Date.now();
      const dentroDoIntervalo =
        agora - ultimoBalancoEm.current < INTERVALO_ENTRE_BALANCOS_MS;

      if (movimentoLateral > LIMIAR_BALANCO && !dentroDoIntervalo) {
        ultimoBalancoEm.current = agora;

        if (ligadaRef.current) {
          // Balançar para apagar é bloqueado atrás do paywall (piada)
          setModalPagamentoVisivel(true);
        } else {
          setLigada(true);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  function alternarLanterna() {
    setLigada((prev) => !prev);
  }

  const permissaoNegada = permission !== null && !permission.granted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titleScreen}>Lanterna</Text>
        <Text style={styles.paragraph}>
          Toque no ícone para acender ou apagar. Você também pode balançar o
          aparelho de um lado para o outro para acender a lanterna.
        </Text>

        {/* Câmera invisível: o expo-camera exige uma CameraView montada para controlar a tocha */}
        {permission?.granted && (
          <CameraView
            style={styles.cameraOculta}
            facing="back"
            enableTorch={ligada}
          />
        )}

        {permissaoNegada && (
          <View style={styles.avisoPermissao}>
            <Text style={styles.avisoTexto}>
              É necessário permitir o acesso à câmera para controlar a lanterna.
            </Text>
            <TouchableOpacity
              style={styles.botaoPermissao}
              onPress={requestPermission}
            >
              <Text style={styles.botaoPermissaoTexto}>Permitir acesso</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.botaoLanterna, ligada && styles.botaoLanternaAcesa]}
          onPress={alternarLanterna}
          disabled={!permission?.granted}
          activeOpacity={0.8}
        >
          <Text style={styles.iconeLanterna}>🔦</Text>
        </TouchableOpacity>

        <Text style={[styles.status, ligada && styles.statusAcesa]}>
          {ligada ? "Lanterna acesa" : "Lanterna apagada"}
        </Text>
      </View>

      <Modal
        visible={modalPagamentoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPagamentoVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Vire PRO para apagar balançando 💎</Text>
            <Text style={styles.modalTexto}>
              Apagar a lanterna balançando o celular é um recurso exclusivo do
              Plano PRO. Assine agora por apenas{" "}
              <Text style={styles.modalPreco}>R$ 199,90/mês</Text> e continue
              balançando à vontade.
            </Text>

            <TouchableOpacity
              style={styles.modalBotaoPrimario}
              onPress={() => setModalPagamentoVisivel(false)}
            >
              <Text style={styles.modalBotaoPrimarioTexto}>Assinar Plano PRO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBotaoSecundario}
              onPress={() => setModalPagamentoVisivel(false)}
            >
              <Text style={styles.modalBotaoSecundarioTexto}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

    container: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 48,
    },

    titleScreen: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    paragraph: {
      fontSize: 15,
      textAlign: "center",
      color: colors.textSecondary,
      lineHeight: 21,
      marginTop: 10,
    },

    // A CameraView fica com tamanho mínimo e invisível — só existe para acionar a tocha
    cameraOculta: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
    },

    avisoPermissao: {
      marginTop: 24,
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.errorBg,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      alignItems: "center",
    },

    avisoTexto: {
      fontSize: 14,
      color: colors.error,
      textAlign: "center",
      marginBottom: 12,
    },

    botaoPermissao: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
    },

    botaoPermissaoTexto: {
      color: colors.onPrimary,
      fontWeight: "700",
    },

    botaoLanterna: {
      width: 180,
      height: 180,
      borderRadius: 90,
      marginTop: 48,
      marginBottom: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.cardBorder,
    },

    botaoLanternaAcesa: {
      backgroundColor: colors.torchOnBg,
      borderColor: colors.torchOnBorder,
    },

    iconeLanterna: {
      fontSize: 84,
    },

    status: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textSecondary,
    },

    statusAcesa: {
      color: colors.primary,
    },

    modalFundo: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },

    modalCard: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 24,
      alignItems: "center",
    },

    modalTitulo: {
      fontSize: 19,
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 10,
    },

    modalTexto: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 22,
    },

    modalPreco: {
      fontWeight: "700",
      color: colors.primary,
    },

    modalBotaoPrimario: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 10,
    },

    modalBotaoPrimarioTexto: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },

    modalBotaoSecundario: {
      paddingVertical: 8,
      alignItems: "center",
    },

    modalBotaoSecundarioTexto: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
}

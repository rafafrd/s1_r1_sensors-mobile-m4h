import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Accelerometer } from "expo-sensors";

// Sensibilidade do gesto de "balançar" e tempo mínimo entre disparos
const LIMIAR_BALANCO = 1.7;
const INTERVALO_ENTRE_BALANCOS_MS = 1200;

export default function LanternaScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [ligada, setLigada] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);

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
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
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
    color: "#18211B",
  },

  paragraph: {
    fontSize: 15,
    textAlign: "center",
    color: "#66706A",
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
    backgroundColor: "#FBEAEA",
    borderWidth: 1,
    borderColor: "#F2C4C4",
    alignItems: "center",
  },

  avisoTexto: {
    fontSize: 14,
    color: "#b12727",
    textAlign: "center",
    marginBottom: 12,
  },

  botaoPermissao: {
    backgroundColor: "#25883E",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  botaoPermissaoTexto: {
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E4E8E5",
  },

  botaoLanternaAcesa: {
    backgroundColor: "#FFF6D8",
    borderColor: "#F2C94C",
  },

  iconeLanterna: {
    fontSize: 84,
  },

  status: {
    fontSize: 16,
    fontWeight: "700",
    color: "#66706A",
  },

  statusAcesa: {
    color: "#25883E",
  },

  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: "700",
    color: "#18211B",
    textAlign: "center",
    marginBottom: 10,
  },

  modalTexto: {
    fontSize: 15,
    color: "#66706A",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },

  modalPreco: {
    fontWeight: "700",
    color: "#25883E",
  },

  modalBotaoPrimario: {
    width: "100%",
    backgroundColor: "#25883E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  modalBotaoPrimarioTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  modalBotaoSecundario: {
    paddingVertical: 8,
    alignItems: "center",
  },

  modalBotaoSecundarioTexto: {
    color: "#66706A",
    fontSize: 14,
  },
});

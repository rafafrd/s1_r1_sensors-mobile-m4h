// ─────────────────────────────────────────────────────────────────────────────
// Camera/index.tsx — Tela de Câmera.
//
// Permite tirar fotos e gravar vídeos (com áudio), alternar entre câmera
// traseira/frontal, ciclar o flash (off -> on -> auto) e salvar a mídia
// capturada direto na galeria do aparelho.
//
// Paleta própria ("dark red", ver ./colors.ts) — não usa o ThemeContext global,
// então esta tela mantém o mesmo visual independente do tema claro/escuro
// escolhido na Home.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CameraMode,
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../types/navigation";
import { cameraColors } from "./colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CameraScreen">;

// Estado do modal de confirmação de salvamento (sucesso ou erro ao salvar na galeria)
type SaveModalState = {
  visible: boolean;
  status: "success" | "error";
  message: string;
};

// Estado do modal de permissão negada — identifica qual permissão está faltando
type PermissionModalState = {
  visible: boolean;
  kind: "camera" | "microphone" | "gallery";
  message: string;
};

// Título e mensagem padrão de cada tipo de permissão, usados ao abrir o modal
const PERMISSION_INFO: Record<PermissionModalState["kind"], { title: string; message: string }> = {
  camera: {
    title: "Permissão de câmera necessária",
    message: "Precisamos da sua permissão para acessar a câmera e tirar fotos ou gravar vídeos.",
  },
  microphone: {
    title: "Permissão de microfone necessária",
    message: "Precisamos da sua permissão para acessar o microfone e gravar áudio nos vídeos.",
  },
  gallery: {
    title: "Permissão de galeria necessária",
    message: "Precisamos da sua permissão para salvar fotos e vídeos na sua galeria.",
  },
};

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  // Câmera em uso no momento: traseira ou frontal
  const [facing, setFacing] = useState<CameraType>("back");

  // Modo de flash — alterna em ciclo a cada toque no ícone: off -> on -> auto -> off
  const [flash, setFlash] = useState<FlashMode>("off");

  // Modo de captura escolhido pelo usuário no seletor Foto/Vídeo
  const [cameraMode, setCameraMode] = useState<CameraMode>("picture");

  // true enquanto uma gravação de vídeo está em andamento
  const [isRecording, setIsRecording] = useState(false);

  // true enquanto a mídia capturada está sendo salva na galeria — desabilita o botão de captura
  const [isSaving, setIsSaving] = useState(false);

  // Modal de confirmação de salvamento (sucesso ou erro)
  const [saveModal, setSaveModal] = useState<SaveModalState>({
    visible: false,
    status: "success",
    message: "",
  });

  // Modal exibido quando alguma permissão (câmera, microfone ou galeria) é negada
  const [permissionModal, setPermissionModal] = useState<PermissionModalState>({
    visible: false,
    kind: "camera",
    message: "",
  });

  const cameraRef = useRef<CameraView>(null);

  // Solicita as três permissões ao montar a tela. A primeira que vier negada abre
  // o modal explicando o motivo — sempre com uma saída (fechar ou configurações).
  useEffect(() => {
    (async () => {
      const cam = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
      const mic = microphonePermission?.granted ? microphonePermission : await requestMicrophonePermission();
      const gallery = mediaLibraryPermission?.granted
        ? mediaLibraryPermission
        : await requestMediaLibraryPermission();

      if (cam && cam.status !== "granted") {
        setPermissionModal({ visible: true, kind: "camera", message: PERMISSION_INFO.camera.message });
      } else if (mic && mic.status !== "granted") {
        setPermissionModal({ visible: true, kind: "microphone", message: PERMISSION_INFO.microphone.message });
      } else if (gallery && gallery.status !== "granted") {
        setPermissionModal({ visible: true, kind: "gallery", message: PERMISSION_INFO.gallery.message });
      }
    })();
    // Executa apenas uma vez, ao montar a tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fecha automaticamente o modal de sucesso depois de 1.5s; o de erro fica até
  // o usuário fechar manualmente.
  useEffect(() => {
    if (!saveModal.visible || saveModal.status !== "success") return;
    const timer = setTimeout(() => {
      setSaveModal((prev) => ({ ...prev, visible: false }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [saveModal.visible, saveModal.status]);

  function cycleFlash() {
    setFlash((prev) => (prev === "off" ? "on" : prev === "on" ? "auto" : "off"));
  }

  function toggleFacing() {
    if (isRecording) return; // não troca de câmera no meio de uma gravação
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }

  function handleCameraMode(mode: CameraMode) {
    if (isRecording) {
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    }
    setCameraMode(mode);
  }

  async function takeMedia() {
    if (!cameraRef.current || isSaving) return;
    try {
      if (cameraMode === "picture") {
        const foto = await cameraRef.current.takePictureAsync({ quality: 1 });
        if (foto?.uri) await saveToGallery(foto.uri);
      } else if (!isRecording) {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();
        // recordAsync só resolve depois que stopRecording() é chamado
        setIsRecording(false);
        if (video?.uri) await saveToGallery(video.uri);
      } else {
        cameraRef.current.stopRecording();
      }
    } catch (error) {
      setIsRecording(false);
      setSaveModal({ visible: true, status: "error", message: "Não foi possível capturar a mídia." });
    }
  }

  async function saveToGallery(uri: string) {
    setIsSaving(true);
    try {
      // A partir do SDK 57, o expo-media-library reescreveu a API antiga:
      // `saveToLibraryAsync` virou um stub depreciado que lança em runtime.
      // `Asset.create()` é o substituto atual para salvar um arquivo na galeria.
      await MediaLibrary.Asset.create(uri);
      setSaveModal({ visible: true, status: "success", message: "Salvo na galeria!" });
    } catch (error) {
      setSaveModal({ visible: true, status: "error", message: "Falha ao salvar na galeria." });
    } finally {
      setIsSaving(false);
    }
  }

  function fecharSaveModal() {
    setSaveModal((prev) => ({ ...prev, visible: false }));
  }

  function fecharPermissionModal() {
    setPermissionModal((prev) => ({ ...prev, visible: false }));
  }

  function abrirConfiguracoes() {
    Linking.openSettings();
    fecharPermissionModal();
  }

  const flashIcon: keyof typeof MaterialIcons.glyphMap =
    flash === "on" ? "flash-on" : flash === "auto" ? "flash-auto" : "flash-off";

  const permissaoInfo = PERMISSION_INFO[permissionModal.kind];

  // Modal de confirmação de salvamento — usado tanto na tela de câmera quanto na
  // tela de aviso de permissão (uma foto pode falhar antes mesmo de tudo liberado)
  const saveModalUI = (
    <Modal visible={saveModal.visible} transparent animationType="fade" onRequestClose={fecharSaveModal}>
      <View style={styles.modalFundo}>
        <View style={styles.modalCard}>
          <MaterialIcons
            name={saveModal.status === "success" ? "check-circle" : "error"}
            size={40}
            color={saveModal.status === "success" ? cameraColors.success : cameraColors.error}
          />
          <Text style={styles.modalTitulo}>{saveModal.status === "success" ? "Sucesso!" : "Ops!"}</Text>
          <Text style={styles.modalTexto}>{saveModal.message}</Text>
          <TouchableOpacity style={styles.modalBotaoPrimario} onPress={fecharSaveModal}>
            <Text style={styles.modalBotaoPrimarioTexto}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Modal de permissão negada — título e texto mudam conforme a permissão faltante
  const permissionModalUI = (
    <Modal visible={permissionModal.visible} transparent animationType="fade" onRequestClose={fecharPermissionModal}>
      <View style={styles.modalFundo}>
        <View style={styles.modalCard}>
          <MaterialIcons name="lock-outline" size={40} color={cameraColors.accent} />
          <Text style={styles.modalTitulo}>{permissaoInfo.title}</Text>
          <Text style={styles.modalTexto}>{permissionModal.message}</Text>
          <TouchableOpacity style={styles.modalBotaoPrimario} onPress={abrirConfiguracoes}>
            <Text style={styles.modalBotaoPrimarioTexto}>Abrir configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalBotaoSecundario} onPress={fecharPermissionModal}>
            <Text style={styles.modalBotaoSecundarioTexto}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Sem permissão de câmera não há como montar a CameraView — mostra uma tela de
  // aviso com uma saída manual (permitir ou voltar), além do modal já explicar o motivo.
  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.permissaoContainer}>
        <MaterialIcons name="no-photography" size={48} color={cameraColors.textSecondary} />
        <Text style={styles.permissaoTitulo}>Acesso à câmera necessário</Text>
        <Text style={styles.permissaoTexto}>
          Permita o acesso à câmera para tirar fotos e gravar vídeos.
        </Text>
        <TouchableOpacity style={styles.permissaoBotao} onPress={requestCameraPermission}>
          <Text style={styles.permissaoBotaoTexto}>Permitir acesso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissaoBotaoSecundario} onPress={() => navigation.goBack()}>
          <Text style={styles.permissaoBotaoSecundarioTexto}>Voltar</Text>
        </TouchableOpacity>

        {permissionModalUI}
        {saveModalUI}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* A partir do SDK 57, <CameraView> não aceita mais `children` (a preview nativa
          não renderiza subviews React — no iOS isso faz a UI sumir por completo, só
          a câmera aparece). O overlay precisa ser um irmão posicionado em absolute. */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} mode={cameraMode} />

      <View style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.topContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={26} color={cameraColors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.topRightGroup}>
            <TouchableOpacity style={styles.iconButton} onPress={cycleFlash}>
              <MaterialIcons
                name={flashIcon}
                size={26}
                color={flash === "off" ? cameraColors.textPrimary : cameraColors.accent}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, isRecording && styles.iconButtonDisabled]}
              onPress={toggleFacing}
              disabled={isRecording}
            >
              <MaterialIcons name="cameraswitch" size={26} color={cameraColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.modeSelector}>
            <TouchableOpacity onPress={() => handleCameraMode("picture")}>
              <Text style={[styles.modeText, cameraMode === "picture" && styles.modeTextSelected]}>
                Foto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCameraMode("video")}>
              <Text style={[styles.modeText, cameraMode === "video" && styles.modeTextSelected]}>
                Vídeo
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
            onPress={takeMedia}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <View style={[styles.captureInner, isRecording && styles.captureInnerRecording]} />
          </TouchableOpacity>
        </View>
      </View>

      {saveModalUI}
      {permissionModalUI}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Irmão do <CameraView>, sobreposto por cima dele (ver comentário no JSX acima)
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },

  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
  },

  topRightGroup: {
    flexDirection: "row",
    gap: 12,
  },

  iconButton: {
    backgroundColor: cameraColors.iconButtonBg,
    padding: 10,
    borderRadius: 25,
  },

  iconButtonDisabled: {
    opacity: 0.4,
  },

  bottomContainer: {
    alignItems: "center",
    paddingBottom: 40,
  },

  modeSelector: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    backgroundColor: cameraColors.iconButtonBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  modeText: {
    color: cameraColors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  modeTextSelected: {
    color: cameraColors.textPrimary,
  },

  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  captureButtonRecording: {
    backgroundColor: "rgba(229, 56, 74, 0.3)",
  },

  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
  },

  captureInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: cameraColors.accent,
  },

  // ── Tela de aviso quando a permissão de câmera ainda não foi concedida ──────
  permissaoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 6,
    backgroundColor: "black",
  },

  permissaoTitulo: {
    color: cameraColors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  permissaoTexto: {
    color: cameraColors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 18,
  },

  permissaoBotao: {
    backgroundColor: cameraColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  permissaoBotaoTexto: {
    color: cameraColors.onAccent,
    fontWeight: "700",
    fontSize: 15,
  },

  permissaoBotaoSecundario: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  permissaoBotaoSecundarioTexto: {
    color: cameraColors.textSecondary,
    fontSize: 14,
  },

  // ── Modais (mesmo padrão visual do modal da Lanterna, reskinado em vermelho) ─
  modalFundo: {
    flex: 1,
    backgroundColor: cameraColors.overlayBg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: cameraColors.modalCard,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: cameraColors.modalCardBorder,
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: "700",
    color: cameraColors.textPrimary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 10,
  },

  modalTexto: {
    fontSize: 15,
    color: cameraColors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },

  modalBotaoPrimario: {
    width: "100%",
    backgroundColor: cameraColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  modalBotaoPrimarioTexto: {
    color: cameraColors.onAccent,
    fontWeight: "700",
    fontSize: 15,
  },

  modalBotaoSecundario: {
    paddingVertical: 8,
    alignItems: "center",
  },

  modalBotaoSecundarioTexto: {
    color: cameraColors.textSecondary,
    fontSize: 14,
  },
});

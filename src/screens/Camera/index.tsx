import { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  CameraType,
  FlashMode,
  CameraMode,
} from "expo-camera";

export default function CameraScreen() {
  const [permission, setPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraMode, setCameraMode] = useState<CameraMode>("picture");
  const [isRecording, setIsRecording] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      await setPermission();
      await setMicrophonePermission();
    })();
  }, []);

  const handleCameraMode = (mode: CameraMode) => {
    setCameraMode(mode);
    if (isRecording) {
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    }
  }

  const takeMedia = async () => {
    if (!cameraRef.current) return;
    try {
      if (cameraMode === "picture") {
        const foto = await cameraRef.current.takePictureAsync();
        console.log("Foto tirada:", foto.uri);
      } 
      } catch (error) {
        setIsRecording(false);
        console.error("Erro ao capturar mídia:", error);
      }
  };  
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} mode={cameraMode}>
        <View style={styles.overlayContainer}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFlashMode}
            >
              <MaterialIcons
                name="bolt"
                size={30}
                color={flashMode === "on" ? "#FFD700" : "white"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraFacing}
            >
              <MaterialIcons name="cameraswitch" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>

            <View style={styles.controlsContainer}>
              <View style={styles.modeSelector}>
                <TouchableOpacity onPress={() => handleCameraMode("picture")}>
                  <Text
                    style={[
                      styles.modeText,
                      cameraMode === "picture" && styles.modeTextSelected,
                    ]}
                  >
                    Foto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCameraMode("video")}>
                  <Text
                    style={[
                      styles.modeText,
                      cameraMode === "video" && styles.modeTextSelected,
                    ]}
                  >
                    Vídeo
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isRecording && styles.captureButtonRecording,
                ]}
                onPress={takeMedia}
              >
                <View
                  style={[
                    styles.captureInner,
                    isRecording && styles.captureInnerRecording,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 25,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    left: 20,
    bottom: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
  },
  controlsContainer: {
    alignItems: "center",
  },
  modeSelector: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
  modeTextSelected: {
    color: "white",
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
    backgroundColor: "rgba(255, 0, 0, 0.3)",
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
    backgroundColor: "red",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  permissionText: {
    color: "white",
    fontWeight: "bold",
  },
});

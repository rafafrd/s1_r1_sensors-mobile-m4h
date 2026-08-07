import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

export default function PosicaoGpsScreen() {

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
    async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão de localização negada');
      return;
    }
    // Coordenadas de localização atual do dispositivo
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  }

  useEffect(() => {
    getCurrentLocation();
  }, []);

  let text = "Obtendo localização...";

  if(errorMsg) {
    text = errorMsg;
  } else if(location) {
    text = JSON.stringify(location);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titleScreen}>Posição Atual do GPS</Text>
        <Text style={styles.paragraph}>{text}</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Container principal que centraliza todos os elementos na tela
  container: {
    flex: 1,                 // Ocupa toda a área disponível da tela
    backgroundColor: "#f6f6f6", // Cinza muito claro como fundo
    justifyContent: "center", // Centraliza os filhos verticalmente (eixo principal)
    alignItems: "center",    // Centraliza os filhos horizontalmente (eixo cruzado)
  },
  safeArea: {
    flex: 1,                 // Ocupa toda a área segura da tela
    backgroundColor: "#f6f6f6", // Mantém o mesmo fundo do container principal
  },
  // Exibe o texto do GPS ou mensagem de status
  paragraph: {
    fontSize: 18,            // Tamanho médio para boa legibilidade
    textAlign: "center",     // Centraliza o texto dentro do componente
    color: "#b12727",        // Vermelho — chama atenção para os dados exibidos
  },

  // Espaçamento superior (reservado para um possível cabeçalho futuro)
  header: {
    paddingHorizontal: 16, // Espaço interno lateral
    paddingTop: 20,        // Espaço interno superior
  },

  // Título exibido acima dos dados de localização
  titleScreen: {
    fontSize: 18,        // Mesmo tamanho dos dados — ambos no centro da tela
    fontWeight: "bold",  // Negrito para diferenciar do parágrafo de dados
    color: "#1E293B",    // Azul-escuro quase preto — cor de texto primária
  },
});

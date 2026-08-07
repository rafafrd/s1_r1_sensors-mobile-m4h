import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

// ─── Helpers de formatação ──────────────────────────────────────────────────
function formatCoord(value: number): string {
  return value.toFixed(6);
}

function formatMetros(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "Indisponível";
  return `${value.toFixed(1)} m`;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-BR");
}

export default function PosicaoGpsScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Converte as coordenadas em um endereço legível
  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const response: Location.LocationGeocodedAddress[] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response.length > 0) {
        const item = response[0];
        // Monta o endereço (ex: Av. da caverna do dragao, 6767 - São Paulo, SP)
        const formatado = `${item.street || ''}, ${item.streetNumber || ''} - ${item.subregion || ''}, ${item.city || ''} - ${item.region || ''}`;
        setAddress(formatado);
      } else {
        setAddress("Endereço não encontrado");
      }
    } catch (error) {
      console.error(error);
      setAddress("Erro ao converter endereço");
    }
  }

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Converte assim que a posição chega
      await reverseGeocode(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } catch (error) {
      console.error(error);
      setErrorMsg("Não foi possível obter a localização");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  function renderConteudo() {
    if (loading && !location) {
      return (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#25883E" />
          <Text style={styles.loadingText}>Obtendo localização...</Text>
        </View>
      );
    }

    if (errorMsg) {
      return (
        <View style={[styles.card, styles.errorCard]}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      );
    }

    if (!location) {
      return null;
    }

    const { coords, timestamp } = location;

    return (
      <>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Coordenadas</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latitude</Text>
            <Text style={styles.infoValue}>{formatCoord(coords.latitude)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Longitude</Text>
            <Text style={styles.infoValue}>{formatCoord(coords.longitude)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Altitude</Text>
            <Text style={styles.infoValue}>{formatMetros(coords.altitude)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precisão</Text>
            <Text style={styles.infoValue}>{formatMetros(coords.accuracy)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Atualizado em</Text>
            <Text style={styles.infoValue}>{formatTimestamp(timestamp)}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.addressCard]}>
          <Text style={styles.addressLabel}>Endereço aproximado</Text>
          <Text style={styles.addressValue}>
            {address ?? "Convertendo endereço..."}
          </Text>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Posição Atual do GPS</Text>
        <Text style={styles.subtitle}>
          Coordenadas e endereço aproximado com base no GPS do dispositivo.
        </Text>

        {renderConteudo()}

        <TouchableOpacity
          style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
          onPress={getCurrentLocation}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.refreshText}>{loading ? "Atualizando..." : "Atualizar"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Tela principal: ocupa toda a área e define o fundo cinza-claro padrão do app
  screen: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },

  // Container do ScrollView: espaçamento interno e gap entre os cards
  content: {
    padding: 20,
    gap: 16,
  },

  // Título principal da tela
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#18211B",
  },

  // Subtítulo descritivo abaixo do título
  subtitle: {
    fontSize: 15,
    color: "#66706A",
    lineHeight: 22,
    marginTop: -8,
  },

  // Container do spinner de carregamento
  loadingBox: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },

  // Texto abaixo do spinner
  loadingText: {
    color: "#66706A",
    fontSize: 15,
  },

  // Card branco com borda — container reutilizado em múltiplos contextos
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E4E8E5",
  },

  // Linha do indicador de status (ponto colorido + texto "Coordenadas")
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Ponto circular verde que indica sinal de GPS ativo
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#25883E",
  },

  // Texto "Coordenadas"
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18211B",
  },

  // Linha separadora horizontal entre o status e os detalhes
  divider: {
    height: 1,
    backgroundColor: "#EEF1EF",
    marginVertical: 14,
  },

  // Container de cada linha de detalhe (rótulo + valor)
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },

  // Rótulo da esquerda (ex.: "Latitude", "Altitude")
  infoLabel: {
    fontSize: 14,
    color: "#66706A",
  },

  // Valor da direita (ex.: "-23.550520")
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#18211B",
    flexShrink: 1,
    textAlign: "right",
  },

  // Variação do card para estado de erro (fundo e borda avermelhados)
  errorCard: {
    borderColor: "#F0C9C9",
    backgroundColor: "#FCF2F2",
  },

  // Texto de erro exibido dentro do errorCard
  errorText: {
    color: "#B12727",
    fontSize: 15,
    textAlign: "center",
  },

  // Variação do card para o endereço geocodificado (tom verde-claro informativo)
  addressCard: {
    backgroundColor: "#F1F6F2",
    borderColor: "#D6E6D9",
  },

  // Rótulo acima do endereço
  addressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#25883E",
    marginBottom: 6,
  },

  // Texto do endereço formatado
  addressValue: {
    fontSize: 15,
    color: "#4C5B50",
    lineHeight: 21,
  },

  // Botão de atualizar localização — destaque em verde sólido
  refreshButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#25883E",
    alignItems: "center",
    justifyContent: "center",
  },

  // Variação do botão de atualizar enquanto uma busca está em andamento
  refreshButtonDisabled: {
    opacity: 0.6,
  },

  // Texto do botão de atualizar
  refreshText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

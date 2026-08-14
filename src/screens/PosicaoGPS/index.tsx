import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

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
  // Guarda o objeto completo devolvido pelo geocoder, para exibir cada campo separado
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Converte as coordenadas em um endereço legível
  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const response: Location.LocationGeocodedAddress[] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response.length > 0) {
        setAddress(response[0]);
        setAddressError(null);
      } else {
        setAddress(null);
        setAddressError("Endereço não encontrado");
      }
    } catch (error) {
      console.error(error);
      setAddress(null);
      setAddressError("Erro ao converter endereço");
    }
  }

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setAddressError(null);
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
          <ActivityIndicator size="large" color={colors.primary} />
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

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Endereço</Text>
          </View>

          <View style={styles.divider} />

          {renderEndereco(address, addressError)}
        </View>
      </>
    );
  }

  function renderEndereco(
    address: Location.LocationGeocodedAddress | null,
    addressError: string | null
  ) {
    if (addressError) {
      return <Text style={styles.errorText}>{addressError}</Text>;
    }

    if (!address) {
      return <Text style={styles.loadingText}>Convertendo endereço...</Text>;
    }

    return (
      <>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rua</Text>
          <Text style={styles.infoValue}>{address.street || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Número (aproximado)</Text>
          <Text style={styles.infoValue}>{address.streetNumber || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bairro</Text>
          <Text style={styles.infoValue}>{address.district || address.subregion || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>CEP</Text>
          <Text style={styles.infoValue}>{address.postalCode || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cidade</Text>
          <Text style={styles.infoValue}>{address.city || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado</Text>
          <Text style={styles.infoValue}>{address.region || "Indisponível"}</Text>
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
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({

    // Tela principal: ocupa toda a área e define o fundo do tema atual
    screen: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textPrimary,
    },

    // Subtítulo descritivo abaixo do título
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      fontSize: 15,
    },

    // Card com borda — container reutilizado em múltiplos contextos
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },

    // Linha do indicador de status (ponto colorido + texto "Coordenadas")
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    // Ponto circular que indica sinal de GPS ativo
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },

    // Texto "Coordenadas"
    statusText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    // Linha separadora horizontal entre o status e os detalhes
    divider: {
      height: 1,
      backgroundColor: colors.divider,
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
      color: colors.textSecondary,
    },

    // Valor da direita (ex.: "-23.550520")
    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: "right",
    },

    // Variação do card para estado de erro
    errorCard: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorBg,
    },

    // Texto de erro exibido dentro do errorCard
    errorText: {
      color: colors.error,
      fontSize: 15,
      textAlign: "center",
    },

    // Botão de atualizar localização — destaque na cor de marca
    refreshButton: {
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    // Variação do botão de atualizar enquanto uma busca está em andamento
    refreshButtonDisabled: {
      opacity: 0.6,
    },

    // Texto do botão de atualizar
    refreshText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}

import React, {useEffect, useState, useCallback, useMemo} from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

type NetworkInfo = {
  type: Network.NetworkStateType;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  ipAddress: string | null;
  isAirplaneModeEnabled: boolean | null;
};

const typeLabels: Record<string, string> = {
  "WIFI": "Wi-Fi",
  "CELLULAR": "Celular",
  "None": "Nenhuma",
  "UNKNOWN": "Desconhecida",
  "VPN": "VPN",
};

function formatModoAviao(valor: boolean | null): string {
  if (valor === null) return "Indisponível";
  return valor ? "Ativado" : "Desativado";
}

export default function RedesWifiScreen() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const carregarRede = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const networkState = await Network.getNetworkStateAsync();
      let ip = "Indisponivel";
      let airplane: boolean | null = null;

      try {
        ip = await Network.getIpAddressAsync();
      } catch (error) {
        console.error("Erro ao obter IP:", error);
        ip = "Indisponivel";
      }

      // isAirplaneModeEnabledAsync só existe no Android (não suportado no iOS/Web)
      if (Platform.OS === "android") {
        try {
          airplane = await Network.isAirplaneModeEnabledAsync();
        } catch (error) {
          console.error("Erro ao verificar modo avião:", error);
          airplane = null;
        }
      }

      setInfo({
        type: networkState.type ?? Network.NetworkStateType.UNKNOWN,
        isConnected: networkState.isConnected ?? false,
        isInternetReachable: networkState.isInternetReachable ?? false,
        ipAddress: ip,
        isAirplaneModeEnabled: airplane,
      });

    } catch (error) {
      console.error("Erro ao obter informações da rede:", error);
      setErrorMsg("Não foi possivel obter informaçoes da rede")
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    carregarRede();

    const subscription = Network.addNetworkStateListener(() => {
      carregarRede();
    });

    return () => subscription.remove();
  }, [carregarRede]);

  function renderConteudo() {
    if (loading && !info) {
      return (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando informações da rede...</Text>
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

    if (!info) {
      return null;
    }

    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: info.isConnected ? colors.primary : colors.error }]} />
          <Text style={styles.statusText}>
            {info.isConnected ? "Conectado" : "Desconectado"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo de conexão</Text>
          <Text style={styles.infoValue}>{typeLabels[info.type] || "Desconhecida"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Endereço IP</Text>
          <Text style={styles.infoValue}>{info.ipAddress || "Indisponível"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Internet acessível</Text>
          <Text style={styles.infoValue}>{info.isInternetReachable ? "Sim" : "Não"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Modo avião</Text>
          <Text style={styles.infoValue}>{formatModoAviao(info.isAirplaneModeEnabled)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Informações de Rede</Text>
        <Text style={styles.subtitle}>Detalhes sobre a conexão atual</Text>

        {renderConteudo()}

        {info && Platform.OS !== "android" && (
          <View style={[styles.card, styles.noteCard]}>
            <Text style={styles.noteTitle}>Sobre o modo avião</Text>
            <Text style={styles.noteText}>
              A detecção do modo avião só está disponível no Android — por isso
              essa informação não aparece nesta plataforma.
            </Text>
          </View>
        )}

          {/* Card informativo sobre limitações do Expo Go para varredura de redes */}
            <View style={[styles.card, styles.noteCard]}>
                <Text style={styles.noteTitle}>Sobre as redes disponíveis</Text>
                <Text style={styles.noteText}>
                    A varredura de outras redes Wi-Fi próximas e a leitura do nome (SSID)
                    não são permitidas no Expo Go. Esses recursos exigem um módulo nativo
                    e um development build. Aqui mostramos as informações da conexão ativa
                    que o Expo disponibiliza com segurança.
                </Text>
            </View>
            <TouchableOpacity
            style={styles.refreshButton}
            onPress={carregarRede}
            disabled={loading}             // Desabilita o botão quando já está carregado
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
      flex: 1,               // Expande para preencher toda a tela
      backgroundColor: colors.background,
    },

    // Container do ScrollView: define espaçamento interno e gap entre filhos
    content: {
      padding: 20, // Espaçamento interno uniforme em todos os lados
      gap: 16,     // Espaço automático de 16px entre cada filho direto
    },

    // Título principal da tela
    title: {
      fontSize: 26,      // Grande para ser o destaque visual
      fontWeight: "700", // Negrito
      color: colors.textPrimary,
    },

    // Subtítulo descritivo abaixo do título
    subtitle: {
      fontSize: 15,      // Menor que o título
      color: colors.textSecondary,
      lineHeight: 22,    // Altura de linha para boa legibilidade
      marginTop: -8,     // Margem negativa para aproximar do título (o gap do content já espaça)
    },

    // Container do spinner de carregamento
    loadingBox: {
      alignItems: "center",  // Centraliza o spinner e o texto horizontalmente
      paddingVertical: 48,   // Espaço vertical generoso para o spinner "respirar"
      gap: 12,               // Espaço entre o spinner e o texto abaixo
    },

    // Texto abaixo do spinner
    loadingText: {
      color: colors.textSecondary,
      fontSize: 15,
    },

    // Card com borda — container reutilizado em múltiplos contextos
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,           // Cantos arredondados — estética moderna
      padding: 18,                // Espaçamento interno uniforme
      borderWidth: 1,             // Borda fina ao redor do card
      borderColor: colors.cardBorder,
    },

    // Linha do indicador de status (ponto colorido + texto "Conectado")
    statusRow: {
      flexDirection: "row",  // Coloca os filhos em linha horizontal
      alignItems: "center",  // Alinha verticalmente ao centro
      gap: 10,               // Espaço entre o ponto e o texto
    },

    // Ponto circular colorido (cor de marca ou erro)
    statusDot: {
      width: 12,         // Largura fixa do círculo
      height: 12,        // Altura fixa do círculo
      borderRadius: 6,   // Metade da largura/altura = círculo perfeito
      // backgroundColor aplicado dinamicamente no JSX
    },

    // Texto "Conectado" ou "Sem conexão"
    statusText: {
      fontSize: 18,      // Destaque — maior que os textos de detalhe
      fontWeight: "700", // Negrito
      color: colors.textPrimary,
    },

    // Linha separadora horizontal entre status e detalhes
    divider: {
      height: 1,              // Linha de 1px de altura
      backgroundColor: colors.divider,
      marginVertical: 14,     // Espaço acima e abaixo da linha
    },

    // Container de cada linha de detalhe (InfoRow)
    infoRow: {
      flexDirection: "row",        // Rótulo à esquerda, valor à direita
      justifyContent: "space-between", // Empurra rótulo para esquerda e valor para direita
      alignItems: "center",        // Alinha verticalmente ao centro
      paddingVertical: 8,          // Espaço acima e abaixo de cada linha
      gap: 12,                     // Espaço mínimo entre rótulo e valor
    },

    // Rótulo da esquerda (ex.: "Tipo de conexão", "Endereço IP")
    infoLabel: {
      fontSize: 14,     // Tamanho padrão de texto de detalhe
      color: colors.textSecondary,
    },

    // Valor da direita (ex.: "Wi-Fi", "192.168.1.10")
    infoValue: {
      fontSize: 14,
      fontWeight: "600",   // Semi-negrito — destaca o valor em relação ao rótulo
      color: colors.textPrimary,
      flexShrink: 1,       // Permite encolher e quebrar linha se o texto for longo
      textAlign: "right",  // Alinha o texto à direita dentro do seu espaço
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
      textAlign: "center",    // Centraliza a mensagem de erro
    },

    // Variação do card para nota informativa
    noteCard: {
      backgroundColor: colors.noteBg,
      borderColor: colors.noteBorder,
    },

    // Título da nota informativa
    noteTitle: {
      fontSize: 15,
      fontWeight: "700",   // Negrito para destacar o título da nota
      color: colors.noteTitle,
      marginBottom: 6,     // Espaço entre título e texto da nota
    },

    // Corpo de texto da nota informativa
    noteText: {
      fontSize: 14,
      color: colors.noteText,
      lineHeight: 21,    // Altura de linha generosa para boa leitura
    },

    // Botão de atualizar rede — destaque na cor de marca
    refreshButton: {
      height: 52,              // Altura confortável para toque (mínimo recomendado: 44px)
      borderRadius: 12,        // Cantos arredondados
      backgroundColor: colors.primary,
      alignItems: "center",    // Centraliza o texto horizontalmente
      justifyContent: "center", // Centraliza o texto verticalmente
    },

    // Variação do botão de atualizar enquanto uma busca está em andamento
    refreshButtonDisabled: {
      opacity: 0.6, // Esmaece o botão para indicar que a ação está desabilitada
    },

    // Texto do botão de atualizar
    refreshText: {
      color: colors.onPrimary,
      fontSize: 16,        // Tamanho adequado para botão de ação
      fontWeight: "700",   // Negrito — enfatiza a ação
    },
  });
}

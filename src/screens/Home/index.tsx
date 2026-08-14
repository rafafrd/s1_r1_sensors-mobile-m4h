import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;
type HomeRouteProp = RouteProp<RootStackParamList, 'HomeScreen'>;

// A Home só navega para as telas de sensor — nunca para si mesma ou para o login,
// então o tipo da rota do menu exclui essas duas (ambas exigem params diferentes).
type SensorRoute = Exclude<keyof RootStackParamList, 'LoginScreen' | 'HomeScreen'>;

const menuItems: Array<{
  title: string;
  description: string;
  route: SensorRoute;
}> = [
  {
    title: 'Posição Atual do GPS',
    description: 'Verifique a posição atual do GPS do dispositivo.',
    route: 'PosicaoGpsScreen',
  },
  {
    title: "Redes Wi-Fi",
    description: "Verifique as redes Wi-Fi disponíveis.",
    route: "RedesWifiScreen",
  },
  {
    title: "Lanterna",
    description: "Acenda ou apague a lanterna tocando na tela ou balançando o aparelho.",
    route: "LanternaScreen",
  },
  {
    title: "Acelerômetro",
    description: "Verifique os valores do acelerômetro em tempo real.",
    route: "AcelerometroScreen",
  }
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<HomeRouteProp>();
  const userName = params.userName;

  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heading}>
          <View style={styles.topRow}>
            <Text style={styles.eyebrow}>SENSORES</Text>

            {/* Único ponto do app onde o tema é trocado */}
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={toggleTheme}
              activeOpacity={0.85}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              accessibilityLabel="Alternar entre tema claro e escuro"
            >
              <Text style={styles.themeToggleIcon}>{isDark ? "☀️" : "🌙"}</Text>
              <Text style={styles.themeToggleText}>
                {isDark ? "Tema claro" : "Tema escuro"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Bem-vindo, {userName}!</Text>
          <Text style={styles.subtitle}>
            Escolha uma opção abaixo para começar a explorar os sensores do dispositivo.
          </Text>
        </View>

        <View style={styles.list}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
// Função de estilos: recebe as cores do tema atual e monta o StyleSheet.
// Recalculada (via useMemo) só quando o tema muda.
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({

    // Ocupa toda a tela disponível e define a cor de fundo do tema atual
    safeArea: {
      flex: 1,               // Expande para preencher toda a área segura da tela
      backgroundColor: colors.background,
    },

    // Container principal da tela com padding lateral e espaçamento superior
    container: {
      flex: 1,               // Preenche toda a SafeAreaView
      paddingHorizontal: 20, // Margem interna lateral de 20px (esquerda e direita)
      paddingTop: 48,        // Espaço superior generoso para o cabeçalho respirar
    },

    // Bloco do cabeçalho — espaçamento abaixo separa do conteúdo
    heading: {
      marginBottom: 28, // Espaço entre o cabeçalho e a lista de cards
    },

    // Linha com o eyebrow à esquerda e o botão de tema à direita
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    // Texto pequeno em caixa alta (eyebrow / kicker) acima do título
    eyebrow: {
      color: colors.primary,
      fontSize: 12,        // Tamanho pequeno — texto de apoio
      fontWeight: "700",   // Negrito
      letterSpacing: 1.2,  // Espaçamento entre letras: dá o efeito de texto em caixa alta
    },

    // Botão pill de alternar tema
    themeToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },

    themeToggleIcon: {
      fontSize: 14,
    },

    themeToggleText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },

    // Título grande da tela
    title: {
      color: colors.textPrimary,
      fontSize: 30,      // Grande para ser o destaque visual principal
      fontWeight: "700", // Negrito
      marginTop: 8,      // Pequeno espaço acima, separando do eyebrow
    },

    // Subtítulo descritivo abaixo do título
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,      // Legível, mas menor que o título
      lineHeight: 24,    // Altura de linha aumentada para facilitar a leitura
      marginTop: 10,     // Espaço entre o título e o subtítulo
    },

    // Container da lista de cards — gap define espaçamento entre os itens
    list: {
      gap: 12, // Espaçamento uniforme de 12px entre cada card da lista
    },

    // Estilo base de cada card de opção do menu
    card: {
      minHeight: 92,         // Altura mínima garante que cards curtos sejam clicáveis
      alignItems: "center",  // Alinha verticalmente os filhos ao centro
      flexDirection: "row",  // Coloca os filhos em linha horizontal (texto + seta)
      backgroundColor: colors.card,
      borderRadius: 14,      // Cantos arredondados — estética moderna
      paddingHorizontal: 18, // Padding interno: espaço lateral dentro do card
      paddingVertical: 16,   // Padding interno: espaço vertical dentro do card
      borderWidth: 1,        // Borda fina ao redor do card
      borderColor: colors.cardBorder,
    },

    cardText: {
      flex: 1, // flex: 1 faz este elemento crescer e ocupar o espaço restante na linha
    },

    // Título do card (nome da funcionalidade)
    cardTitle: {
      color: colors.textPrimary,
      fontSize: 17,      // Tamanho médio-grande para o nome da funcionalidade
      fontWeight: "700", // Negrito para destaque
    },

    // Descrição curta abaixo do título do card
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 14,      // Menor que o título
      lineHeight: 20,    // Altura de linha confortável para leitura
      marginTop: 5,      // Pequeno espaço entre o título e a descrição
    },

    // Seta "›" no lado direito do card — indica que é navegável
    arrow: {
      color: colors.primary,
      fontSize: 32,      // Grande o suficiente para ser visível
      lineHeight: 32,    // Igual ao fontSize para alinhar verticalmente sem espaço extra
      marginLeft: 12,    // Separa a seta do texto à esquerda
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Acelerometro/index.tsx — Tela do Acelerômetro.
//
// Lê em tempo real a aceleração do dispositivo nos eixos X, Y e Z (em força g).
// A magnitude vetorial combina os três eixos em um único valor.
//
// Controles:
//   - Iniciar: começa a captura e atualiza os valores a cada 200ms
//   - Pausar: interrompe a captura sem zerar os valores
//   - Zerar: reseta os valores exibidos para zero (sem parar a captura)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Accelerometer, AccelerometerMeasurement } from "expo-sensors";
import { ThemeColors } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

// Valor padrão inicial de todos os eixos: zeros.
// Também usado ao zerar os valores manualmente.
// AccelerometerMeasurement exige o campo "timestamp" além de x, y e z.
const ZERO: AccelerometerMeasurement = { x: 0, y: 0, z: 0, timestamp: 0 };

export default function AcelerometroScreen() {
  // Última leitura do acelerômetro: valores de x, y, z em força g
  const [data, setData] = useState<AccelerometerMeasurement>(ZERO);

  // Controla se a captura está em andamento (true) ou pausada (false)
  const [isRunning, setIsRunning] = useState(false);

  // Estado de disponibilidade do sensor:
  //   null  → ainda verificando
  //   true  → disponível
  //   false → não disponível neste dispositivo
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // useRef armazena a assinatura do listener sem causar re-renders ao mudar.
  // É essencial para poder remover o listener (pausar) sem perder a referência.
  // O tipo é inferido do retorno de Accelerometer.addListener.
  const subscription = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  // ── Inicialização ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Verifica se o acelerômetro existe e está acessível neste dispositivo.
    // .catch garante que uma rejeição da Promise seja tratada (define false em vez de lançar erro).
    Accelerometer.isAvailableAsync()
      .then(setIsAvailable)         // Se resolveu: salva o resultado (true ou false)
      .catch(() => setIsAvailable(false)); // Se rejeitou: assume que não está disponível

    // Cleanup executado quando a tela é desmontada (ex.: usuário volta para a Home).
    // Remove o listener para liberar o sensor e evitar memory leak.
    return () => {
      subscription.current?.remove(); // ?. evita erro se já for null
      subscription.current = null;
    };
  }, []); // [] = executa apenas uma vez ao montar

  // ── Iniciar captura ────────────────────────────────────────────────────────
  const iniciar = () => {
    // Guarda de segurança: não faz nada se o sensor não está disponível
    // ou se já existe uma assinatura ativa (evita criar múltiplos listeners)
    if (!isAvailable || subscription.current) return;

    // Define a frequência de atualização: 200ms = 5 leituras por segundo.
    // Valores menores = mais fluido, mas consome mais bateria.
    Accelerometer.setUpdateInterval(200);

    // Registra o listener: callback chamado a cada nova leitura do sensor.
    // "measurement" é um objeto com x, y, z (em g) e timestamp.
    subscription.current = Accelerometer.addListener((measurement) => {
      setData(measurement); // Atualiza o estado com a nova leitura
    });

    setIsRunning(true); // Atualiza a UI para mostrar que está capturando
  };

  // ── Pausar captura ─────────────────────────────────────────────────────────
  const pausar = () => {
    // Remove o listener — para de receber leituras do sensor
    subscription.current?.remove();
    subscription.current = null; // Limpa a referência para permitir reinício
    setIsRunning(false);         // Atualiza a UI para mostrar que está pausado
  };

  // ── Zerar valores ──────────────────────────────────────────────────────────
  // Reseta apenas os valores exibidos — não para a captura se estiver rodando
  const zerar = () => {
    setData(ZERO); // Substitui os dados pelo objeto de zeros
  };

  // ── Magnitude vetorial ─────────────────────────────────────────────────────
  // Calcula a força total combinando os três eixos.
  // Fórmula: √(x² + y² + z²)
  // Em repouso horizontal: ~1g (gravidade terrestre no eixo Z)
  // Em queda livre: ~0g | Sacudindo vigorosamente: > 2g
  const magnitude = Math.hypot(data.x, data.y, data.z);

  return (
    <View style={styles.screen}>

      {/* Cabeçalho: título e descrição da tela */}
      <View style={styles.heading}>
        <Text style={styles.title}>Movimento do aparelho</Text>
        <Text style={styles.subtitle}>
          Valores de aceleração em cada eixo, medidos em força g.
        </Text>
      </View>

      {/* Renderização condicional: sensor ausente → aviso | disponível → conteúdo */}
      {isAvailable === false ? (
        // Aviso exibido quando o acelerômetro não está disponível
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Sensor indisponível</Text>
          <Text style={styles.warningText}>
            Este dispositivo não possui um acelerômetro acessível.
          </Text>
        </View>
      ) : (
        // Fragmento vazio (<>) agrupa múltiplos filhos sem criar um elemento extra no DOM
        <>
          {/* Cards lado a lado para os eixos X, Y e Z */}
          <View style={styles.axes}>
            {/* Cada AxisCard recebe o nome do eixo, seu valor atual e a cor de destaque */}
            <AxisCard axis="X" value={data.x} color={colors.axisX} textColor={colors.onPrimary} styles={styles} />
            <AxisCard axis="Y" value={data.y} color={colors.axisY} textColor={colors.onPrimary} styles={styles} />
            <AxisCard axis="Z" value={data.z} color={colors.axisZ} textColor={colors.onPrimary} styles={styles} />
          </View>

          {/* Card da magnitude total — combina os três eixos em um único valor */}
          <View style={styles.magnitudeCard}>
            <View>
              <Text style={styles.magnitudeLabel}>Magnitude total</Text>
              <Text style={styles.magnitudeHint}>Combinação dos três eixos</Text>
            </View>
            {/* .toFixed(3): exibe sempre 3 casas decimais para consistência visual */}
            <Text style={styles.magnitudeValue}>{magnitude.toFixed(3)} g</Text>
          </View>

          {/* Indicador de status: ponto colorido + texto descrevendo o estado */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                // Cor dinâmica: cor de marca se capturando, cinza se pausado
                { backgroundColor: isRunning ? colors.primary : colors.statusMuted },
              ]}
            />
            <Text style={styles.statusText}>
              {isRunning ? "Captura em andamento" : "Captura pausada"}
            </Text>
          </View>

          {/* Botões de controle: Iniciar (preenchido) e Pausar (contorno) */}
          <View style={styles.controls}>

            {/* Botão Iniciar: desabilitado se já estiver rodando ou sem sensor */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                isRunning && styles.disabledButton, // Aplica estilo de desabilitado condicionalmente
              ]}
              onPress={iniciar}
              disabled={isRunning || isAvailable !== true}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Iniciar leitura do acelerômetro"
            >
              <Text style={styles.primaryButtonText}>Iniciar</Text>
            </TouchableOpacity>

            {/* Botão Pausar: desabilitado se não estiver capturando */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                !isRunning && styles.disabledButton, // Desabilitado quando não está rodando
              ]}
              onPress={pausar}
              disabled={!isRunning}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Pausar leitura do acelerômetro"
            >
              <Text style={styles.secondaryButtonText}>Pausar</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de zerar: reseta os valores sem parar a captura */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={zerar}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Zerar valores do acelerômetro"
          >
            <Text style={styles.resetButtonText}>Zerar valores</Text>
          </TouchableOpacity>

          {/* Dica de uso para o usuário entender o valor esperado */}
          <Text style={styles.helpText}>
            Apoie o aparelho sobre uma superfície estável para observar cerca de 1 g no eixo vertical.
          </Text>
        </>
      )}
    </View>
  );
}

// ─── Componente auxiliar AxisCard ─────────────────────────────────────────────
// Exibe o valor de aceleração de um único eixo com badge colorido e unidade.
// Recebe: axis (letra), value (número), color (cor do badge), textColor (cor da letra
// dentro do badge) e os estilos já resolvidos para o tema atual.
function AxisCard({
  axis,
  value,
  color,
  textColor,
  styles,
}: Readonly<{
  axis: string;
  value: number;
  color: string;
  textColor: string;
  styles: ReturnType<typeof createStyles>;
}>) {
  return (
    // accessibilityLabel torna o card legível por leitores de tela
    <View style={styles.axisCard} accessibilityLabel={`Eixo ${axis}: ${value.toFixed(3)} g`}>

      {/* Badge colorido com a letra do eixo (X, Y ou Z) */}
      <View style={[styles.axisBadge, { backgroundColor: color }]}>
        <Text style={[styles.axisLetter, { color: textColor }]}>{axis}</Text>
      </View>

      {/* Valor numérico com 3 casas decimais */}
      <Text style={styles.axisValue}>{value.toFixed(3)}</Text>

      {/* Unidade de medida */}
      <Text style={styles.axisUnit}>g</Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({

    // Tela principal: fundo do tema atual e padding uniforme
    screen: {
      flex: 1,               // Ocupa toda a área disponível
      backgroundColor: colors.background,
      padding: 20,           // Espaçamento interno em todos os lados
    },

    // Bloco de cabeçalho
    heading: {
      marginBottom: 24, // Separa o cabeçalho dos cards de eixo abaixo
    },

    // Título principal da tela
    title: {
      fontSize: 26,      // Grande para ser o destaque visual
      fontWeight: "700", // Negrito
      color: colors.textPrimary,
    },

    // Subtítulo explicativo
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,    // Altura de linha para boa legibilidade
      marginTop: 8,      // Pequeno espaço entre título e subtítulo
    },

    // Container dos três cards de eixo lado a lado
    axes: {
      flexDirection: "row", // Coloca X, Y e Z horizontalmente
      gap: 10,              // Espaço de 10px entre cada card de eixo
    },

    // Card individual de cada eixo (X, Y ou Z)
    axisCard: {
      flex: 1,                 // flex: 1 divide o espaço igualmente entre os 3 cards
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingVertical: 18,     // Padding vertical interno — sem horizontal, pois o conteúdo é centralizado
      alignItems: "center",    // Centraliza o badge, valor e unidade horizontalmente
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },

    // Badge circular colorido com a letra do eixo
    axisBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,         // Metade de 34px = círculo perfeito
      alignItems: "center",     // Centraliza a letra horizontalmente
      justifyContent: "center", // Centraliza a letra verticalmente
      marginBottom: 12,         // Espaço entre o badge e o valor numérico abaixo
      // backgroundColor aplicado dinamicamente (cor do eixo)
    },

    // Letra dentro do badge (X, Y ou Z)
    axisLetter: {
      fontSize: 16,
      fontWeight: "700", // Negrito
      // color aplicado dinamicamente (contraste com o fundo do badge)
    },

    // Valor numérico do eixo (ex.: "0.982")
    axisValue: {
      color: colors.textPrimary,
      fontSize: 20,      // Grande para facilitar a leitura em tempo real
      fontWeight: "700",
    },

    // Unidade de medida "g" abaixo do valor
    axisUnit: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,      // Pequeno espaço acima da unidade
    },

    // Card da magnitude total (linha horizontal com rótulo e valor)
    magnitudeCard: {
      flexDirection: "row",        // Rótulo à esquerda, valor à direita
      justifyContent: "space-between", // Empurra os elementos para as extremidades
      alignItems: "center",        // Alinha verticalmente ao centro
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginTop: 12,               // Espaço acima, separando dos cards de eixo
      gap: 12,                     // Espaço mínimo entre rótulo e valor
    },

    // Rótulo "Magnitude total"
    magnitudeLabel: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    // Texto auxiliar "Combinação dos três eixos"
    magnitudeHint: {
      color: colors.textSecondary,
      fontSize: 12,      // Pequeno — informação de suporte
      marginTop: 3,      // Pequeno espaço acima
    },

    // Valor numérico da magnitude (ex.: "1.024 g")
    magnitudeValue: {
      color: colors.primary,
      fontSize: 21,
      fontWeight: "700",
    },

    // Linha do indicador de status (ponto + texto)
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,            // Espaço entre o ponto e o texto
      marginTop: 20,     // Espaço acima, separando do card de magnitude
    },

    // Ponto circular de status
    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,   // Metade ≈ círculo (4.5px arredondado para 5)
      // backgroundColor aplicado dinamicamente (cor de marca ou cinza)
    },

    // Texto de status ("Captura em andamento" / "Captura pausada")
    statusText: {
      color: colors.textSecondary,
      fontSize: 14,
    },

    // Linha com os botões Iniciar e Pausar lado a lado
    controls: {
      flexDirection: "row", // Botões lado a lado
      gap: 12,              // Espaço entre os botões
      marginTop: 14,        // Espaço acima dos botões
    },

    // Estilo base compartilhado pelos dois botões de controle
    button: {
      flex: 1,              // Cada botão ocupa metade do espaço disponível
      height: 50,           // Altura fixa — confortável para toque
      borderRadius: 12,     // Cantos arredondados
      alignItems: "center", // Centraliza o texto horizontalmente
      justifyContent: "center", // Centraliza o texto verticalmente
    },

    // Botão primário: fundo sólido na cor de marca (Iniciar)
    primaryButton: {
      backgroundColor: colors.primary,
    },

    // Texto do botão primário
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    // Botão secundário: contorno na cor de marca, sem preenchimento (Pausar)
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,             // Borda para delimitar o botão
      borderColor: colors.primary,
    },

    // Texto do botão secundário
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },

    // Estilo de botão desabilitado — reduz opacidade para indicar inatividade
    disabledButton: {
      opacity: 0.45, // 45% de opacidade — visualmente "apagado" mas ainda visível
    },

    // Botão de zerar — sem fundo, apenas área clicável
    resetButton: {
      height: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,     // Espaço acima, separando dos botões principais
    },

    // Texto do botão de zerar — estilo discreto
    resetButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "600", // Semi-negrito
    },

    // Texto de dica de uso no final da tela
    helpText: {
      color: colors.textSecondary,
      fontSize: 13,       // Pequeno — texto informativo de baixo destaque
      lineHeight: 19,     // Altura de linha para boa leitura
      textAlign: "center", // Centraliza o texto
      marginTop: 18,      // Espaço acima, separando do botão de zerar
    },

    // Card de aviso: sensor não disponível
    warningCard: {
      backgroundColor: colors.errorBg,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      borderRadius: 14,
      padding: 18,
    },

    // Título do aviso
    warningTitle: {
      color: colors.error,
      fontSize: 16,
      fontWeight: "700",
    },

    // Corpo do texto do aviso
    warningText: {
      color: colors.errorMutedText,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 6,      // Espaço entre o título e o texto do aviso
    },
  });
}

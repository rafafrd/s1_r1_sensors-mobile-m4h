// ─────────────────────────────────────────────────────────────────────────────
// colors.ts — Paletas de cores do app (tema claro e tema escuro).
//
// Cada tela consome essas cores via useTheme() em vez de hexadecimais fixos no
// StyleSheet, para que trocar de tema recolora o app inteiro de uma vez só.
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeColors = {
  // Fundo geral da tela e superfícies (cards)
  background: string;
  card: string;
  cardBorder: string;
  divider: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textPlaceholder: string;

  // Cor de destaque da marca — usada em botões, pontos de status, links,
  // o "eyebrow" e a seta dos cards. É o token que muda mais drasticamente
  // entre os temas (verde no claro, roxo "midnight" no escuro).
  primary: string;
  onPrimary: string; // texto/ícone sobre um fundo `primary`

  // Ponto/status "pausado", "desconectado" ou inativo
  statusMuted: string;

  // Erros (permissão negada, falha ao carregar, sensor indisponível)
  error: string;
  errorMutedText: string; // corpo de texto dentro de um card de erro (menos contraste que `error`)
  errorBg: string;
  errorBorder: string;

  // Cards de nota informativa (ex.: limitações do Expo Go)
  noteBg: string;
  noteBorder: string;
  noteTitle: string;
  noteText: string;

  // Lanterna acesa — destaque quente, independente da cor de marca
  torchOnBg: string;
  torchOnBorder: string;

  // Eixos X/Y/Z do acelerômetro
  axisX: string;
  axisY: string;
  axisZ: string;

  // Fundo escurecido atrás de modais
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: "#F6F7F8",
  card: "#FFFFFF",
  cardBorder: "#E4E8E5",
  divider: "#EEF1EF",

  textPrimary: "#18211B",
  textSecondary: "#66706A",
  textPlaceholder: "#9AA39D",

  primary: "#25883E",
  onPrimary: "#FFFFFF",

  statusMuted: "#66706A",

  error: "#B12727",
  errorMutedText: "#7A4545",
  errorBg: "#FCF2F2",
  errorBorder: "#F0C9C9",

  noteBg: "#F1F6F2",
  noteBorder: "#D6E6D9",
  noteTitle: "#25883E",
  noteText: "#4C5B50",

  torchOnBg: "#FFF6D8",
  torchOnBorder: "#F2C94C",

  axisX: "#B12727",
  axisY: "#25883E",
  axisZ: "#376FA3",

  overlay: "rgba(0, 0, 0, 0.55)",
};

// Tema escuro "midnight purple" — fundo quase preto com tom de roxo profundo,
// destaque em violeta vibrante no lugar do verde do tema claro.
export const darkColors: ThemeColors = {
  background: "#120D1F",
  card: "#1D1730",
  cardBorder: "#332752",
  divider: "#2A2145",

  textPrimary: "#F3EFFB",
  textSecondary: "#A99FC4",
  textPlaceholder: "#6F6390",

  primary: "#8B5CF6",
  onPrimary: "#FFFFFF",

  statusMuted: "#A99FC4",

  error: "#F87171",
  errorMutedText: "#C99AA6",
  errorBg: "#331B24",
  errorBorder: "#5C2A3A",

  noteBg: "#241C3D",
  noteBorder: "#3D2F5C",
  noteTitle: "#C4B5FD",
  noteText: "#C9BFE0",

  torchOnBg: "#3A331A",
  torchOnBorder: "#F2C94C",

  axisX: "#F87171",
  axisY: "#4ADE80",
  axisZ: "#60A5FA",

  overlay: "rgba(5, 2, 15, 0.75)",
};

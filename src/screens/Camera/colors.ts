// ─────────────────────────────────────────────────────────────────────────────
// colors.ts — Paleta LOCAL da tela de Câmera ("dark red").
//
// Isolada do tema global (src/theme/colors.ts + ThemeContext) — a Câmera não
// segue o claro/escuro do resto do app, sempre usa este fundo quase preto com
// tom de vermelho, independente do tema escolhido na Home.
// ─────────────────────────────────────────────────────────────────────────────

export const cameraColors = {
  overlayBg: "rgba(10, 2, 4, 0.75)", // fundo escurecido atrás dos modais
  modalCard: "#241318", // card do modal
  modalCardBorder: "#3D1F26",
  textPrimary: "#F5E9EB",
  textSecondary: "#B98A90",
  accent: "#E5384A", // vermelho de destaque (botões primários, ícones ativos)
  onAccent: "#FFFFFF",
  success: "#4ADE80", // verde pra sucesso, mesmo dentro do tema vermelho
  error: "#F87171", // erro em vermelho mais claro que o accent
  iconButtonBg: "rgba(20, 4, 8, 0.55)", // fundo dos botões de ícone sobre o preview da câmera
};

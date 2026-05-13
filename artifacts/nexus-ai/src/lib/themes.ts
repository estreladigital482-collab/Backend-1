export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: "hacker",
    name: "Hacker",
    description: "Ciano neon no escuro — o tema padrão do CAOS",
    emoji: "💻",
    vars: {
      "--background": "240 10% 4%",
      "--foreground": "180 100% 95%",
      "--card": "240 10% 6%",
      "--card-foreground": "180 100% 90%",
      "--primary": "185 100% 50%",
      "--primary-foreground": "240 10% 4%",
      "--secondary": "280 100% 60%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "240 10% 12%",
      "--muted-foreground": "180 30% 60%",
      "--accent": "185 100% 20%",
      "--accent-foreground": "185 100% 80%",
      "--border": "180 50% 15%",
      "--ring": "185 100% 50%",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Roxo e rosa vibrante — estilo galáxia",
    emoji: "🌌",
    vars: {
      "--background": "260 20% 4%",
      "--foreground": "300 100% 97%",
      "--card": "260 20% 7%",
      "--card-foreground": "300 80% 92%",
      "--primary": "300 100% 65%",
      "--primary-foreground": "260 20% 4%",
      "--secondary": "220 100% 65%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "260 15% 12%",
      "--muted-foreground": "280 30% 60%",
      "--accent": "300 60% 20%",
      "--accent-foreground": "300 100% 80%",
      "--border": "280 40% 18%",
      "--ring": "300 100% 65%",
    },
  },
  {
    id: "forest",
    name: "Floresta",
    description: "Verde matrix — natureza digital",
    emoji: "🌿",
    vars: {
      "--background": "140 15% 4%",
      "--foreground": "120 80% 92%",
      "--card": "140 15% 7%",
      "--card-foreground": "120 60% 88%",
      "--primary": "130 80% 50%",
      "--primary-foreground": "140 15% 4%",
      "--secondary": "90 70% 50%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "140 10% 12%",
      "--muted-foreground": "130 25% 55%",
      "--accent": "130 50% 18%",
      "--accent-foreground": "130 80% 75%",
      "--border": "130 40% 15%",
      "--ring": "130 80% 50%",
    },
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    description: "Laranja e vermelho quente — energia solar",
    emoji: "🌅",
    vars: {
      "--background": "20 15% 4%",
      "--foreground": "30 100% 95%",
      "--card": "20 15% 7%",
      "--card-foreground": "30 80% 90%",
      "--primary": "25 100% 60%",
      "--primary-foreground": "20 15% 4%",
      "--secondary": "0 80% 60%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "20 10% 12%",
      "--muted-foreground": "25 30% 58%",
      "--accent": "25 60% 18%",
      "--accent-foreground": "25 100% 78%",
      "--border": "25 40% 15%",
      "--ring": "25 100% 60%",
    },
  },
  {
    id: "ocean",
    name: "Oceano",
    description: "Azul profundo — calma e profundidade",
    emoji: "🌊",
    vars: {
      "--background": "210 30% 4%",
      "--foreground": "200 80% 94%",
      "--card": "210 30% 7%",
      "--card-foreground": "200 60% 88%",
      "--primary": "205 100% 55%",
      "--primary-foreground": "210 30% 4%",
      "--secondary": "175 80% 50%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "210 20% 12%",
      "--muted-foreground": "205 25% 58%",
      "--accent": "205 60% 18%",
      "--accent-foreground": "205 100% 78%",
      "--border": "205 40% 16%",
      "--ring": "205 100% 55%",
    },
  },
  {
    id: "gold",
    name: "Ouro",
    description: "Dourado real — luxo e poder",
    emoji: "👑",
    vars: {
      "--background": "40 20% 4%",
      "--foreground": "50 90% 94%",
      "--card": "40 20% 7%",
      "--card-foreground": "50 70% 88%",
      "--primary": "45 100% 55%",
      "--primary-foreground": "40 20% 4%",
      "--secondary": "35 80% 50%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "40 10% 12%",
      "--muted-foreground": "45 25% 55%",
      "--accent": "45 60% 18%",
      "--accent-foreground": "45 100% 75%",
      "--border": "45 40% 15%",
      "--ring": "45 100% 55%",
    },
  },
  {
    id: "ice",
    name: "Gelo",
    description: "Branco e azul frio — minimalismo ártico",
    emoji: "❄️",
    vars: {
      "--background": "220 30% 6%",
      "--foreground": "210 40% 96%",
      "--card": "220 25% 9%",
      "--card-foreground": "210 30% 92%",
      "--primary": "200 100% 75%",
      "--primary-foreground": "220 30% 6%",
      "--secondary": "240 60% 70%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "220 15% 14%",
      "--muted-foreground": "210 20% 60%",
      "--accent": "200 50% 20%",
      "--accent-foreground": "200 100% 85%",
      "--border": "200 30% 18%",
      "--ring": "200 100% 75%",
    },
  },
  {
    id: "blood",
    name: "Sangue",
    description: "Vermelho intenso — perigo e poder",
    emoji: "🔴",
    vars: {
      "--background": "0 15% 4%",
      "--foreground": "0 80% 95%",
      "--card": "0 15% 7%",
      "--card-foreground": "0 60% 90%",
      "--primary": "0 100% 55%",
      "--primary-foreground": "0 15% 4%",
      "--secondary": "30 80% 55%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "0 10% 12%",
      "--muted-foreground": "0 25% 55%",
      "--accent": "0 50% 18%",
      "--accent-foreground": "0 100% 78%",
      "--border": "0 40% 16%",
      "--ring": "0 100% 55%",
    },
  },
];

export const THEME_KEY = "caos_theme";

export function applyTheme(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
  localStorage.setItem(THEME_KEY, themeId);
}

export function loadSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY) ?? "hacker";
  applyTheme(saved);
  return saved;
}

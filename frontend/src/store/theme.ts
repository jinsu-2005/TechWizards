import { create } from "zustand";

export type ThemeId =
  | "obsidian"
  | "cyber-neon"
  | "scada-emerald"
  | "solar-flare"
  | "abyssal-blue"
  | "crimson-protocol"
  | "quantum-violet"
  | "monochrome-stealth"
  | "titanium-clean";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    status: string;
  };
  isLight?: boolean;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "obsidian",
    name: "Obsidian Dark",
    tagline: "Default SCADA Dark Room",
    colors: {
      bg: "#0b0f14",
      surface: "#121821",
      accent: "#4c8dff",
      status: "#2ea97d",
    },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    tagline: "Synthwave Tokyo Matrix",
    colors: {
      bg: "#080410",
      surface: "#120922",
      accent: "#e879f9",
      status: "#2ea97d",
    },
  },
  {
    id: "scada-emerald",
    name: "SCADA Emerald",
    tagline: "Tactical Phosphor Terminal",
    colors: {
      bg: "#040f0c",
      surface: "#0a1c17",
      accent: "#34d399",
      status: "#2ea97d",
    },
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    tagline: "Refinery Amber & Foundry",
    colors: {
      bg: "#100a04",
      surface: "#1c1208",
      accent: "#f59e0b",
      status: "#2ea97d",
    },
  },
  {
    id: "abyssal-blue",
    name: "Abyssal Blue",
    tagline: "Submarine Sonar & Maritime",
    colors: {
      bg: "#030914",
      surface: "#07152b",
      accent: "#0ea5e9",
      status: "#2ea97d",
    },
  },
  {
    id: "crimson-protocol",
    name: "Crimson Protocol",
    tagline: "DEFCON-1 Red Alert Defense",
    colors: {
      bg: "#120508",
      surface: "#1f0a10",
      accent: "#fb7185",
      status: "#2ea97d",
    },
  },
  {
    id: "quantum-violet",
    name: "Quantum Violet",
    tagline: "Deep Space & Aerospace Core",
    colors: {
      bg: "#080714",
      surface: "#110f29",
      accent: "#a855f7",
      status: "#2ea97d",
    },
  },
  {
    id: "monochrome-stealth",
    name: "Monochrome Stealth",
    tagline: "Tactical Carbon & Radar",
    colors: {
      bg: "#0f0f11",
      surface: "#18181b",
      accent: "#e4e4e7",
      status: "#2ea97d",
    },
  },
  {
    id: "titanium-clean",
    name: "Titanium Clean",
    tagline: "Daylight Mission Control (Light)",
    colors: {
      bg: "#f1f5f9",
      surface: "#ffffff",
      accent: "#2563eb",
      status: "#15803d",
    },
    isLight: true,
  },
];

const STORAGE_KEY = "attacktrace_theme";

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "obsidian";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    /* fallback to default */
  }
  return "obsidian";
}

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore storage errors */
  }
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useTheme = create<ThemeState>((set) => {
  const initial = getInitialTheme();
  // Ensure attribute is set immediately on store initialization
  if (typeof document !== "undefined") {
    applyTheme(initial);
  }
  return {
    theme: initial,
    setTheme: (id: ThemeId) => {
      applyTheme(id);
      set({ theme: id });
    },
  };
});

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "system";

type AccentColor = "pink" | "violet" | "blue" | "green" | "orange" | "red" | "teal" | "amber" | "custom";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  isLoading: boolean;
}

const accentColors: Record<Exclude<AccentColor, "custom">, { light: string; dark: string }> = {
  pink: { light: "340 82% 52%", dark: "340 85% 62%" },
  violet: { light: "262 83% 58%", dark: "262 83% 68%" },
  blue: { light: "217 91% 60%", dark: "217 91% 65%" },
  green: { light: "142 71% 45%", dark: "142 71% 55%" },
  orange: { light: "25 95% 53%", dark: "25 95% 58%" },
  red: { light: "0 84% 60%", dark: "0 84% 65%" },
  teal: { light: "174 72% 40%", dark: "174 72% 50%" },
  amber: { light: "38 92% 50%", dark: "38 92% 55%" },
};

// Convert hex to HSL
const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "340 85% 62%";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  } else {
    s = 0;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("aira-theme") as Theme;
    return stored || "dark";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem("aira-accent") as AccentColor;
    return stored || "pink";
  });

  const [customColor, setCustomColorState] = useState(() => {
    return localStorage.getItem("aira-custom-color") || "#ec4899";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load settings from database on auth change
  useEffect(() => {
    const loadSettings = async (uid: string) => {
      const { data } = await supabase
        .from("user_settings")
        .select("theme, accent_color")
        .eq("user_id", uid)
        .single();
      
      if (data) {
        if (data.theme && ["light", "dark", "system"].includes(data.theme)) {
          setThemeState(data.theme as Theme);
          localStorage.setItem("aira-theme", data.theme);
        }
        if (data.accent_color) {
          if (data.accent_color.startsWith("#")) {
            setAccentColorState("custom");
            setCustomColorState(data.accent_color);
            localStorage.setItem("aira-accent", "custom");
            localStorage.setItem("aira-custom-color", data.accent_color);
          } else {
            setAccentColorState(data.accent_color as AccentColor);
            localStorage.setItem("aira-accent", data.accent_color);
          }
        }
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadSettings(session.user.id);
      } else {
        setUserId(null);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadSettings(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to database when settings change
  const saveToDatabase = useCallback(async (newTheme?: Theme, newAccentColor?: string) => {
    if (!userId) return;
    
    const updates: { theme?: string; accent_color?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    
    if (newTheme) updates.theme = newTheme;
    if (newAccentColor) updates.accent_color = newAccentColor;
    
    await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", userId);
  }, [userId]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("aira-theme", newTheme);
    saveToDatabase(newTheme, undefined);
  }, [saveToDatabase]);

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem("aira-accent", color);
    if (color !== "custom") {
      saveToDatabase(undefined, color);
    }
  }, [saveToDatabase]);

  const setCustomColor = useCallback((color: string) => {
    setCustomColorState(color);
    localStorage.setItem("aira-custom-color", color);
    saveToDatabase(undefined, color);
  }, [saveToDatabase]);

  // Apply accent color
  useEffect(() => {
    const root = window.document.documentElement;
    let colorValue: string;
    
    if (accentColor === "custom") {
      colorValue = hexToHsl(customColor);
    } else {
      const colors = accentColors[accentColor];
      colorValue = resolvedTheme === "dark" ? colors.dark : colors.light;
    }
    
    root.style.setProperty("--primary", colorValue);
    root.style.setProperty("--ring", colorValue);
    root.style.setProperty("--sidebar-primary", colorValue);
    root.style.setProperty("--sidebar-ring", colorValue);
    root.style.setProperty("--gradient-start", colorValue);
    
    // Adjust secondary and accent based on primary
    const hue = colorValue.split(" ")[0];
    root.style.setProperty("--secondary", `${hue} 25% ${resolvedTheme === "dark" ? "18%" : "94%"}`);
    root.style.setProperty("--accent", `${hue} 35% ${resolvedTheme === "dark" ? "20%" : "92%"}`);
    root.style.setProperty("--chat-user", `${hue} 20% ${resolvedTheme === "dark" ? "12%" : "95%"}`);
  }, [accentColor, customColor, resolvedTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add transition class for smooth theme switching
    root.classList.add("theme-transition");
    
    const getResolvedTheme = (): "light" | "dark" => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return theme;
    };

    const resolved = getResolvedTheme();
    setResolvedTheme(resolved);

    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    
    localStorage.setItem("aira-theme", theme);

    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        root.classList.add("theme-transition");
        const newResolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        root.classList.remove("light", "dark");
        root.classList.add(newResolved);
        setTimeout(() => root.classList.remove("theme-transition"), 300);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      clearTimeout(timeout);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme, 
      accentColor, 
      setAccentColor, 
      customColor, 
      setCustomColor,
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { accentColors, hexToHsl };
export type { AccentColor };
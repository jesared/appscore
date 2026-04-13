"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

function getNextTheme(currentTheme: ThemeMode) {
  return currentTheme === "dark" ? "light" : "dark";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.localStorage.setItem("appscore-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("appscore-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: ThemeMode =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : systemPrefersDark
          ? "dark"
          : "light";

    applyTheme(initialTheme);
    setTheme(initialTheme);
    setIsReady(true);
  }, []);

  function handleToggle() {
    const nextTheme = getNextTheme(theme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={!isReady}
      aria-label="Basculer le theme"
    >
      {theme === "dark" ? "Mode clair" : "Mode sombre"}
    </Button>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AppScore",
  description: "Fondation Next.js pour une application de fiches de score multi-jeux.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className="theme" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const savedTheme = window.localStorage.getItem("appscore-theme");
                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const theme = savedTheme === "dark" || savedTheme === "light"
                  ? savedTheme
                  : (systemPrefersDark ? "dark" : "light");

                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

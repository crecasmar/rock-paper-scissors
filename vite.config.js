import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  base: "/rock-paper-scissors/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Rock, Paper, Scissors",
        short_name: "RockPaperScissors",
        description: "Rock paper scissors project",
        theme_color: "#ffffff",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/setupTests.js",
        "src/utils/test-utils.jsx",
        "src/main.jsx",
      ],
    },
    setupFiles: "./src/setupTests.js",
  },
  resolve: {
    alias: {
      "@": srcDir,
      src: srcDir,
      "@utils": path.resolve(srcDir, "utils"),
      "@assets": path.resolve(srcDir, "assets"),
      "@components": path.resolve(srcDir, "components"),
      "@pages": path.resolve(srcDir, "pages"),
      "@store": path.resolve(srcDir, "store"),
    },
  },
});

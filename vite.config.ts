import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure single instances of React and three. drei ships nested copies of
    // both; without deduping, drei's hooks hit a null dispatcher ("Invalid hook
    // call") and its three.Color/Vector3 fail the renderer's instanceof check
    // ("uniform3fv ... cannot be converted to a sequence").
    dedupe: ["react", "react-dom", "@react-three/fiber", "three"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@react-three/fiber",
      "three",
    ],
  },
});

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['firebase-admin']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
})

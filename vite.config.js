import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteElectron } from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    viteElectron({
      entry: 'src/main.js',
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Importar o plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Configuração do PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Guardião Florestal - Cerca Digital',
        short_name: 'Guardião',
        description: 'Monitoramento IoT e Rastreabilidade NFC para Preservação Florestal',
        theme_color: '#059669', // Cor verde do seu sistema
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Garante que áudios, ícones e código funcionem offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Mantendo seus assets personalizados
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
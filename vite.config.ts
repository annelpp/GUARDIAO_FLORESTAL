import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Configuração do Progressive Web App (PWA)
    VitePWA({
      registerType: 'autoUpdate',
      // Inclui ícones e sons no cache inicial
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Guardião Florestal - Cerca Digital',
        short_name: 'Guardião',
        description: 'Monitoramento IoT e Rastreabilidade NFC para Preservação Florestal',
        theme_color: '#059669', // Verde Esmeralda do Guardião
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
        // Padrões de ficheiros que devem ser guardados para uso offline
        // Incluímos explicitamente .mp3 para garantir o feedback sonoro na mata
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ],
  build: {
    // Aumentamos o limite para evitar avisos de chunk, já que o app está a crescer
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      // Atalho @ para a pasta src
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Suporte a importação de ficheiros de dados e vetores
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
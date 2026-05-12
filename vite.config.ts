import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PlastiNet',
        short_name: 'PlastiNet',
        description: 'AI-driven waste detection and verification workflow',
        theme_color: '#020402',
        background_color: '#020402',
        display: 'standalone',
        icons: [
          {
            src: '/plasticoin.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/plasticoin.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/plasticoin.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

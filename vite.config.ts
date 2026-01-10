import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          strategies: 'injectManifest', 
          srcDir: '.',              
          filename: 'sw.ts',          
          registerType: 'autoUpdate', 
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          devOptions: {
            enabled: true,
          },
          manifest: {
            name: 'BlurChat',
            short_name: 'BlurChat',
            description: 'Connect with mystery. Anonymous chat and journaling.',
            theme_color: '#0a0a0a', 
            background_color: '#000000',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
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
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
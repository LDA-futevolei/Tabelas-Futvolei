/* eslint-env node */
/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Permitir configurar o alvo do proxy via variável de ambiente
  // Ex.: VITE_API_PROXY_TARGET=https://ligadosamigosftv.com.br
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      allowedHosts: ['ligadosamigosftv.com.br', 'www.ligadosamigosftv.com.br'],
      proxy: {
        '/api': {
          target: proxyTarget, // sem barra final
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

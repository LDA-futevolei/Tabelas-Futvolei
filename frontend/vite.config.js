import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		host: true,
		strictPort: true,
		allowedHosts: ['ligadosamigosftv.com.br', 'www.ligadosamigosftv.com.br'],
		proxy: {
			'/api': {
				target: 'http://localhost:3000', // 🔥 sem barra final
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
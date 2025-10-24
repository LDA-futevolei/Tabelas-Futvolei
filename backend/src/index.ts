import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { routes } from '@/routes/routes';

async function main() {
	dotenv.config();
	const app = express();

	const PORT = process.env.PORT ?? 3000;
	const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 5173;
	// Permite configurar origens CORS em produção via env CORS_ORIGINS (separadas por vírgula) ou FRONTEND_ORIGIN
	const CORS_ORIGINS = (process.env.CORS_ORIGENS || process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	app.use(express.json());

	app.use(
		cors({
			origin: (origin, callback) => {
				// Permitir ferramentas locais sem origin (ex.: curl) e, se configurado, validar a origin
				if (!origin) return callback(null, true);
				if (CORS_ORIGINS.length === 0) {
					// modo dev: permite localhost:FRONTEND_PORT
					const devOrigin = `http://localhost:${FRONTEND_PORT}`;
					return callback(null, origin === devOrigin);
				}
				const ok = CORS_ORIGINS.some((o) => o === origin);
				return callback(null, ok);
			},
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			credentials: true,
		})
	);

	// API
	app.use('/api', routes);

	app.listen(PORT, (error) => {
		if (error != null) {
			console.error(error.message);
		} else {
			console.log(`Server online na porta: ${PORT}`);
			console.log(`Link de acesso: http://localhost:${PORT}/`);
		}
	});
}

main();

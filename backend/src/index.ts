import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { routes } from '@/routes/routes';

async function main() {
	dotenv.config();
	const app = express();

	const PORT = process.env.PORT ?? 3000;
	const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 5173;

	app.use(express.json());

	app.use(
		cors({
			origin: `http://localhost:${FRONTEND_PORT}`,
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

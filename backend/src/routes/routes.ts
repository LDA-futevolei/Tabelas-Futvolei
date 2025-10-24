import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';

import swaggerOptions from '@/swagger.json';

import { UserRouter } from '@/routes/usuario';
import IsAdmin from '@/middlewares/IsAdmin';
import { ParticipanteRouter } from './participante';
import { LayoutRouter } from './layout';
import { CampeonatoRouter } from './campeonato';
import { DuplaRouter } from './dupla';
import { JogoRouter } from './jogo';

export const routes = express.Router();

// Defina um segredo válido para a sessão. Evita o warning "req.secret; provide secret option"
const SECRET = (process.env.SESSION_SECRET?.trim() || process.env.SECRET?.trim() || 'dev-session-secret');

// Detecta se está em produção (HTTPS)
const isProduction = process.env.NODE_ENV === 'production';

// SESSÃO
routes.use(
	session({
		secret: SECRET,
		name: 'session.liga',
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 2, // 2 horas
			secure: isProduction, // true em produção (HTTPS), false em desenvolvimento
			httpOnly: true,
			sameSite: isProduction ? 'none' : 'lax', // 'none' necessário para CORS em produção
		},
	})
);

// SWAGGER
routes.use('/docs', IsAdmin, swaggerUi.serve, swaggerUi.setup(swaggerOptions));

routes.use('/user', UserRouter);
routes.use('/participante', ParticipanteRouter);
routes.use('/dupla', DuplaRouter);
routes.use('/campeonato', CampeonatoRouter);
routes.use('/jogo', JogoRouter);
// routes.use('/dupla');
routes.use('/campeonato', CampeonatoRouter);
// routes.use('/jogo');
routes.use('/layout', LayoutRouter);
import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';

import swaggerOptions from '@/swagger.json';

import { UserRouter } from '@/routes/usuario';
import IsAdmin from '@/middlewares/IsAdmin';
import { ParticipanteRouter } from './participante';

export const routes = express.Router();

const SECRET = process.env.SECRET as string;

// SESSÃO
routes.use(
	session({
		secret: SECRET,
		name: 'session.liga',
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 2,
			secure: false,
			httpOnly: true,
			sameSite: 'lax',
		},
	})
);

// SWAGGER
routes.use('/docs', IsAdmin, swaggerUi.serve, swaggerUi.setup(swaggerOptions));

routes.use('/user', UserRouter);
routes.use('/participante', ParticipanteRouter);
routes.use('/dupla');
routes.use('/campeonato');
routes.use('/jogo');
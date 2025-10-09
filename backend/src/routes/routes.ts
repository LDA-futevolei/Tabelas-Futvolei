import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';

import swaggerOptions from '@/swagger.json';

import { UserRouter } from '@/routes/user';
import IsAdmin from '@/middlewares/IsAdmin'

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
routes.use('/api-docs', IsAdmin, swaggerUi.serve, swaggerUi.setup(swaggerOptions));

routes.use('/user', UserRouter);

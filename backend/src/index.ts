import session from 'express-session'
import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'

import { UserRouter } from '@/routes/user'

async function main() {
    dotenv.config();
    const app = express();
    
    const PORT = process.env.PORT ?? 3000;
    const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 5000;

    const SECRET = process.env.SECRET as string;

    // JSON
    app.use(express.json());

    // CORS
    app.use(cors({
	    origin: `http://localhost:${FRONTEND_PORT}/`,
	    credentials: true,
    }));

    // SESSÃO
    app.use(session({
        secret: SECRET,
        name: "liga-dos-amigos",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
		    secure: false,
		    httpOnly: true,
            sameSite: 'lax',
	    },
    }));

    // ROTAS

    // ---- ROTAS DO USUÁRIO ----
    app.use('/user', UserRouter);

    app.listen(PORT, (error) => {
        if (error != null) {
            console.error(error.message);
        } else {
            console.log("Server online na porta: " + PORT.toString());
        }
    });
}

main();
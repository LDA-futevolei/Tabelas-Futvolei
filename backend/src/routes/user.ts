import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { UserCadDTO, UserLoginDTO } from '@/types/user';
import UserModel from '@/models/user';

export const UserRouter = Router();

UserRouter.post('/login', async (req, res) => {
	const body: UserLoginDTO = req.body ?? { };
	const errors = [];
	
	if (!body.email) {
		errors.push('É necessário prover um email para continuar!');
	}
	
	if (!body.senha) {
		errors.push('É necessário prover uma senha para continuar!');
	}
	
	// Checagem de erros de corpo
	if (errors.length > 0) {
		return res.status(400).json({
			errors,
		});
	}
	
	try {
		const client = new PrismaClient();
		
		// Verifica se existe um usuario com esse email
		let user = await client.users.findUnique({
			where: {
				email: body.email,
			},
		});

		// Verifica se o usuário existe e se a senha é válida
		if (!user || !UserModel.IsPasswordMatch(body.senha, user.senha)) {
			return res.status(404).json({
				errors: ['Email ou senha inválidos!'],
			});
		}

		// Inicia a sessão
		req.session.user = {
			idUsuario: user.idUsuario,
			nome: user.nome,
			email: user.email,
			isAdmin: user.isAdmin,
		};

		res.sendStatus(200);
	} catch (err) {
		res.status(500).json({
			erros: [
				'Não foi possível efetuar o login devido a um erro no servidor. Tente novamente mais tarde!',
			],
		});
	}
});

UserRouter.post('/register', async (req, res) => {
	const body: UserCadDTO = req.body ?? { };
	const errors = [];
	
	if (!body.email) {
		errors.push('É necessário prover um email!');
	}
	
	if (!body.senha) {
		errors.push('É necessário prover uma senha!');
	}

	if (!body.nome) {
		errors.push('É necessário prover um nome!');
	}

	if (body.isAdmin == undefined) {
		body.isAdmin = false;
	}
	
	// Checagem de erros de corpo
	if (errors.length > 0) {
		return res.status(400).json({
			errors,
		});
	}
	
	try {
		const client = new PrismaClient();
		
		// Verifica se existe um usuario com esse email
		let user = await client.users.findUnique({
			where: {
				email: body.email,
			},
		});

		// Verifica se o usuário existe e se a senha é válida
		if (user != null) {
			return res.status(404).json({
				errors: ['Esse email já foi usado por outro usuário!'],
			});
		}

		// Criptografa a senha 
		const hash = UserModel.HashPassword(body.senha);

		// Cadastra o usuário
		await client.users.create({
			data: {
				nome: body.nome,
				email: body.email,
				senha: hash,
				isAdmin: body.isAdmin
			}
		});

		res.sendStatus(200);
	} catch (err) {
		res.status(500).json({
			erros: [
				'Não foi possível efetuar o cadastro devido a um erro no servidor. Tente novamente mais tarde!',
			],
		});
	}
});

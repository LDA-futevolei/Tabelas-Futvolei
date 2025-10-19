import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { IParticipanteCadDTO } from '@/types/participante';

export const ParticipanteRouter = Router();

ParticipanteRouter.post('/cadastrar', async (req, res) => {
    const body: IParticipanteCadDTO = req.body;
    const erros: string[] = [];
    const telRegex = /^\(?\d{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/;

    const client = new PrismaClient();

    if (!body.nome) {
        erros.push("Nome do participante faltando!");
    }

    if (!body.telefone || !telRegex.test(body.telefone)) {
        erros.push("Telefone do participante faltando ou inválido!");
    }

    // Verifica a existencia de numero de telefone igual
    const checkTel = await client.participante.count({
        where: {
            telefone: body.telefone
        }
    });

    if (checkTel > 0) {
        erros.push("O numero de telefone digitado ja foi utilizado por outro participante!");
    }

    if (erros.length > 0) {
        return res.status(400).json({
            erros
        });
    }

    try {
        await client.participante.create({
            data: {
                nome: body.nome,
                telefone: body.telefone
            }
        });

        res.sendStatus(200);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            erros: [
                "Não foi possível efetuar o seu cadastro devido a um erro interno no servidor. Tente novamente mais tarde!"
            ]
        });
    }
});
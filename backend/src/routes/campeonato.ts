import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import IsAuth from '@/middlewares/IsAuth';

export const CampeonatoRouter = Router();

CampeonatoRouter.get('/atual', async (req, res) => {
    const client = new PrismaClient();
    const now = new Date();
    
    try {
        const campeonato = await client.campeonato.findFirst({
            where: {
                inicio: { lte: now },
                fim: { gte: now }
            }
        });

        res.status(200).json({
            data: campeonato,
            erros: null
        });
    } catch (err) {
        res.status(500).json({
            data: null,
            erros: [
                "Não foi possível buscar os dados devido a um erro interno no servidor. Tente novamente mais tarde!"
            ]
        })
    }
});

// Listar campeonatos (por enquanto todos; futuramente filtrar por usuário)
CampeonatoRouter.get('/list', IsAuth, async (req, res) => {
	const client = new PrismaClient();
	try {
		const list = await client.campeonato.findMany({
			orderBy: { inicio: 'desc' },
			select: {
				idCampeonato: true,
				inicio: true,
				fim: true,
				inicioInscricoes: true,
				fimInscricoes: true,
			},
		});

		res.status(200).json({ data: list, erros: null });
	} catch (err) {
		res
			.status(500)
			.json({ data: null, erros: ['Falha ao listar campeonatos'] });
	}
});

// Criar campeonato (datas básicas). Nome/título pode ser salvo via Layout stage 'meta'
CampeonatoRouter.post('/create', IsAuth, async (req, res) => {
	const client = new PrismaClient();
	try {
		const { inicio, fim, inicioInscricoes, fimInscricoes } = req.body ?? {};
		const now = new Date();
		const inicioDt = inicio ? new Date(inicio) : now;
		const fimDt = fim
			? new Date(fim)
			: new Date(now.getTime() + 24 * 60 * 60 * 1000);
		const iniIns = inicioInscricoes ? new Date(inicioInscricoes) : now;
		const fimIns = fimInscricoes
			? new Date(fimInscricoes)
			: new Date(fimDt.getTime() - 24 * 60 * 60 * 1000);
		const created = await client.campeonato.create({
			data: {
				inicio: inicioDt,
				fim: fimDt,
				inicioInscricoes: iniIns,
				fimInscricoes: fimIns,
			},
			select: { idCampeonato: true },
		});

		res.status(200).json({ data: created, erros: null });
	} catch (err) {
		res.status(500).json({ data: null, erros: ['Falha ao criar campeonato'] });
	}
});

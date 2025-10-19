import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { IUserCadDTO, IUserLoginDTO } from '@/types/user';
import IsAuth from '@/middlewares/IsAuth';
import UserModel from '@/models/user';

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

CampeonatoRouter.post('/cadatrar', (req, res) => {
    
});

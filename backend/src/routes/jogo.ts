import { Router } from 'express'

export const JogoRouter = Router()

// Stub inicial – ajuste as rotas conforme necessidade
JogoRouter.get('/health', (_req, res) => {
	res.status(200).json({ ok: true })
})

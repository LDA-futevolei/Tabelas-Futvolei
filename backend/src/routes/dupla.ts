import { Router } from 'express'

export const DuplaRouter = Router()

// Stub inicial – ajuste as rotas conforme necessidade
DuplaRouter.get('/health', (_req, res) => {
	res.status(200).json({ ok: true })
})

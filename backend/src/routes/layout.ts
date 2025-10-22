import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

export const LayoutRouter = Router()

// GET /api/layout/finais?campeonatoId=123
LayoutRouter.get('/finais', async (req, res) => {
  const prisma = new PrismaClient()
  const campeonatoIdParam = req.query.campeonatoId
  const campeonatoId = campeonatoIdParam != null ? Number(campeonatoIdParam) : null
  if (campeonatoIdParam != null && (Number.isNaN(campeonatoId) || campeonatoId! < 0)) {
    return res.status(400).json({ data: null, erros: ['Parametro campeonatoId inválido'] })
  }
  try {
    const row = await prisma.layout.findUnique({
      where: { stage_idCampeonato: { stage: 'finais', idCampeonato: campeonatoId ?? null } },
    })
    return res.status(200).json({ data: row?.data ?? null, erros: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ data: null, erros: ['Erro ao buscar layout'] })
  }
})

// PUT /api/layout/finais  body: { campeonatoId?: number, data: any }
LayoutRouter.put('/finais', async (req, res) => {
  const prisma = new PrismaClient()
  const { campeonatoId, data } = req.body ?? {}
  const cid = campeonatoId == null ? null : Number(campeonatoId)
  if (campeonatoId != null && (Number.isNaN(cid) || cid < 0)) {
    return res.status(400).json({ data: null, erros: ['Parametro campeonatoId inválido'] })
  }
  if (typeof data === 'undefined') {
    return res.status(400).json({ data: null, erros: ['Body.data é obrigatório'] })
  }
  try {
    const saved = await prisma.layout.upsert({
      where: { stage_idCampeonato: { stage: 'finais', idCampeonato: cid } },
      create: { stage: 'finais', idCampeonato: cid, data },
      update: { data },
      select: { idLayout: true }
    })
    return res.status(200).json({ data: { idLayout: saved.idLayout }, erros: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ data: null, erros: ['Erro ao salvar layout'] })
  }
})

// GET /api/layout/meta?campeonatoId=123  -> metadados (ex.: título do campeonato)
LayoutRouter.get('/meta', async (req, res) => {
  const prisma = new PrismaClient()
  const campeonatoIdParam = req.query.campeonatoId
  const campeonatoId = campeonatoIdParam != null ? Number(campeonatoIdParam) : null
  if (campeonatoIdParam != null && (Number.isNaN(campeonatoId) || campeonatoId! < 0)) {
    return res.status(400).json({ data: null, erros: ['Parametro campeonatoId inválido'] })
  }
  try {
    const row = await prisma.layout.findUnique({
      where: { stage_idCampeonato: { stage: 'meta', idCampeonato: campeonatoId ?? null } },
    })
    return res.status(200).json({ data: row?.data ?? null, erros: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ data: null, erros: ['Erro ao buscar meta'] })
  }
})

// PUT /api/layout/meta { campeonatoId, data }
LayoutRouter.put('/meta', async (req, res) => {
  const prisma = new PrismaClient()
  const { campeonatoId, data } = req.body ?? {}
  const cid = campeonatoId == null ? null : Number(campeonatoId)
  if (campeonatoId != null && (Number.isNaN(cid) || cid < 0)) {
    return res.status(400).json({ data: null, erros: ['Parametro campeonatoId inválido'] })
  }
  if (typeof data === 'undefined') {
    return res.status(400).json({ data: null, erros: ['Body.data é obrigatório'] })
  }
  try {
    const saved = await prisma.layout.upsert({
      where: { stage_idCampeonato: { stage: 'meta', idCampeonato: cid } },
      create: { stage: 'meta', idCampeonato: cid, data },
      update: { data },
      select: { idLayout: true }
    })
    return res.status(200).json({ data: { idLayout: saved.idLayout }, erros: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ data: null, erros: ['Erro ao salvar meta'] })
  }
})

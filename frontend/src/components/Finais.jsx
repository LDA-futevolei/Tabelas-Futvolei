import React, { useMemo, useRef, useState } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import ModalPlacar from './ModalPlacar'
import SingleSlotCard from './SingleSlotCard'
import FinalsMatchCard from './FinalsMatchCard'
import FinalCrest from './FinalCrest'
import layoutFinais from '../logic/layout/layoutFinais.json'
// import { getAtualCampeonato, getFinaisLayout, putFinaisLayout } from '../logic/api'

export default function Finais() {
  const jogos = useBracketStore(s => s.jogos || [])
  const participants = useBracketStore(s => s.participants || [])
  const duplas = useBracketStore(s => s.duplas || [])
  const setPlacar = useBracketStore(s => s.setPlacar)

  const semiL = useMemo(() => (jogos.find(j => j.fase === 'finais' && j.tipo === 'semi' && j.region === 'L') || null), [jogos])
  const semiR = useMemo(() => (jogos.find(j => j.fase === 'finais' && j.tipo === 'semi' && j.region === 'R') || null), [jogos])
  const finalJ = useMemo(() => (jogos.find(j => j.fase === 'finais' && j.tipo === 'final') || null), [jogos])
  const third = useMemo(() => (jogos.find(j => j.fase === 'finais' && (j.tipo === 'third-place' || j.tipo === 'third')) || null), [jogos])

  const [modalJogo, setModalJogo] = useState(null)

  const onSave = (id, payload) => {
    setPlacar(id, payload)
  }

  const srcDuplas = (participants && participants.length > 0) ? participants : duplas

  // Layout base simplificado para visualização
  const SCALE = 2
  let CANVAS_W = 900
  let CANVAS_H = 480
  let SVG_W = CANVAS_W * SCALE
  let SVG_H = CANVAS_H * SCALE

  // Estado de layout editável (inicia com JSON importado)
  const [layoutMap] = useState(() => ({ ...(layoutFinais || {}) }))
  const svgRef = useRef(null)

  // Modo display apenas - desabilitar edição
  const isEditMode = false
  const isPathEditMode = false
  const selectedLinkKey = ''
  const snapToGrid = false
  const showGrid = false
  const GRID_STEP = 40
  const getSvgCoords = () => ({ x: 0, y: 0 })
  const setLayoutMap = () => {} // no-op
  const setDragging = () => {} // no-op
  const onMouseDownSlot = () => () => {} // no-op
  const CARD_W = 262 // largura efetiva do FinalsMatchCard (LEFT_PORT 22 + WIDTH 240)
  // Centro vertical do badge "VS" no FinalsMatchCard: HEIGHT(26) + GAP(6)/2 = 29
  const VS_CENTER_Y = 29
  const PADDING_X = 40 // reduzido de 60
  let PADDING_Y = 40 // reduzido de 60
  const GAP_Y = 140 // reduzido de 160 - distância vertical entre final e terceiro lugar
  // Posição do brasão: 'top' (acima do card) ou 'center' (sobre o VS)
  const CREST_POS = 'top'
  // Medidas do brasão (reduzidas para caber melhor)
  const CREST_W = 180 // reduzido de 220
  const CREST_H = Math.round(CREST_W * 1.2)

  // posições
  // dimensões dos slots (precisam estar antes de cálculos que os usam)
  const SLOT_H = 24 // altura do SingleSlotCard (não usado para centro do VS)
  const SLOT_GAP = 24 // gap entre os dois slots empilhados (não usado para centro do VS)
  const SEMI_STACK_H = SLOT_H * 2 + SLOT_GAP

  const midX = Math.floor((CANVAS_W - CARD_W) / 2)
  // Se o brasão estiver no topo, precisamos abrir espaço suficiente acima da Final para não cortar
  const crestTopOffset = CREST_POS === 'top' ? (CREST_H + 16) : 0
  if (crestTopOffset > 0) {
    PADDING_Y = Math.max(PADDING_Y, crestTopOffset)
  }
  // fallback padrão com margem para o brasão
  const fallbackFinalPos = { x: midX, y: PADDING_Y + 20 }
  const FINAL_STACK_H = SLOT_H * 2 + SLOT_GAP
  const fallbackThirdPos = { x: midX, y: fallbackFinalPos.y + GAP_Y }
  const THIRD_STACK_H = SLOT_H * 2 + SLOT_GAP
  const blockTop = fallbackFinalPos.y
  const blockBottom = fallbackThirdPos.y + THIRD_STACK_H
  const blockCenter = (blockTop + blockBottom) / 2
  const semiY = Math.round(blockCenter - (SEMI_STACK_H / 2))
  const fallbackSemiLeft = { x: PADDING_X, y: semiY }
  const fallbackSemiRight = { x: CANVAS_W - PADDING_X - CARD_W, y: semiY }

  // utilitário para validar stackPos (x/y numéricos)
  const isValidPos = (p) => p && typeof p.x === 'number' && Number.isFinite(p.x) && typeof p.y === 'number' && Number.isFinite(p.y)
  const isFiniteNum = (n) => typeof n === 'number' && Number.isFinite(n)
  const pickStackPos = (id, fallback) => {
    const node = layoutMap?.[id]
    return isValidPos(node) ? node : fallback
  }
  // posições vindas do layout editável (se existir), com fallback seguro
  const posSemiL = semiL ? pickStackPos(semiL.id, fallbackSemiLeft) : null
  const posSemiR = semiR ? pickStackPos(semiR.id, fallbackSemiRight) : null
  const posFinal = finalJ ? pickStackPos(finalJ.id, fallbackFinalPos) : null
  const posThird = third ? pickStackPos(third.id, fallbackThirdPos) : null

  // posição efetiva de cada slot (permite mover slot individual, com fallback para stack)
  const getSlotPos = (id, stackPos, slotIndex) => {
    const s = layoutMap?.[id]?.slots?.[slotIndex]
    if (s && typeof s.x === 'number' && Number.isFinite(s.x) && typeof s.y === 'number' && Number.isFinite(s.y)) return s
    if (!isValidPos(stackPos)) return null
    return {
      x: stackPos.x,
      y: stackPos.y + (slotIndex === 0 ? 0 : (SLOT_H + SLOT_GAP)),
    }
  }

  // calcular canvas dinamicamente baseado nas posições
  // Ports alinhados ao FinalsMatchCard (ver FinalsMatchCard.jsx: LEFT=22, WIDTH=240)
  const SLOT_LEFT = 22
  const SLOT_RIGHT = 262
  // const stackHeight = (SLOT_H * 2 + SLOT_GAP)
  const extents = []
  // considerar extents por slot (caso tenham sido movidos)
  const pushSlotExtents = (id, stackPos) => {
    const s0 = getSlotPos(id, stackPos, 0)
    const s1 = getSlotPos(id, stackPos, 1)
    if (s0 && Number.isFinite(s0.x) && Number.isFinite(s0.y)) {
      extents.push({ x: s0.x + SLOT_RIGHT, y: s0.y + SLOT_H })
    }
    if (s1 && Number.isFinite(s1.x) && Number.isFinite(s1.y)) {
      extents.push({ x: s1.x + SLOT_RIGHT, y: s1.y + SLOT_H })
    }
  }
  if (semiL && posSemiL) pushSlotExtents(semiL.id, posSemiL)
  if (semiR && posSemiR) pushSlotExtents(semiR.id, posSemiR)
  if (finalJ && posFinal) pushSlotExtents(finalJ.id, posFinal)
  if (third && posThird) pushSlotExtents(third.id, posThird)
  if (extents.length > 0) {
    const xs = extents.map(e => e.x).filter(Number.isFinite)
    const ys = extents.map(e => e.y).filter(Number.isFinite)
    if (xs.length && ys.length) {
      const maxX = Math.max(...xs)
      const maxY = Math.max(...ys)
      CANVAS_W = Math.max(CANVAS_W, maxX + 80)
      CANVAS_H = Math.max(CANVAS_H, maxY + 80)
    }
    SVG_W = CANVAS_W * SCALE
    SVG_H = CANVAS_H * SCALE
  }

  // Garantir métricas seguras para SVG e grade
  const DEFAULT_W = 1000
  const DEFAULT_H = 520
  const safeCW = isFiniteNum(CANVAS_W) && CANVAS_W > 0 ? CANVAS_W : DEFAULT_W
  const safeCH = isFiniteNum(CANVAS_H) && CANVAS_H > 0 ? CANVAS_H : DEFAULT_H
  const safeS = isFiniteNum(SCALE) && SCALE > 0 ? SCALE : 1
  const safeSW = safeCW * safeS
  const safeSH = safeCH * safeS

  // pontos médios para conectar
  // Conectores direcionais (lado direito/esquerdo) seguindo as posições livremente editáveis
  const RIGHT_PORT = SLOT_RIGHT
  const LEFT_PORT = SLOT_LEFT

  // Utilitário para pegar config de link a partir do layout (por jogo de origem)
  const getLinkConfig = (fromId, key, defaults) => {
    const fromNode = layoutMap?.[fromId]
    const link = fromNode?.links?.[key] || {}
    const style = link.style || {}
    return {
      elbow: link.elbow ?? defaults.elbow,
      offset: link.offset ?? defaults.offset,
      stroke: style.stroke ?? defaults.stroke,
      width: style.width ?? defaults.width,
      dash: style.dash ?? defaults.dash,
      trunkX: link.trunkX,
      trunkY: link.trunkY,
      from: link.from,
      to: link.to,
      points: Array.isArray(link.points) ? link.points : [],
    }
  }

  // Desenha linha reta ou em "cotovelo" baseado no config
  // makePath não é mais utilizado aqui (roteamento por tronco); mantido por compat no layout

  // tema visual preto/rosa/branco (conectores rosa)
  const GOLD = '#ff2b77'
  const makeElbowPath = (fx, fy, tx, ty) => {
    if (![fx, fy, tx, ty].every(isFiniteNum)) return null
    const mx = Math.round((fx + tx) / 2)
    return `M ${fx} ${fy} L ${mx} ${fy} L ${mx} ${ty} L ${tx} ${ty}`
  }
  const lines = []
  const pointHandles = []
  // Conectar semis aos slots da Final (winners) – modo livre: sem tronco padrão quando não há pontos
  if (finalJ && isValidPos(posFinal)) {
    // esquerda -> final (ancorar no meio do card (VS) na borda esquerda)
    if (semiL && isValidPos(posSemiL)) {
  const defToX = posFinal.x + LEFT_PORT
  const defToY = posFinal.y + VS_CENTER_Y
      const cfg = getLinkConfig(semiL.id, 'toFinal', { elbow: true, offset: 14, stroke: GOLD, width: 2, dash: undefined })
      const defFromX = posSemiL.x + RIGHT_PORT
      const defFromY = posSemiL.y + VS_CENTER_Y
      const eFromX = isFiniteNum(cfg?.from?.x) ? cfg.from.x : defFromX
      const eFromY = isFiniteNum(cfg?.from?.y) ? cfg.from.y : defFromY
      const eToX = isFiniteNum(cfg?.to?.x) ? cfg.to.x : defToX
      const eToY = isFiniteNum(cfg?.to?.y) ? cfg.to.y : defToY
      if (isFiniteNum(eFromX) && isFiniteNum(eFromY) && isFiniteNum(eToX) && isFiniteNum(eToY)) {
        if (cfg.points.length > 0) {
          const pts = cfg.points.filter(isValidPos)
          const d = `M ${eFromX} ${eFromY}` + pts.map(p => ` L ${p.x} ${p.y}`).join('') + ` L ${eToX} ${eToY}`
          lines.push(
            <path
              key="l-semiL-final"
              d={d}
              stroke={cfg.stroke}
              strokeWidth={cfg.width}
              fill="none"
              onClick={(e) => {
                if (!isEditMode || !isPathEditMode) return
                e.stopPropagation()
                const { x, y } = getSvgCoords(e)
                const px = snapToGrid ? Math.round(x / GRID_STEP) * GRID_STEP : Math.round(x)
                const py = snapToGrid ? Math.round(y / GRID_STEP) * GRID_STEP : Math.round(y)
                setLayoutMap(prev => {
                  const prevNode = prev?.[semiL.id] || {}
                  const prevLinks = prevNode.links || {}
                  const link = prevLinks['toFinal'] || {}
                  const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                  ptsPrev.push({ x: px, y: py })
                  return {
                    ...prev,
                    [semiL.id]: {
                      ...prevNode,
                      links: {
                        ...prevLinks,
                        toFinal: { ...link, points: ptsPrev },
                      },
                    },
                  }
                })
              }}
              style={{ cursor: isEditMode && isPathEditMode ? 'copy' : 'default' }}
            />
          )
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'L:final')) {
            // handle do ponto final (to)
            pointHandles.push(
              <circle
                key="h-to-semiL-final"
                cx={eToX}
                cy={eToY}
                r={6}
                fill="#fb923c"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'to', fromId: semiL.id, key: 'toFinal', offsetX: x - eToX, offsetY: y - eToY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto final"
              />
            )
          }
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'L:final')) {
            // handle do ponto inicial (from)
            pointHandles.push(
              <circle
                key="h-from-semiL-final"
                cx={eFromX}
                cy={eFromY}
                r={6}
                fill="#22d3ee"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'from', fromId: semiL.id, key: 'toFinal', offsetX: x - eFromX, offsetY: y - eFromY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto inicial"
              />
            )
          }
          if (isEditMode && isPathEditMode) {
            cfg.points.forEach((p, idx) => {
              if (!isValidPos(p)) return
              pointHandles.push(
                <circle
                  key={`pt-semiL-final-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="#06b6d4"
                  stroke="#111"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const { x, y } = getSvgCoords(e)
                    setDragging({ kind: 'point', fromId: semiL.id, key: 'toFinal', index: idx, offsetX: x - p.x, offsetY: y - p.y })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setLayoutMap(prev => {
                      const prevNode = prev?.[semiL.id] || {}
                      const prevLinks = prevNode.links || {}
                      const link = prevLinks['toFinal'] || {}
                      const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                      ptsPrev.splice(idx, 1)
                      return {
                        ...prev,
                        [semiL.id]: {
                          ...prevNode,
                          links: {
                            ...prevLinks,
                            toFinal: { ...link, points: ptsPrev },
                          },
                        },
                      }
                    })
                  }}
                  style={{ cursor: 'move' }}
                  title="Duplo clique para remover ponto"
                />
              )
            })
          }
        } else {
          // Fallback: desenhar um cotovelo padrão quando não houver pontos no JSON
          const d = makeElbowPath(eFromX, eFromY, eToX, eToY)
          if (d) {
            lines.push(
              <path
                key="l-semiL-final-def"
                d={d}
                stroke={cfg.stroke}
                strokeWidth={cfg.width}
                fill="none"
              />
            )
          }
        }
      }
    }
    // direita -> final: ancorar no meio do card (VS) na borda DIREITA da Final
    if (semiR && isValidPos(posSemiR)) {
  const defToX = posFinal.x + RIGHT_PORT
  const defToY = posFinal.y + VS_CENTER_Y
      const cfg = getLinkConfig(semiR.id, 'toFinal', { elbow: true, offset: 14, stroke: GOLD, width: 2, dash: undefined })
      const defFromX = posSemiR.x + LEFT_PORT
      const defFromY = posSemiR.y + VS_CENTER_Y
      const eFromX = isFiniteNum(cfg?.from?.x) ? cfg.from.x : defFromX
      const eFromY = isFiniteNum(cfg?.from?.y) ? cfg.from.y : defFromY
      const eToX = isFiniteNum(cfg?.to?.x) ? cfg.to.x : defToX
      const eToY = isFiniteNum(cfg?.to?.y) ? cfg.to.y : defToY
      if (isFiniteNum(eFromX) && isFiniteNum(eFromY) && isFiniteNum(eToX) && isFiniteNum(eToY)) {
        if (cfg.points.length > 0) {
          const pts = cfg.points.filter(isValidPos)
          const d = `M ${eFromX} ${eFromY}` + pts.map(p => ` L ${p.x} ${p.y}`).join('') + ` L ${eToX} ${eToY}`
          lines.push(
            <path
              key="l-semiR-final"
              d={d}
              stroke={cfg.stroke}
              strokeWidth={cfg.width}
              fill="none"
              onClick={(e) => {
                if (!isEditMode || !isPathEditMode) return
                e.stopPropagation()
                const { x, y } = getSvgCoords(e)
                const px = snapToGrid ? Math.round(x / GRID_STEP) * GRID_STEP : Math.round(x)
                const py = snapToGrid ? Math.round(y / GRID_STEP) * GRID_STEP : Math.round(y)
                setLayoutMap(prev => {
                  const prevNode = prev?.[semiR.id] || {}
                  const prevLinks = prevNode.links || {}
                  const link = prevLinks['toFinal'] || {}
                  const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                  ptsPrev.push({ x: px, y: py })
                  return {
                    ...prev,
                    [semiR.id]: {
                      ...prevNode,
                      links: {
                        ...prevLinks,
                        toFinal: { ...link, points: ptsPrev },
                      },
                    },
                  }
                })
              }}
              style={{ cursor: isEditMode && isPathEditMode ? 'copy' : 'default' }}
            />
          )
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'R:final')) {
            pointHandles.push(
              <circle
                key="h-to-semiR-final"
                cx={eToX}
                cy={eToY}
                r={6}
                fill="#fb923c"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'to', fromId: semiR.id, key: 'toFinal', offsetX: x - eToX, offsetY: y - eToY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto final"
              />
            )
          }
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'R:final')) {
            pointHandles.push(
              <circle
                key="h-from-semiR-final"
                cx={eFromX}
                cy={eFromY}
                r={6}
                fill="#22d3ee"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'from', fromId: semiR.id, key: 'toFinal', offsetX: x - eFromX, offsetY: y - eFromY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto inicial"
              />
            )
          }
          if (isEditMode && isPathEditMode) {
            cfg.points.forEach((p, idx) => {
              if (!isValidPos(p)) return
              pointHandles.push(
                <circle
                  key={`pt-semiR-final-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="#06b6d4"
                  stroke="#111"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const { x, y } = getSvgCoords(e)
                    setDragging({ kind: 'point', fromId: semiR.id, key: 'toFinal', index: idx, offsetX: x - p.x, offsetY: y - p.y })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setLayoutMap(prev => {
                      const prevNode = prev?.[semiR.id] || {}
                      const prevLinks = prevNode.links || {}
                      const link = prevLinks['toFinal'] || {}
                      const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                      ptsPrev.splice(idx, 1)
                      return {
                        ...prev,
                        [semiR.id]: {
                          ...prevNode,
                          links: {
                            ...prevLinks,
                            toFinal: { ...link, points: ptsPrev },
                          },
                        },
                      }
                    })
                  }}
                  style={{ cursor: 'move' }}
                  title="Duplo clique para remover ponto"
                />
              )
            })
          }
        } else {
          // Fallback: desenhar um cotovelo padrão quando não houver pontos no JSON
          const d = makeElbowPath(eFromX, eFromY, eToX, eToY)
          if (d) {
            lines.push(
              <path
                key="l-semiR-final-def"
                d={d}
                stroke={cfg.stroke}
                strokeWidth={cfg.width}
                fill="none"
              />
            )
          }
        }
      }
    }
  }
  // Conectar semis aos slots do 3º lugar (losers): topo recebe perdedor da esquerda, baixo recebe perdedor da direita (tracejado)
  // Conectar semis ao 3º lugar com tronco próximo ao card do 3º
  if (third && isValidPos(posThird)) {
    if (semiL && isValidPos(posSemiL)) {
      const defToX = posThird.x + LEFT_PORT
      const defToY = posThird.y + VS_CENTER_Y
      const cfg = getLinkConfig(semiL.id, 'toThird', { elbow: true, offset: 12, stroke: GOLD, width: 2, dash: '6 4' })
      const defFromX = posSemiL.x + RIGHT_PORT
      const defFromY = posSemiL.y + VS_CENTER_Y
      const eFromX = isFiniteNum(cfg?.from?.x) ? cfg.from.x : defFromX
      const eFromY = isFiniteNum(cfg?.from?.y) ? cfg.from.y : defFromY
      const eToX = isFiniteNum(cfg?.to?.x) ? cfg.to.x : defToX
      const eToY = isFiniteNum(cfg?.to?.y) ? cfg.to.y : defToY
      if (isFiniteNum(eFromX) && isFiniteNum(eFromY) && isFiniteNum(eToX) && isFiniteNum(eToY)) {
        if (cfg.points.length > 0) {
          const pts = cfg.points.filter(isValidPos)
          const d = `M ${eFromX} ${eFromY}` + pts.map(p => ` L ${p.x} ${p.y}`).join('') + ` L ${eToX} ${eToY}`
          lines.push(
            <path
              key="l-semiL-third"
              d={d}
              stroke={cfg.stroke}
              strokeWidth={cfg.width}
              fill="none"
              strokeDasharray={cfg.dash}
              onClick={(e) => {
                if (!isEditMode || !isPathEditMode) return
                e.stopPropagation()
                const { x, y } = getSvgCoords(e)
                const px = snapToGrid ? Math.round(x / GRID_STEP) * GRID_STEP : Math.round(x)
                const py = snapToGrid ? Math.round(y / GRID_STEP) * GRID_STEP : Math.round(y)
                setLayoutMap(prev => {
                  const prevNode = prev?.[semiL.id] || {}
                  const prevLinks = prevNode.links || {}
                  const link = prevLinks['toThird'] || {}
                  const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                  ptsPrev.push({ x: px, y: py })
                  return {
                    ...prev,
                    [semiL.id]: {
                      ...prevNode,
                      links: {
                        ...prevLinks,
                        toThird: { ...link, points: ptsPrev },
                      },
                    },
                  }
                })
              }}
              style={{ cursor: isEditMode && isPathEditMode ? 'copy' : 'default' }}
            />
          )
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'L:third')) {
            pointHandles.push(
              <circle
                key="h-to-semiL-third"
                cx={eToX}
                cy={eToY}
                r={6}
                fill="#fb923c"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'to', fromId: semiL.id, key: 'toThird', offsetX: x - eToX, offsetY: y - eToY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto final"
              />
            )
          }
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'L:third')) {
            pointHandles.push(
              <circle
                key="h-from-semiL-third"
                cx={eFromX}
                cy={eFromY}
                r={6}
                fill="#22d3ee"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'from', fromId: semiL.id, key: 'toThird', offsetX: x - eFromX, offsetY: y - eFromY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto inicial"
              />
            )
          }
          if (isEditMode && isPathEditMode) {
            cfg.points.forEach((p, idx) => {
              if (!isValidPos(p)) return
              pointHandles.push(
                <circle
                  key={`pt-semiL-third-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="#06b6d4"
                  stroke="#111"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const { x, y } = getSvgCoords(e)
                    setDragging({ kind: 'point', fromId: semiL.id, key: 'toThird', index: idx, offsetX: x - p.x, offsetY: y - p.y })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setLayoutMap(prev => {
                      const prevNode = prev?.[semiL.id] || {}
                      const prevLinks = prevNode.links || {}
                      const link = prevLinks['toThird'] || {}
                      const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                      ptsPrev.splice(idx, 1)
                      return {
                        ...prev,
                        [semiL.id]: {
                          ...prevNode,
                          links: {
                            ...prevLinks,
                            toThird: { ...link, points: ptsPrev },
                          },
                        },
                      }
                    })
                  }}
                  style={{ cursor: 'move' }}
                  title="Duplo clique para remover ponto"
                />
              )
            })
          }
        } else {
          // Fallback: desenhar um cotovelo padrão quando não houver pontos no JSON
          const d = makeElbowPath(eFromX, eFromY, eToX, eToY)
          if (d) {
            lines.push(
              <path
                key="l-semiL-third-def"
                d={d}
                stroke={cfg.stroke}
                strokeWidth={cfg.width}
                fill="none"
                strokeDasharray={cfg.dash}
              />
            )
          }
        }
      }
    }
    if (semiR && isValidPos(posSemiR)) {
      const defToX = posThird.x + LEFT_PORT
      const defToY = posThird.y + VS_CENTER_Y
      const cfg = getLinkConfig(semiR.id, 'toThird', { elbow: true, offset: 12, stroke: GOLD, width: 2, dash: '6 4' })
      // Ajuste: começar pelo lado direito do card da semi R (não invertido)
      const defFromX = posSemiR.x + RIGHT_PORT
      const defFromY = posSemiR.y + VS_CENTER_Y
      const eFromX = isFiniteNum(cfg?.from?.x) ? cfg.from.x : defFromX
      const eFromY = isFiniteNum(cfg?.from?.y) ? cfg.from.y : defFromY
      const eToX = isFiniteNum(cfg?.to?.x) ? cfg.to.x : defToX
      const eToY = isFiniteNum(cfg?.to?.y) ? cfg.to.y : defToY
      if (isFiniteNum(eFromX) && isFiniteNum(eFromY) && isFiniteNum(eToX) && isFiniteNum(eToY)) {
        if (cfg.points.length > 0) {
          const pts = cfg.points.filter(isValidPos)
          const d = `M ${eFromX} ${eFromY}` + pts.map(p => ` L ${p.x} ${p.y}`).join('') + ` L ${eToX} ${eToY}`
          lines.push(
            <path
              key="l-semiR-third"
              d={d}
              stroke={cfg.stroke}
              strokeWidth={cfg.width}
              fill="none"
              strokeDasharray={cfg.dash}
              onClick={(e) => {
                if (!isEditMode || !isPathEditMode) return
                e.stopPropagation()
                const { x, y } = getSvgCoords(e)
                const px = snapToGrid ? Math.round(x / GRID_STEP) * GRID_STEP : Math.round(x)
                const py = snapToGrid ? Math.round(y / GRID_STEP) * GRID_STEP : Math.round(y)
                setLayoutMap(prev => {
                  const prevNode = prev?.[semiR.id] || {}
                  const prevLinks = prevNode.links || {}
                  const link = prevLinks['toThird'] || {}
                  const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                  ptsPrev.push({ x: px, y: py })
                  return {
                    ...prev,
                    [semiR.id]: {
                      ...prevNode,
                      links: {
                        ...prevLinks,
                        toThird: { ...link, points: ptsPrev },
                      },
                    },
                  }
                })
              }}
              style={{ cursor: isEditMode && isPathEditMode ? 'copy' : 'default' }}
            />
          )
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'R:third')) {
            pointHandles.push(
              <circle
                key="h-to-semiR-third"
                cx={eToX}
                cy={eToY}
                r={6}
                fill="#fb923c"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'to', fromId: semiR.id, key: 'toThird', offsetX: x - eToX, offsetY: y - eToY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto final"
              />
            )
          }
          if (isEditMode && isPathEditMode && (!selectedLinkKey || selectedLinkKey === 'R:third')) {
            pointHandles.push(
              <circle
                key="h-from-semiR-third"
                cx={eFromX}
                cy={eFromY}
                r={6}
                fill="#22d3ee"
                stroke="#111"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const { x, y } = getSvgCoords(e)
                  setDragging({ kind: 'from', fromId: semiR.id, key: 'toThird', offsetX: x - eFromX, offsetY: y - eFromY })
                }}
                style={{ cursor: 'move' }}
                title="Arraste o ponto inicial"
              />
            )
          }
          if (isEditMode && isPathEditMode) {
            cfg.points.forEach((p, idx) => {
              if (!isValidPos(p)) return
              pointHandles.push(
                <circle
                  key={`pt-semiR-third-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="#06b6d4"
                  stroke="#111"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const { x, y } = getSvgCoords(e)
                    setDragging({ kind: 'point', fromId: semiR.id, key: 'toThird', index: idx, offsetX: x - p.x, offsetY: y - p.y })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setLayoutMap(prev => {
                      const prevNode = prev?.[semiR.id] || {}
                      const prevLinks = prevNode.links || {}
                      const link = prevLinks['toThird'] || {}
                      const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
                      ptsPrev.splice(idx, 1)
                      return {
                        ...prev,
                        [semiR.id]: {
                          ...prevNode,
                          links: {
                            ...prevLinks,
                            toThird: { ...link, points: ptsPrev },
                          },
                        },
                      }
                    })
                  }}
                  style={{ cursor: 'move' }}
                  title="Duplo clique para remover ponto"
                />
              )
            })
          }
        } else {
          // Fallback: desenhar um cotovelo padrão quando não houver pontos no JSON
          const d = makeElbowPath(eFromX, eFromY, eToX, eToY)
          if (d) {
            lines.push(
              <path
                key="l-semiR-third-def"
                d={d}
                stroke={cfg.stroke}
                strokeWidth={cfg.width}
                fill="none"
                strokeDasharray={cfg.dash}
              />
            )
          }
        }
      }
    }
  }

  // placas decorativas em formato de trapézio (sem fill gradients para simplicidade)
  const plates = []
  // placa acima do final removida (para não gerar path decorativo extra)
  // placas pequenas 'SEMIFINAL' acima de cada semi (para combinar com o design)
  const pushSemiPlate = (key, pos) => {
    if (!isValidPos(pos)) return
    const plateW = 110, plateH = 22, bevel = 10
    const cx = pos.x + CARD_W / 2
    const topY = pos.y - 26
    const x0 = cx - plateW / 2, x1 = cx + plateW / 2
    const y0 = topY, y1 = topY + plateH
    if ([x0, y0, x1, y1].every(isFiniteNum)) {
      const d = `M ${x0} ${y0} L ${x1} ${y0} L ${x1 - bevel} ${y1} L ${x0 + bevel} ${y1} Z`
      plates.push(
        <g key={key}>
          <path d={d} fill="url(#gold-grad)" stroke="#111" strokeWidth={1} opacity={0.95} filter="url(#gold-glow)" />
          <text x={cx} y={topY + plateH/2} textAnchor="middle" dominantBaseline="middle" className="fill-black" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>SEMIFINAL</text>
        </g>
      )
    }
  }
  if (semiL && isValidPos(posSemiL)) pushSemiPlate('plate-semiL', posSemiL)
  if (semiR && isValidPos(posSemiR)) pushSemiPlate('plate-semiR', posSemiR)
  // placa para 3º lugar
  if (third && isValidPos(posThird)) {
    const plateW = 120, plateH = 22, bevel = 10
    const cx = posThird.x + CARD_W / 2
    const topY = posThird.y - 26
    const x0 = cx - plateW / 2, x1 = cx + plateW / 2
    const y0 = topY, y1 = topY + plateH
    if ([x0, y0, x1, y1].every(isFiniteNum)) {
      const d = `M ${x0} ${y0} L ${x1} ${y0} L ${x1 - bevel} ${y1} L ${x0 + bevel} ${y1} Z`
      plates.push(
        <g key="plate-third">
          <path d={d} fill="url(#gold-grad)" stroke="#111" strokeWidth={1} opacity={0.95} filter="url(#gold-glow)" />
          <text x={cx} y={topY + plateH/2} textAnchor="middle" dominantBaseline="middle" className="fill-black" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>3º LUGAR</text>
        </g>
      )
    }
  }
  // Removida a placa central entre as semis (solicitado)

  return (
    <div className="bg-neutral-900 text-white">
      <svg ref={svgRef} className="block w-full h-auto" width={safeSW} height={safeSH} viewBox={`0 0 ${safeCW} ${safeCH}`}>
        <defs>
          <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ff2b77" floodOpacity="0.6" />
          </filter>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6aa3"/>
            <stop offset="100%" stopColor="#ff2b77"/>
          </linearGradient>
        </defs>
        {/* fundo clicável para adicionar pontos em modo de edição de caminhos */}
        <rect
          x={0}
          y={0}
          width={safeCW}
          height={safeCH}
          fill="transparent"
          onClick={(e) => {
            if (!isEditMode || !isPathEditMode || !selectedLinkKey) return
            const [side, dest] = selectedLinkKey.split(':')
            const from = side === 'L' ? semiL : semiR
            if (!from) return
            const key = dest === 'final' ? 'toFinal' : 'toThird'
            const { x, y } = getSvgCoords(e)
            const px = snapToGrid ? Math.round(x / GRID_STEP) * GRID_STEP : Math.round(x)
            const py = snapToGrid ? Math.round(y / GRID_STEP) * GRID_STEP : Math.round(y)
            setLayoutMap(prev => {
              const prevNode = prev?.[from.id] || {}
              const prevLinks = prevNode.links || {}
              const link = prevLinks[key] || {}
              const ptsPrev = Array.isArray(link.points) ? [...link.points] : []
              ptsPrev.push({ x: px, y: py })
              return {
                ...prev,
                [from.id]: {
                  ...prevNode,
                  links: {
                    ...prevLinks,
                    [key]: { ...link, points: ptsPrev },
                  },
                },
              }
            })
          }}
          style={{ cursor: isEditMode && isPathEditMode && selectedLinkKey ? 'crosshair' : 'default' }}
        />
        {/* grade de debug */}
        {showGrid && (
          <g>
            {/* linhas verticais */}
            {Array.from({ length: Math.max(0, Math.ceil(safeCW / GRID_STEP) + 1) }).map((_, i) => {
              const x = i * GRID_STEP
              return <line key={`gv-${i}`} x1={x} y1={0} x2={x} y2={safeCH} stroke="#666" strokeWidth={0.5} opacity={0.2} />
            })}
            {/* linhas horizontais */}
            {Array.from({ length: Math.max(0, Math.ceil(safeCH / GRID_STEP) + 1) }).map((_, i) => {
              const y = i * GRID_STEP
              return <line key={`gh-${i}`} x1={0} y1={y} x2={safeCW} y2={y} stroke="#666" strokeWidth={0.5} opacity={0.2} />
            })}
          </g>
        )}
  {/* títulos */}
        {/* removido rótulo textual 'Semifinal' para seguir o design */}
        {isValidPos(posSemiL) && (isEditMode || showGrid) && (
          <text x={posSemiL.x} y={posSemiL.y - 28} className="fill-white/70 text-[10px]">ID {semiL?.id}</text>
        )}
        {/* removido rótulo textual 'Semifinal' para seguir o design */}
        {isValidPos(posSemiR) && (isEditMode || showGrid) && (
          <text x={posSemiR.x} y={posSemiR.y - 28} className="fill-white/70 text-[10px]">ID {semiR?.id}</text>
        )}
        {/* Brasão removido - antes mostrava FinalCrest acima da final */}
        {isValidPos(posFinal) && (isEditMode || showGrid) && (
          <text x={posFinal.x} y={posFinal.y - 28} className="fill-white/70 text-[10px]">ID {finalJ?.id}</text>
        )}
  {/* removido rótulo textual '3º Lugar' para evitar duplicidade com a placa */}
        {isValidPos(posThird) && (isEditMode || showGrid) && (
          <text x={posThird.x} y={posThird.y - 28} className="fill-white/70 text-[10px]">ID {third?.id}</text>
        )}

  {/* conexões e placas decorativas */}
  {plates}
  <g filter="url(#gold-glow)">{lines}</g>
  {isEditMode && isPathEditMode && pointHandles}
        <text x={safeCW/2} y={safeCH - 12} textAnchor="middle" className="fill-white/70 tracking-widest" style={{fontSize: 12}}>
          LIGA DOS AMIGOS
        </text>

        {/* boxes */}
        {semiL && posSemiL && (() => { const s0 = getSlotPos(semiL.id, posSemiL, 0); return s0 && (
          <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(semiL.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
            <FinalsMatchCard
              jogo={semiL}
              jogos={jogos}
              duplas={srcDuplas}
              x={0}
              y={0}
              onClick={() => setModalJogo(semiL)}
              onOpenFonte={(refId) => {
                const src = jogos.find(j => j.id === refId)
                if (src) setModalJogo(src)
              }}
            />
          </g>
        )})()}
        {semiR && posSemiR && (() => { const s0 = getSlotPos(semiR.id, posSemiR, 0); return s0 && (
          <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(semiR.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
            <FinalsMatchCard
              jogo={semiR}
              jogos={jogos}
              duplas={srcDuplas}
              x={0}
              y={0}
              onClick={() => setModalJogo(semiR)}
              onOpenFonte={(refId) => {
                const src = jogos.find(j => j.id === refId)
                if (src) setModalJogo(src)
              }}
            />
          </g>
        )})()}
        {finalJ && posFinal && (() => { const s0 = getSlotPos(finalJ.id, posFinal, 0); return s0 && (
          <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(finalJ.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
            <FinalsMatchCard
              jogo={finalJ}
              jogos={jogos}
              duplas={srcDuplas}
              x={0}
              y={0}
              onClick={() => setModalJogo(finalJ)}
              onOpenFonte={(refId) => {
                const src = jogos.find(j => j.id === refId)
                if (src) setModalJogo(src)
              }}
            />
          </g>
        )})()}
        {third && posThird && (() => { const s0 = getSlotPos(third.id, posThird, 0); return s0 && (
          <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(third.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
            <FinalsMatchCard
              jogo={third}
              jogos={jogos}
              duplas={srcDuplas}
              x={0}
              y={0}
              onClick={() => setModalJogo(third)}
              onOpenFonte={(refId) => {
                const src = jogos.find(j => j.id === refId)
                if (src) setModalJogo(src)
              }}
            />
          </g>
        )})()}
      </svg>

      {modalJogo && (
        <ModalPlacar jogo={modalJogo} onSave={onSave} onClose={() => setModalJogo(null)} />
      )}
    </div>
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useBracketStore } from '../store/useBracketStore'
import ModalPlacar from './ModalPlacar'
import SingleSlotCard from './SingleSlotCard'
import layoutFinais from '../logic/layout/layoutFinais.json'

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

  // Layout base (como antes), mas com escala global de renderização
  const SCALE = 2 // aumente/diminua para ajustar o tamanho geral (2x, 1.5x, etc.)
  let CANVAS_W = 1000
  let CANVAS_H = 520
  let SVG_W = CANVAS_W * SCALE
  let SVG_H = CANVAS_H * SCALE

  // Estado de layout editável (inicia com JSON importado)
  const [layoutMap, setLayoutMap] = useState(() => ({ ...(layoutFinais || {}) }))
  const [isEditMode, setIsEditMode] = useState(false)
  const [dragging, setDragging] = useState(null) // { id, slot, offsetX, offsetY }
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const GRID_STEP = 40
  const svgRef = useRef(null)

  // helpers para coordenadas SVG a partir do mouse
  const getSvgCoords = (e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) / SCALE
    const y = (e.clientY - rect.top) / SCALE
    return { x, y }
  }

  const onMouseDownSlot = (id, slot, pos) => (e) => {
    if (!isEditMode) return
    e.preventDefault()
    e.stopPropagation()
    const { x, y } = getSvgCoords(e)
    setDragging({ id, slot, offsetX: x - pos.x, offsetY: y - pos.y })
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const { x, y } = getSvgCoords(e)
      let nx = x - dragging.offsetX
      let ny = y - dragging.offsetY
      if (snapToGrid) {
        nx = Math.round(nx / GRID_STEP) * GRID_STEP
        ny = Math.round(ny / GRID_STEP) * GRID_STEP
      } else {
        nx = Math.round(nx)
        ny = Math.round(ny)
      }
      setLayoutMap((prev) => {
        const prevNode = prev?.[dragging.id] || {}
        const prevSlots = prevNode.slots || {}
        return {
          ...prev,
          [dragging.id]: {
            ...prevNode,
            slots: {
              ...prevSlots,
              [dragging.slot]: { x: nx, y: ny },
            },
          },
        }
      })
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, snapToGrid])

  // exportar/importar preset
  const exportPreset = () => {
    const blob = new Blob([JSON.stringify(layoutMap, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'layoutFinais.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const importPreset = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(String(ev.target.result))
        setLayoutMap(json)
      } catch (e) {
        console.error('Preset inválido', e)
      }
    }
    reader.readAsText(file)
  }
  const CARD_W = 260 // coerente com COLUMN_WIDTH do modo compacto
  const PADDING_X = 60
  const PADDING_Y = 60
  const GAP_Y = 160 // distância vertical entre final e terceiro lugar

  // posições
  // dimensões dos slots (precisam estar antes de cálculos que os usam)
  const SLOT_H = 24 // altura do SingleSlotCard
  const SLOT_GAP = 24 // gap entre os dois slots empilhados (aumentado)
  const SEMI_STACK_H = SLOT_H * 2 + SLOT_GAP

  const midX = Math.floor((CANVAS_W - CARD_W) / 2)
  // fallback padrão (como estava antes)
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

  // posições vindas do layout editável (se existir), com fallback
  const posSemiL = semiL ? (layoutMap?.[semiL.id] || fallbackSemiLeft) : null
  const posSemiR = semiR ? (layoutMap?.[semiR.id] || fallbackSemiRight) : null
  const posFinal = finalJ ? (layoutMap?.[finalJ.id] || fallbackFinalPos) : null
  const posThird = third ? (layoutMap?.[third.id] || fallbackThirdPos) : null

  // posição efetiva de cada slot (permite mover slot individual, com fallback para stack)
  const getSlotPos = (id, stackPos, slotIndex) => {
    const s = layoutMap?.[id]?.slots?.[slotIndex]
    if (s && typeof s.x === 'number' && typeof s.y === 'number') return s
    if (!stackPos) return null
    return {
      x: stackPos.x,
      y: stackPos.y + (slotIndex === 0 ? 0 : (SLOT_H + SLOT_GAP)),
    }
  }

  // calcular canvas dinamicamente baseado nas posições
  const SLOT_LEFT = 24
  const SLOT_RIGHT = 228
  // const stackHeight = (SLOT_H * 2 + SLOT_GAP)
  const extents = []
  // considerar extents por slot (caso tenham sido movidos)
  const pushSlotExtents = (id, stackPos) => {
    const s0 = getSlotPos(id, stackPos, 0)
    const s1 = getSlotPos(id, stackPos, 1)
    if (s0) extents.push({ x: s0.x + SLOT_RIGHT, y: s0.y + SLOT_H })
    if (s1) extents.push({ x: s1.x + SLOT_RIGHT, y: s1.y + SLOT_H })
  }
  if (semiL && posSemiL) pushSlotExtents(semiL.id, posSemiL)
  if (semiR && posSemiR) pushSlotExtents(semiR.id, posSemiR)
  if (finalJ && posFinal) pushSlotExtents(finalJ.id, posFinal)
  if (third && posThird) pushSlotExtents(third.id, posThird)
  if (extents.length > 0) {
    const maxX = Math.max(...extents.map(e => e.x))
    const maxY = Math.max(...extents.map(e => e.y))
    CANVAS_W = Math.max(CANVAS_W, maxX + 80)
    CANVAS_H = Math.max(CANVAS_H, maxY + 80)
    SVG_W = CANVAS_W * SCALE
    SVG_H = CANVAS_H * SCALE
  }

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
    }
  }

  // Desenha linha reta ou em "cotovelo" baseado no config
  const makePath = (fromX, fromY, toX, toY, cfg, goRight) => {
    if (cfg.elbow) {
      const midX = fromX + (goRight ? cfg.offset : -cfg.offset)
      return `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`
    }
    return `M ${fromX} ${fromY} L ${toX} ${toY}`
  }

  const lines = []
  // Conectar semis aos slots da Final (winners): topo recebe vencedor da esquerda, baixo recebe vencedor da direita
  if (semiL && finalJ && posSemiL && posFinal) {
    const goRight = posFinal.x >= posSemiL.x
    const fromX = goRight ? (posSemiL.x + RIGHT_PORT) : (posSemiL.x + LEFT_PORT)
    const fromY = posSemiL.y + (SEMI_STACK_H / 2)
    const finalTop = getSlotPos(finalJ.id, posFinal, 0)
    const toX = goRight ? (finalTop.x + LEFT_PORT) : (finalTop.x + RIGHT_PORT)
    const toY = finalTop.y + (SLOT_H / 2)
    const cfg = getLinkConfig(semiL.id, 'toFinal', { elbow: true, offset: 12, stroke: '#333', width: 1, dash: undefined })
    const d = makePath(fromX, fromY, toX, toY, cfg, goRight)
    lines.push(<path key="l-semiL-final" d={d} stroke={cfg.stroke} strokeWidth={cfg.width} fill="none" strokeDasharray={cfg.dash} />)
  }
  if (semiR && finalJ && posSemiR && posFinal) {
    const goRight = posFinal.x >= posSemiR.x
    const fromX = goRight ? (posSemiR.x + RIGHT_PORT) : (posSemiR.x + LEFT_PORT)
    const fromY = posSemiR.y + (SEMI_STACK_H / 2)
    const finalBottom = getSlotPos(finalJ.id, posFinal, 1)
    const toX = goRight ? (finalBottom.x + LEFT_PORT) : (finalBottom.x + RIGHT_PORT)
    const toY = finalBottom.y + (SLOT_H / 2)
    const cfg = getLinkConfig(semiR.id, 'toFinal', { elbow: true, offset: 12, stroke: '#333', width: 1, dash: undefined })
    const d = makePath(fromX, fromY, toX, toY, cfg, goRight)
    lines.push(<path key="l-semiR-final" d={d} stroke={cfg.stroke} strokeWidth={cfg.width} fill="none" strokeDasharray={cfg.dash} />)
  }
  // Conectar semis aos slots do 3º lugar (losers): topo recebe perdedor da esquerda, baixo recebe perdedor da direita (tracejado)
  if (semiL && third && posSemiL && posThird) {
    const goRight = posThird.x >= posSemiL.x
    const fromX = goRight ? (posSemiL.x + RIGHT_PORT) : (posSemiL.x + LEFT_PORT)
    const fromY = posSemiL.y + (SEMI_STACK_H / 2)
    const thirdTop = getSlotPos(third.id, posThird, 0)
    const toX = goRight ? (thirdTop.x + LEFT_PORT) : (thirdTop.x + RIGHT_PORT)
    const toY = thirdTop.y + (SLOT_H / 2)
    const cfg = getLinkConfig(semiL.id, 'toThird', { elbow: true, offset: 12, stroke: '#333', width: 1, dash: '4 3' })
    const d = makePath(fromX, fromY, toX, toY, cfg, goRight)
    lines.push(<path key="l-semiL-third" d={d} stroke={cfg.stroke} strokeWidth={cfg.width} fill="none" strokeDasharray={cfg.dash} />)
  }
  if (semiR && third && posSemiR && posThird) {
    const goRight = posThird.x >= posSemiR.x
    const fromX = goRight ? (posSemiR.x + RIGHT_PORT) : (posSemiR.x + LEFT_PORT)
    const fromY = posSemiR.y + (SEMI_STACK_H / 2)
    const thirdBottom = getSlotPos(third.id, posThird, 1)
    const toX = goRight ? (thirdBottom.x + LEFT_PORT) : (thirdBottom.x + RIGHT_PORT)
    const toY = thirdBottom.y + (SLOT_H / 2)
    const cfg = getLinkConfig(semiR.id, 'toThird', { elbow: true, offset: 12, stroke: '#333', width: 1, dash: '4 3' })
    const d = makePath(fromX, fromY, toX, toY, cfg, goRight)
    lines.push(<path key="l-semiR-third" d={d} stroke={cfg.stroke} strokeWidth={cfg.width} fill="none" strokeDasharray={cfg.dash} />)
  }

  return (
    <div className="bg-neutral-900 text-white p-4 rounded space-y-3">
      <h3 className="text-lg font-bold text-pink-400">Fase Finais</h3>

      {/* toolbar edição */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isEditMode} onChange={e => setIsEditMode(e.target.checked)} />
          Modo edição (arrastar)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
          Mostrar grade (debug)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={snapToGrid} onChange={e => setSnapToGrid(e.target.checked)} />
          Travar na grade
        </label>
        <button className="px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm" onClick={exportPreset}>Salvar preset (download)</button>
        <label className="px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm cursor-pointer">
          Importar preset
          <input type="file" accept="application/json" className="hidden" onChange={e => importPreset(e.target.files?.[0])} />
        </label>
        <span className="opacity-70 text-xs">Escala: {SCALE}x</span>
      </div>

      <svg ref={svgRef} className="block" width={SVG_W} height={SVG_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
        {/* grade de debug */}
        {showGrid && (
          <g>
            {/* linhas verticais */}
            {Array.from({ length: Math.ceil(CANVAS_W / GRID_STEP) + 1 }).map((_, i) => {
              const x = i * GRID_STEP
              return <line key={`gv-${i}`} x1={x} y1={0} x2={x} y2={CANVAS_H} stroke="#666" strokeWidth={0.5} opacity={0.2} />
            })}
            {/* linhas horizontais */}
            {Array.from({ length: Math.ceil(CANVAS_H / GRID_STEP) + 1 }).map((_, i) => {
              const y = i * GRID_STEP
              return <line key={`gh-${i}`} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke="#666" strokeWidth={0.5} opacity={0.2} />
            })}
          </g>
        )}
        {/* títulos */}
        {posSemiL && <text x={posSemiL.x} y={posSemiL.y - 12} className="fill-pink-300 text-sm">Semifinal</text>}
        {posSemiL && (isEditMode || showGrid) && (
          <text x={posSemiL.x} y={posSemiL.y - 28} className="fill-white/70 text-[10px]">ID {semiL?.id}</text>
        )}
        {posSemiR && <text x={posSemiR.x} y={posSemiR.y - 12} className="fill-pink-300 text-sm">Semifinal</text>}
        {posSemiR && (isEditMode || showGrid) && (
          <text x={posSemiR.x} y={posSemiR.y - 28} className="fill-white/70 text-[10px]">ID {semiR?.id}</text>
        )}
        {posFinal && <text x={posFinal.x} y={posFinal.y - 12} className="fill-pink-300 text-sm">Final</text>}
        {posFinal && (isEditMode || showGrid) && (
          <text x={posFinal.x} y={posFinal.y - 28} className="fill-white/70 text-[10px]">ID {finalJ?.id}</text>
        )}
        {posThird && <text x={posThird.x} y={posThird.y - 12} className="fill-pink-300 text-sm">3º Lugar</text>}
        {posThird && (isEditMode || showGrid) && (
          <text x={posThird.x} y={posThird.y - 28} className="fill-white/70 text-[10px]">ID {third?.id}</text>
        )}

        {/* conexões */}
        {lines}

        {/* boxes */}
        {semiL && posSemiL && (
          <>
            {(() => { const s0 = getSlotPos(semiL.id, posSemiL, 0); return s0 && (
              <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(semiL.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={semiL} slot={0} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(semiL) : undefined} />
              </g>
            )})()}
            {(() => { const s1 = getSlotPos(semiL.id, posSemiL, 1); return s1 && (
              <g transform={`translate(${s1.x}, ${s1.y})`} onMouseDown={onMouseDownSlot(semiL.id, 1, s1)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={semiL} slot={1} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(semiL) : undefined} />
              </g>
            )})()}
          </>
        )}
        {semiR && posSemiR && (
          <>
            {(() => { const s0 = getSlotPos(semiR.id, posSemiR, 0); return s0 && (
              <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(semiR.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={semiR} slot={0} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(semiR) : undefined} />
              </g>
            )})()}
            {(() => { const s1 = getSlotPos(semiR.id, posSemiR, 1); return s1 && (
              <g transform={`translate(${s1.x}, ${s1.y})`} onMouseDown={onMouseDownSlot(semiR.id, 1, s1)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={semiR} slot={1} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(semiR) : undefined} />
              </g>
            )})()}
          </>
        )}
        {finalJ && posFinal && (
          <>
            {(() => { const s0 = getSlotPos(finalJ.id, posFinal, 0); return s0 && (
              <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(finalJ.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={finalJ} slot={0} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(finalJ) : undefined} />
              </g>
            )})()}
            {(() => { const s1 = getSlotPos(finalJ.id, posFinal, 1); return s1 && (
              <g transform={`translate(${s1.x}, ${s1.y})`} onMouseDown={onMouseDownSlot(finalJ.id, 1, s1)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={finalJ} slot={1} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(finalJ) : undefined} />
              </g>
            )})()}
          </>
        )}
        {third && posThird && (
          <>
            {(() => { const s0 = getSlotPos(third.id, posThird, 0); return s0 && (
              <g transform={`translate(${s0.x}, ${s0.y})`} onMouseDown={onMouseDownSlot(third.id, 0, s0)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={third} slot={0} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(third) : undefined} />
              </g>
            )})()}
            {(() => { const s1 = getSlotPos(third.id, posThird, 1); return s1 && (
              <g transform={`translate(${s1.x}, ${s1.y})`} onMouseDown={onMouseDownSlot(third.id, 1, s1)} style={{ cursor: isEditMode ? 'grab' : 'pointer' }}>
                <SingleSlotCard jogo={third} slot={1} jogos={jogos} duplas={srcDuplas} onClick={!isEditMode ? () => setModalJogo(third) : undefined} />
              </g>
            )})()}
          </>
        )}
      </svg>

      {modalJogo && (
        <ModalPlacar jogo={modalJogo} onSave={onSave} onClose={() => setModalJogo(null)} />
      )}
    </div>
  )
}

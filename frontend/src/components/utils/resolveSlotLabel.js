export function resolveSlotLabel(slotValue, fontes = [], duplas = [], slotIndex = 0, jogos = []) {
  
  
  

  
  if (slotValue != null && (typeof slotValue === 'number' || typeof slotValue === 'string')) {
    const found = duplas.find(d => String(d.id) === String(slotValue));
    return found ? (found.nome || `Participante ${found.id}`) : `Participante ${slotValue}`;
  }

  
  if (slotValue && typeof slotValue === 'object' && slotValue.nome) {
    return slotValue.nome;
  }

  
  if (Array.isArray(fontes) && fontes.length > 0) {
    const jogosById = new Map((Array.isArray(jogos) ? jogos : []).map(j => [j.id, j]))
    const followRef = (refId) => {
      // segue cadeia de marcadores (e.g., upper-final/lower-final) até um jogo "real"
      let current = jogosById.get(refId)
      let lastId = refId
      let safety = 0
      while (current && safety < 5) {
        safety++
        // se tiver exatamente uma fonte "from", seguimos
        const fs = Array.isArray(current.fontes) ? current.fontes.filter(f => f && f.type === 'from' && f.ref != null) : []
        if (fs.length === 1) {
          lastId = fs[0].ref
          current = jogosById.get(lastId)
        } else {
          break
        }
      }
      return { match: current, lastId }
    }
    const fByIndex = fontes[slotIndex];
    if (fByIndex) {
      if (fByIndex.type === 'from' && fByIndex.path && fByIndex.ref != null) {
        // seguir cadeia de referencias até jogo base
        const { match: base, lastId } = followRef(fByIndex.ref)
        const src = base || (Array.isArray(jogos) ? jogos.find(j => j.id === fByIndex.ref) : null)
        const refLabelId = src ? src.id : (base ? lastId : fByIndex.ref)
        if (src && fByIndex.path === 'vencedor') {
          if (src.vencedor != null) {
            const v = src.vencedor
            const foundV = duplas.find(d => String(d.id) === String(v))
            return foundV ? (foundV.nome || `Participante ${foundV.id}`) : `Vencedor Jogo ${refLabelId}`
          }
          return `Vencedor Jogo ${refLabelId}`
        }
        if (src && fByIndex.path === 'perdedor') {
          if (src.vencedor != null) {
            const winner = src.vencedor
            let sa = src.a, sb = src.b
            // tentar resolver lados a/b a partir das fontes do src
            if ((sa == null || sb == null) && Array.isArray(src.fontes)) {
              const refSides = src.fontes.map(f => (f && f.type === 'seed' ? f.id : null)).filter(v => v != null)
              if (sa == null) sa = refSides[0] ?? sa
              if (sb == null) sb = refSides[1] ?? sb
            }
            const loserId = (sa != null && String(sa) !== String(winner)) ? sa : (sb != null && String(sb) !== String(winner) ? sb : null)
            if (loserId != null) {
              const foundL = duplas.find(d => String(d.id) === String(loserId))
              return foundL ? (foundL.nome || `Participante ${foundL.id}`) : `Perdedor Jogo ${refLabelId}`
            }
          }
          return `Perdedor Jogo ${refLabelId}`
        }
        return `Fonte Jogo ${refLabelId}`
      }
      if (fByIndex.type === 'seed' && fByIndex.id != null) {
        const s = duplas.find(d => String(d.id) === String(fByIndex.id));
        return s ? (s.nome || `Participante ${s.id}`) : `Participante ${fByIndex.id}`;
      }
      if (fByIndex.type === 'bye') return 'Bye';
    }

    
    const fFrom = fontes.find(f => f.type === 'from' && f.path && f.ref != null);
    if (fFrom) {
      if (fFrom.path === 'vencedor') return `Vencedor Jogo ${fFrom.ref}`;
      if (fFrom.path === 'perdedor') return `Perdedor Jogo ${fFrom.ref}`;
      return `Fonte Jogo ${fFrom.ref}`;
    }

    
    
    if (slotValue == null) return 'Bye';
  }

  return '—';
}

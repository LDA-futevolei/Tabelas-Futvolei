export function resolveSlotLabel(slotValue, fontes = [], duplas = [], slotIndex = 0, jogos = []) {
  
  
  

  
  if (slotValue != null && (typeof slotValue === 'number' || typeof slotValue === 'string')) {
    const found = duplas.find(d => String(d.id) === String(slotValue));
    return found ? (found.nome || `Participante ${found.id}`) : `Participante ${slotValue}`;
  }

  
  if (slotValue && typeof slotValue === 'object' && slotValue.nome) {
    return slotValue.nome;
  }

  
  if (Array.isArray(fontes) && fontes.length > 0) {
    const fByIndex = fontes[slotIndex];
    if (fByIndex) {
      if (fByIndex.type === 'from' && fByIndex.path && fByIndex.ref != null) {
        
        const src = Array.isArray(jogos) ? jogos.find(j => j.id === fByIndex.ref) : null
        if (src && fByIndex.path === 'vencedor' && src.vencedor != null) {
          
          const v = src.vencedor
          const foundV = duplas.find(d => String(d.id) === String(v))
          return foundV ? (foundV.nome || `Participante ${foundV.id}`) : `Vencedor Jogo ${fByIndex.ref}`
        }
        if (src && fByIndex.path === 'perdedor') {
          
          if (src.vencedor != null) {
            const winner = src.vencedor
            
            const loserId = (src.a != null && String(src.a) !== String(winner)) ? src.a : (src.b != null && String(src.b) !== String(winner) ? src.b : null)
            if (loserId != null) {
              const foundL = duplas.find(d => String(d.id) === String(loserId))
              return foundL ? (foundL.nome || `Participante ${foundL.id}`) : `Perdedor Jogo ${fByIndex.ref}`
            }
          }
          return `Perdedor Jogo ${fByIndex.ref}`
        }
        
        return `Fonte Jogo ${fByIndex.ref}`
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

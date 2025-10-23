export function resolveSlotLabel(slotValue, fontes = [], duplas = [], slotIndex = 0, jogos = []) {
  // PRIORIDADE 1: Se o slot já tem um valor direto (a ou b preenchidos), use-o
  if (slotValue != null && (typeof slotValue === 'number' || typeof slotValue === 'string')) {
    const found = duplas.find(d => String(d.id) === String(slotValue));
    return found ? (found.nome || `Participante ${found.id}`) : `Participante ${slotValue}`;
  }

  // PRIORIDADE 2: Se é um objeto com nome
  if (slotValue && typeof slotValue === 'object' && slotValue.nome) {
    return slotValue.nome;
  }

  // PRIORIDADE 3: Apenas se NÃO houver valor direto, tenta resolver das fontes
  if (Array.isArray(fontes) && fontes.length > 0) {
    const jogosById = new Map((Array.isArray(jogos) ? jogos : []).map(j => [j.id, j]))
    
    // Helper: seguir cadeia de marcadores (upper-final/lower-final) até jogo real
    const followToRealMatch = (refId) => {
      let current = jogosById.get(refId)
      let depth = 0
      while (current && depth < 10) {
        depth++
        // Se é um marcador com uma única fonte, seguir
        if ((current.tipo === 'upper-final' || current.tipo === 'lower-final') && 
            Array.isArray(current.fontes) && current.fontes.length === 1) {
          const f = current.fontes[0]
          if (f && f.type === 'from' && f.ref != null) {
            current = jogosById.get(f.ref)
            continue
          }
        }
        // Chegamos num jogo real ou semi
        break
      }
      return current
    }
    
    const fByIndex = fontes[slotIndex];
    if (fByIndex) {
      if (fByIndex.type === 'from' && fByIndex.path && fByIndex.ref != null) {
        // Seguir até o jogo real (pular marcadores)
        const src = followToRealMatch(fByIndex.ref)
        const refLabelId = src ? src.id : fByIndex.ref
        
        // Labels personalizados para finais baseados no TIPO do jogo fonte
        if (src) {
          // Detectar se é semi, quarta, oitava, etc. baseado no tipo
          let friendlyLabel = null
          
          if (src.tipo === 'semi' && src.fase === 'finais') {
            // É uma semifinal das finais
            const semiNum = src.region === 'L' ? '1' : '2'
            if (fByIndex.path === 'vencedor') {
              friendlyLabel = `Vencedor Semi Final ${semiNum}`
            } else if (fByIndex.path === 'perdedor') {
              friendlyLabel = `Perdedor Semi Final ${semiNum}`
            }
          } else if (src.tipo === 'upper-final' || src.tipo === 'lower-final') {
            // É um marcador - não deveria chegar aqui, mas caso chegue
            const side = src.region === 'L' ? 'Esquerda' : 'Direita'
            friendlyLabel = fByIndex.path === 'vencedor' 
              ? `Vencedor ${src.tipo === 'upper-final' ? 'Upper' : 'Lower'} (${side})`
              : `Perdedor ${src.tipo === 'upper-final' ? 'Upper' : 'Lower'} (${side})`
          }
          
          // Se temos label amigável e o jogo fonte já foi decidido, mostrar nome
          if (friendlyLabel) {
            if (fByIndex.path === 'vencedor' && src.vencedor != null) {
              const foundV = duplas.find(d => String(d.id) === String(src.vencedor))
              return foundV ? (foundV.nome || `Participante ${foundV.id}`) : friendlyLabel
            }
            if (fByIndex.path === 'perdedor' && src.vencedor != null) {
              // Calcular perdedor
              let sa = src.a, sb = src.b
              if ((sa == null || sb == null) && Array.isArray(src.fontes)) {
                const refSides = src.fontes.map(f => (f && f.type === 'seed' ? f.id : null)).filter(v => v != null)
                if (sa == null) sa = refSides[0] ?? sa
                if (sb == null) sb = refSides[1] ?? sb
              }
              const loserId = (sa != null && String(sa) !== String(src.vencedor)) ? sa : (sb != null && String(sb) !== String(src.vencedor) ? sb : null)
              if (loserId != null) {
                const foundL = duplas.find(d => String(d.id) === String(loserId))
                return foundL ? (foundL.nome || `Participante ${foundL.id}`) : friendlyLabel
              }
            }
            // Jogo fonte ainda não decidido - mostrar placeholder
            return friendlyLabel
          }
        }
        
        if (src && fByIndex.path === 'vencedor') {
          // NUNCA resolver o nome do vencedor até que src.vencedor esteja definido
          if (src.vencedor != null) {
            const v = src.vencedor
            const foundV = duplas.find(d => String(d.id) === String(v))
            // Só retorna o nome se encontrar nas duplas; caso contrário placeholder
            if (foundV) return foundV.nome || `Participante ${foundV.id}`
          }
          // Sempre mostrar placeholder enquanto vencedor não decidido
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

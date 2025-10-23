export async function getAtualCampeonato() {
  try {
    const res = await fetch('/api/campeonato/atual', { credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn('Falha ao carregar campeonato atual', e)
    return null
  }
}

export async function getFinaisLayout(campeonatoId) {
  const url = new URL('/api/layout/finais', window.location.origin)
  if (campeonatoId != null) url.searchParams.set('campeonatoId', String(campeonatoId))
  try {
    const res = await fetch(url.toString(), { credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn('Falha ao carregar layout finais', e)
    return null
  }
}

export async function putFinaisLayout(campeonatoId, data) {
  try {
    const res = await fetch('/api/layout/finais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ campeonatoId, data })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn('Falha ao salvar layout finais', e)
    return null
  }
}

export async function getClassificacaoLayout(campeonatoId) {
  const url = new URL('/api/layout/classificacao', window.location.origin)
  if (campeonatoId != null) url.searchParams.set('campeonatoId', String(campeonatoId))
  try {
    const res = await fetch(url.toString(), { credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn('Falha ao carregar layout classificação', e)
    return null
  }
}

export async function putClassificacaoLayout(campeonatoId, data) {
  try {
    const res = await fetch('/api/layout/classificacao', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ campeonatoId, data })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn('Falha ao salvar layout classificação', e)
    return null
  }
}

// Auth
export async function apiLogin(email, senha) {
  const res = await fetch('/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, senha }),
  })
  if (!res.ok) throw new Error('Login falhou')
  return true
}

export async function apiProfile() {
  const res = await fetch('/api/user/profile', { credentials: 'include' })
  if (res.status === 401) return null
  const json = await res.json().catch(() => ({}))
  return json?.data ?? null
}

export async function apiLogout() {
  await fetch('/api/user/logout', { credentials: 'include' })
}

// Campeonatos
export async function listCampeonatos() {
  const res = await fetch('/api/campeonato/list', { credentials: 'include' })
  if (!res.ok) throw new Error('Falha ao carregar campeonatos')
  const json = await res.json()
  return json?.data ?? []
}

export async function createCampeonato(payload) {
  const res = await fetch('/api/campeonato/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload || {}),
  })
  if (!res.ok) throw new Error('Falha ao criar campeonato')
  const json = await res.json()
  return json?.data ?? null
}

// Meta (nome/título do campeonato)
export async function getMeta(campeonatoId) {
  const url = new URL('/api/layout/meta', window.location.origin)
  if (campeonatoId != null) url.searchParams.set('campeonatoId', String(campeonatoId))
  const res = await fetch(url.toString(), { credentials: 'include' })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

export async function putMeta(campeonatoId, data) {
  const res = await fetch('/api/layout/meta', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ campeonatoId, data }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

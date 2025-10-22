# Backend - Layout Finais (API)

## Endpoints

- GET `/api/layout/finais?campeonatoId=<id>`
  - Retorna o JSON do layout das finais para o campeonato informado (ou global quando omitido).
- PUT `/api/layout/finais`
  - Body: `{ campeonatoId?: number, data: object }`
  - Salva (upsert) o layout.

## Pré-requisitos

- Variáveis de ambiente:
  - `DATABASE_URL` (MySQL)
  - `PORT` (padrão 3000)
  - `FRONTEND_PORT` (padrão 5173) para CORS em dev
  - `SECRET` (sessão)

## Setup local

```bash
# instalar deps
npm ci

# preparar Prisma
npx prisma generate
npx prisma migrate dev --name add_layout_finais

# iniciar API em dev (ts-node-dev)
npm run dev
```

## Observações

- O modelo `Layout` usa `Json` para armazenar o preset inteiro.
- A chave única é `(stage, idCampeonato)` para permitir presets por campeonato e globais.
- Ajuste CORS/`FRONTEND_PORT` conforme necessário no deploy.

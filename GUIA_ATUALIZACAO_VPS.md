# 🚀 Guia de Atualização do Backend na VPS

## Problema Identificado
O erro 502 (Bad Gateway) ocorre porque:
1. O backend não está aceitando requisições do frontend devido à configuração CORS
2. A configuração de cookies da sessão não está adequada para HTTPS

## 📋 Passos para Corrigir

### 1. Criar/Atualizar o arquivo `.env` na VPS

Conecte na sua VPS e navegue até a pasta do backend:

```bash
cd /caminho/para/backend
```

Crie ou edite o arquivo `.env`:

```bash
nano .env
```

Cole o seguinte conteúdo (ajuste os valores conforme necessário):

```env
# URL do banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

# Secret para as sessões (IMPORTANTE: use uma string aleatória e segura)
SECRET="sua-chave-secreta-muito-segura-aqui-123456"

# Porta do servidor (padrão: 3000)
PORT=3000

# Ambiente de produção (importante para configurar cookies HTTPS corretamente)
NODE_ENV=production

# Origens permitidas para CORS (separadas por vírgula)
# Inclua TODAS as URLs de onde o frontend pode acessar o backend
CORS_ORIGINS=https://ligadosamigosftv.com.br,http://ligadosamigosftv.com.br,http://51.222.162.6:5173,http://localhost:5173
```

Salve o arquivo (Ctrl+O, Enter, Ctrl+X no nano).

### 2. Atualizar os arquivos do backend na VPS

Você precisa atualizar o código do backend na VPS. Existem duas opções:

#### Opção A: Via Git (Recomendado)
```bash
cd /caminho/para/backend
git pull origin develop
npm install
npm run build
```

#### Opção B: Copiar arquivos manualmente
- Copie o arquivo `backend/src/routes/routes.ts` atualizado para a VPS
- Rode `npm run build` para recompilar

### 3. Reiniciar o servidor backend

Dependendo de como você está rodando o backend (PM2, systemd, etc.):

```bash
# Se estiver usando PM2:
pm2 restart backend

# Ou se estiver rodando diretamente:
npm run start
```

### 4. Verificar os logs

```bash
# Se estiver usando PM2:
pm2 logs backend

# Procure por:
# - "Server online na porta: 3000"
# - Sem erros de CORS
```

## ✅ Testar

1. Reinicie o frontend local (Ctrl+C e depois `npm run dev`)
2. Acesse `http://localhost:5173/login`
3. Tente fazer login - não deve mais dar erro 502

## 🔍 Troubleshooting

### Se ainda der erro 502:

1. **Verifique se o backend está rodando:**
   ```bash
   curl http://localhost:3000/api/user/me
   ```

2. **Verifique os logs do servidor web (nginx/apache):**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Confirme que a porta 3000 está aberta:**
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

### Se der erro de CORS:

Verifique se a variável `CORS_ORIGINS` no `.env` inclui todas as URLs necessárias.

## 📝 Notas Importantes

- O `SECRET` deve ser uma string longa e aleatória em produção
- Mantenha o `NODE_ENV=production` no `.env` da VPS
- Não compartilhe o arquivo `.env` - ele contém informações sensíveis
- Faça backup do `.env` antes de fazer alterações

## ❓ Dúvidas?

Se continuar com problemas:
1. Verifique os logs do backend: `pm2 logs` ou similar
2. Verifique os logs do nginx/apache
3. Teste a conexão direta: `curl http://localhost:3000/api/user/me`

# Criar Usuário Admin

Antes de fazer login pela primeira vez, você precisa criar um usuário administrador.

## Opção 1: Via script interativo (recomendado para desenvolvimento)

No backend, execute:

```bash
cd backend
node scripts/create-admin-simple.js
```

O script vai pedir:
- Nome
- Email
- Senha

E criará o usuário admin no banco de dados.

## Opção 2: Via variáveis de ambiente (recomendado para produção/CI)

Defina no `.env` do backend:

```
ADMIN_NAME="Seu Nome"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="senha-segura-aqui"
```

E execute:

```bash
cd backend
node scripts/create-admin-simple.js
```

O script lerá automaticamente do `.env` e criará o admin sem prompt.

## Observações

- O script verifica se o email já existe antes de criar.
- A senha é armazenada com bcrypt (hash seguro).
- O campo `isAdmin` é definido como `true` automaticamente.
- Após criar, você pode fazer login em `/dashboard/login`.

---

# Registro de Novos Usuários

Usuários comuns (não-admins) podem se auto-registrar via interface web:

1. Acesse http://localhost:5173/dashboard/register (dev) ou https://seu-dominio.com.br/dashboard/register (produção).
2. Preencha Nome, Email e Senha.
3. Clique em "Criar Conta".
4. Após o cadastro, faça login em `/dashboard/login`.

> **Nota:** O auto-registro via `/api/user/signup` cria usuários com `isAdmin: false`. Somente admins podem promover outros usuários a admin (via endpoint `/api/user/register` protegido).

// Script simples para criar usuário admin (JavaScript)
// Execute com: node scripts/create-admin-simple.js
// Ou defina no .env: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD e rode sem prompt

require('dotenv').config(); // carrega .env se existir

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('=== Criar Usuário Admin ===\n');

  // Tenta ler do .env primeiro, senão pede via prompt
  let nome = process.env.ADMIN_NAME || '';
  let email = process.env.ADMIN_EMAIL || '';
  let senha = process.env.ADMIN_PASSWORD || '';

  if (!nome) {
    nome = await question('Nome: ');
  } else {
    console.log(`Nome (do .env): ${nome}`);
  }

  if (!email) {
    email = await question('Email: ');
  } else {
    console.log(`Email (do .env): ${email}`);
  }

  if (!senha) {
    senha = await question('Senha: ');
  } else {
    console.log('Senha (do .env): ******');
  }

  if (!nome || !email || !senha) {
    console.error('\n❌ Todos os campos são obrigatórios!');
    process.exit(1);
  }

  // Verificar se já existe
  const exists = await prisma.usuario.findUnique({
    where: { email },
  });

  if (exists) {
    console.error('\n❌ Já existe um usuário com este email!');
    process.exit(1);
  }

  // Hash da senha (bcrypt com salt=10)
  const senhaHash = await bcrypt.hash(senha, 10);

  // Criar usuário
  const user = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      isAdmin: true,
    },
  });

  console.log('\n✅ Admin criado com sucesso!');
  console.log(`   Nome: ${user.nome}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   isAdmin: ${user.isAdmin}\n`);
  console.log('Agora você pode fazer login em /dashboard/login\n');

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('\n❌ Erro:', e.message);
  rl.close();
  prisma.$disconnect();
  process.exit(1);
});

// Script simples para criar usuário admin (JavaScript)
// Execute com: node scripts/create-admin-simple.js

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

  const nome = await question('Nome: ');
  const email = await question('Email: ');
  const senha = await question('Senha: ');

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

  // Hash da senha
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
  console.log(`   Email: ${user.email}\n`);
  console.log('Agora você pode fazer login em /dashboard/login\n');

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});

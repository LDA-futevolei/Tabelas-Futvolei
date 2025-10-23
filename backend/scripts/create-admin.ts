// Script para criar o primeiro usuário admin
// Execute com: npx ts-node scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('=== Criar Primeiro Usuário Admin ===\n');

  const nome = await question('Nome completo: ');
  const email = await question('Email: ');
  const senha = await question('Senha: ');

  if (!nome || !email || !senha) {
    console.error('\n❌ Todos os campos são obrigatórios!');
    process.exit(1);
  }

  // Verificar se já existe usuário com este email
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

  console.log('\n✅ Usuário admin criado com sucesso!');
  console.log(`   ID: ${user.idUsuario}`);
  console.log(`   Nome: ${user.nome}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Admin: Sim\n`);

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgnvfdjxbnhmmfqsetkm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ocxhJIpHphIFrkK5_hnQxw_-vxiq7I_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_PASSWORD = 'Teste123456!';

const qaAccounts = [
  {
    email: 'cliente.teste@servicosja.com',
    password: TEST_PASSWORD,
    name: 'Cliente Teste',
    role: 'client',
    persona: 'client',
  },
  {
    email: 'prestador.teste@servicosja.com',
    password: TEST_PASSWORD,
    name: 'Prestador Teste — Serviços Já',
    role: 'provider',
    persona: 'provider',
  },
  {
    email: 'admin.teste@servicosja.com',
    password: TEST_PASSWORD,
    name: 'Administrador Teste — QA',
    role: 'admin',
    persona: 'admin',
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  console.log('🚀 Iniciando a criação/seed das contas de QA no Supabase Auth...\n');

  for (let i = 0; i < qaAccounts.length; i++) {
    const account = qaAccounts[i];
    console.log(`\n[${i + 1}/${qaAccounts.length}] Processando: ${account.email} (${account.persona})...`);

    // First check if account already exists by trying login
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (loginData?.user) {
      console.log(`✅ E-mail ${account.email} já existe e foi autenticado! (User ID: ${loginData.user.id})`);
      continue;
    }

    // Otherwise signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          name: account.name,
          role: account.role,
        },
      },
    });

    if (authError) {
      console.error(`❌ Erro no signup de ${account.email}:`, authError.message);
    } else if (authData.user) {
      console.log(`✅ Conta criada com sucesso para ${account.email}! (User ID: ${authData.user.id})`);
      console.log('⏳ Aguardando 65 segundos para respeitar o rate limit do Supabase Auth...');
      await sleep(65000);
    }
  }

  console.log('\n🎉 Seed das contas de QA finalizado com sucesso!');
  process.exit(0);
}

seed();

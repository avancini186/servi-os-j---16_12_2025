import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pgnvfdjxbnhmmfqsetkm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não foi encontrada.');
  console.error('👉 Por favor, defina a chave localmente antes de executar a redefinição de senhas:');
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role"');
  console.error('   npm run qa:reset-passwords\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Official QA Personas Config
const OFFICIAL_QA_EMAILS = [
  'cliente.teste@servicosja.com',
  'prestador.teste@servicosja.com',
  'admin.teste@servicosja.com',
];

const qaPasswords = {
  'cliente.teste@servicosja.com': process.env.QA_CLIENT_PASSWORD || process.env.QA_TEST_PASSWORD || 'ClienteSenha123!',
  'prestador.teste@servicosja.com': process.env.QA_PROVIDER_PASSWORD || process.env.QA_TEST_PASSWORD || 'PrestadorSenha123!',
  'admin.teste@servicosja.com': process.env.QA_ADMIN_PASSWORD || process.env.QA_TEST_PASSWORD || 'AdminSenha123!',
};

async function resetQaPasswords() {
  console.log('🚀 Iniciando redefinição segura de senhas das personas de QA (P15.3)...');
  console.log(`📌 Supabase URL: ${SUPABASE_URL}\n`);

  // Fetch users list via Admin API
  const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌ Erro ao listar usuários no Supabase Auth:', listErr.message);
    process.exit(1);
  }

  for (const email of OFFICIAL_QA_EMAILS) {
    console.log(`🔒 Processando redefinição de senha para: ${email}...`);

    // Safety Check #1: Ensure email is strictly in official QA list
    if (!OFFICIAL_QA_EMAILS.includes(email)) {
      console.error(`❌ ERROR: usuário ${email} não pertence às personas oficiais de QA. Nenhuma alteração realizada.`);
      continue;
    }

    const authUser = usersList.users.find((u) => u.email === email);
    if (!authUser) {
      console.warn(`⚠️  Usuário ${email} ainda não existe no Supabase Auth. Execute "npm run qa:setup" primeiro.`);
      continue;
    }

    // Safety Check #2: Verify user exists in qa_test_accounts table
    const { data: qaReg } = await supabase
      .from('qa_test_accounts')
      .select('id, persona')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (!qaReg) {
      console.error(`❌ ERROR: Usuário ${email} (ID: ${authUser.id}) não está registrado na tabela qa_test_accounts. Operação abortada por segurança.`);
      continue;
    }

    const targetPassword = qaPasswords[email];
    if (!targetPassword) {
      console.error(`❌ Nenhuma senha definida para ${email}. Defina QA_CLIENT_PASSWORD, QA_PROVIDER_PASSWORD ou QA_ADMIN_PASSWORD.`);
      continue;
    }

    // Reset password via Admin API
    const { data: updatedUser, error: updateErr } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: targetPassword }
    );

    if (updateErr) {
      console.error(`❌ Erro ao atualizar senha no Supabase Auth para ${email}:`, updateErr.message);
    } else {
      console.log(`✅ Senha redefinida com SUCESSO para ${email} (Persona: ${qaReg.persona}).`);
      console.log(`   (Role, perfil, portfólio e histórico mantidos intactos)`);
    }
  }

  console.log('\n🎉 Procedimento de redefinição de senhas de QA finalizado!');
  process.exit(0);
}

resetQaPasswords();

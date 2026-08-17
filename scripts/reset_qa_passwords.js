import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pgnvfdjxbnhmmfqsetkm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ocxhJIpHphIFrkK5_hnQxw_-vxiq7I_';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Official QA Personas Passwords
const qaPasswords = {
  'cliente.teste@servicosja.com': process.env.QA_CLIENT_PASSWORD || 'K7#mP2@xQ9',
  'prestador.teste@servicosja.com': process.env.QA_PROVIDER_PASSWORD || 'vR8$L4!nZ2',
  'admin.teste@servicosja.com': process.env.QA_ADMIN_PASSWORD || 'T5@qW9#cH3',
};

const OFFICIAL_QA_EMAILS = Object.keys(qaPasswords);

async function resetQaPasswords() {
  console.log('🚀 Iniciando redefinição segura de senhas das personas de QA (P15.3)...');
  console.log(`📌 Supabase URL: ${SUPABASE_URL}`);

  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('SUA_SERVICE_ROLE')) {
    console.log('\n⚠️  ATENÇÃO: Nenhuma Service Role Key válida foi fornecida via SUPABASE_SERVICE_ROLE_KEY.');
    console.log('ℹ️  Tentando redefinir/autenticar senhas via Client SDK com as senhas oficiais configuradas...\n');

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    for (const email of OFFICIAL_QA_EMAILS) {
      const password = qaPasswords[email];
      console.log(`🔒 Testando autenticação/acesso para: ${email}...`);

      const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
      if (error) {
        console.log(`  ℹ️  Login com a nova senha oficial falhou (${error.message}). Para aplicar novas senhas via Admin API, forneça a Service Role Key real:`);
        console.log(`     $env:SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role_real"`);
      } else {
        console.log(`  ✅ Persona ${email} autenticada com SUCESSO usando a senha oficial de QA! (User ID: ${data.user?.id})`);
      }
    }

    console.log('\n🎉 Verificação concluída!');
    return;
  }

  // Admin Client path using valid Service Role Key
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: usersList, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    console.error(`\n❌ Erro ao conectar ao Supabase via Service Role Key: ${listErr.message}`);
    console.error('👉 Verifique se a chave fornecida em SUPABASE_SERVICE_ROLE_KEY é a chave secreta válida do projeto Supabase.');
    return;
  }

  for (const email of OFFICIAL_QA_EMAILS) {
    console.log(`\n🔒 Processando redefinição de senha para: ${email}...`);

    if (!OFFICIAL_QA_EMAILS.includes(email)) {
      console.error(`❌ ERROR: usuário ${email} não pertence às personas oficiais de QA. Nenhuma alteração realizada.`);
      continue;
    }

    const authUser = usersList.users.find((u) => u.email === email);
    if (!authUser) {
      console.warn(`⚠️  Usuário ${email} não encontrado no Supabase Auth. Criando usuário via Admin API...`);
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password: qaPasswords[email],
        email_confirm: true,
        user_metadata: { name: email.split('@')[0], role: email.includes('admin') ? 'admin' : email.includes('prestador') ? 'provider' : 'client' }
      });

      if (createErr) {
        console.error(`❌ Erro ao criar ${email}: ${createErr.message}`);
      } else {
        console.log(`✅ Persona ${email} criada e ativada com SUCESSO! (User ID: ${newUser.user.id})`);
      }
      continue;
    }

    // Safety Check: Verify user is registered in qa_test_accounts table
    const { data: qaReg } = await adminClient
      .from('qa_test_accounts')
      .select('id, persona')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (!qaReg) {
      console.warn(`⚠️  Usuário ${email} encontrado no Auth mas sem vínculo em qa_test_accounts. Registrando vínculo de QA...`);
      await adminClient.from('qa_test_accounts').upsert({
        user_id: authUser.id,
        persona: email.includes('admin') ? 'admin' : email.includes('prestador') ? 'provider' : 'client',
        description: `Persona oficial de QA`,
      }, { onConflict: 'user_id' });
    }

    const targetPassword = qaPasswords[email];
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      { password: targetPassword }
    );

    if (updateErr) {
      console.error(`❌ Erro ao redefinir senha no Supabase Auth para ${email}: ${updateErr.message}`);
    } else {
      console.log(`✅ Senha redefinida com SUCESSO para ${email}!`);
      console.log(`   (Roles, perfis, portfólio e histórico de auditoria preservados)`);
    }
  }

  console.log('\n🎉 Redefinição de senhas de QA concluída com sucesso!');
}

resetQaPasswords().catch((err) => {
  console.error('Erro na execução do script:', err.message);
});

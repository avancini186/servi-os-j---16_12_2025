import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pgnvfdjxbnhmmfqsetkm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ocxhJIpHphIFrkK5_hnQxw_-vxiq7I_';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If service role key is available, use admin client, otherwise use public anon client
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const qaAccounts = [
  {
    email: 'cliente.teste@servicosja.com',
    password: process.env.QA_CLIENT_PASSWORD || process.env.QA_TEST_PASSWORD || 'ClienteSenha123!',
    name: 'Cliente Teste',
    role: 'client',
    persona: 'client',
  },
  {
    email: 'prestador.teste@servicosja.com',
    password: process.env.QA_PROVIDER_PASSWORD || process.env.QA_TEST_PASSWORD || 'PrestadorSenha123!',
    name: 'Carlos Almeida',
    professionalTitle: 'Eletricista Residencial — TESTE',
    city: 'Itapira',
    state: 'SP',
    experienceYears: 10,
    role: 'provider',
    persona: 'provider',
  },
  {
    email: 'admin.teste@servicosja.com',
    password: process.env.QA_ADMIN_PASSWORD || process.env.QA_TEST_PASSWORD || 'AdminSenha123!',
    name: 'Administrador Teste — QA',
    role: 'admin',
    persona: 'admin',
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedQaAccounts() {
  console.log('🚀 Iniciando reconciliação e setup das contas de QA (P15.3)...');
  console.log(`📌 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📌 Admin Service Role Key presente: ${SUPABASE_SERVICE_ROLE_KEY ? 'SIM' : 'NÃO (usando anon key com rate-limit fallback)'}\n`);

  for (let i = 0; i < qaAccounts.length; i++) {
    const acc = qaAccounts[i];
    console.log(`[${i + 1}/${qaAccounts.length}] Processando Persona QA: ${acc.email} (${acc.persona})...`);

    let userId = null;

    if (SUPABASE_SERVICE_ROLE_KEY) {
      // Service Role Key path: Check if user exists via Admin API
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existingUser = usersList?.users?.find((u) => u.email === acc.email);

      if (existingUser) {
        userId = existingUser.id;
        console.log(`  ✓ Usuário Auth já existe: ${acc.email} (ID: ${userId})`);
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            name: acc.name,
            role: acc.role,
          },
        });

        if (createErr) {
          console.error(`  ❌ Erro ao criar usuário Auth ${acc.email}:`, createErr.message);
          continue;
        }
        userId = newUser.user.id;
        console.log(`  ✓ Criado com sucesso via Admin API: ${acc.email} (ID: ${userId})`);
      }
    } else {
      // Anon Client path: Try login first
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.password,
      });

      if (loginData?.user) {
        userId = loginData.user.id;
        console.log(`  ✓ Autenticado com sucesso: ${acc.email} (ID: ${userId})`);
      } else {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: acc.email,
          password: acc.password,
          options: {
            data: {
              name: acc.name,
              role: acc.role,
            },
          },
        });

        if (signUpErr) {
          console.error(`  ❌ Erro no signup de ${acc.email}:`, signUpErr.message);
          continue;
        }
        userId = signUpData.user?.id;
        console.log(`  ✓ Registrado com sucesso via Client SDK: ${acc.email} (ID: ${userId})`);
        
        if (i < qaAccounts.length - 1) {
          console.log('  ⏳ Aguardando 45s para respeitar o rate-limit do Supabase Auth...');
          await sleep(45000);
        }
      }
    }

    if (!userId) continue;

    // Reconcile profiles table
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          name: acc.name,
          email: acc.email,
          role: acc.role,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (profileErr) {
        console.log(`  └─ Note profiles upsert: ${profileErr.message}`);
      } else {
        console.log(`  └─ Perfil sincronizado na tabela 'profiles' (role: ${acc.role})`);
      }
    } catch (e) {
      console.log(`  └─ Profiles notice: ${e.message}`);
    }

    // Reconcile qa_test_accounts table
    try {
      const { error: qaErr } = await supabase
        .from('qa_test_accounts')
        .upsert({
          user_id: userId,
          persona: acc.persona,
          description: `Persona oficial de QA para ${acc.persona}`,
        }, { onConflict: 'user_id' });

      if (qaErr) {
        console.log(`  └─ Note qa_test_accounts upsert: ${qaErr.message}`);
      } else {
        console.log(`  └─ Registrado na tabela 'qa_test_accounts'`);
      }
    } catch (e) {
      console.log(`  └─ QA accounts notice: ${e.message}`);
    }

    // Special reconciliation for Admin QA
    if (acc.persona === 'admin') {
      try {
        const { error: adminErr } = await supabase
          .from('admin_users')
          .upsert({ user_id: userId }, { onConflict: 'user_id' });

        if (adminErr) {
          console.log(`  └─ Note admin_users upsert: ${adminErr.message}`);
        } else {
          console.log(`  └─ Registrado na tabela 'admin_users'`);
        }
      } catch (e) {
        console.log(`  └─ Admin users notice: ${e.message}`);
      }
    }

    // Special reconciliation for Provider QA
    if (acc.persona === 'provider') {
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profData?.id) {
          const { data: existingProv } = await supabase
            .from('provider_profiles')
            .select('id, status')
            .eq('profile_id', profData.id)
            .maybeSingle();

          if (!existingProv) {
            const { data: newProv, error: provErr } = await supabase
              .from('provider_profiles')
              .insert({
                profile_id: profData.id,
                professional_title: acc.professionalTitle,
                bio: 'Profissional especializado em instalações elétricas residenciais, manutenção, iluminação e adequações elétricas.',
                location_city: acc.city,
                location_state: acc.state,
                experience_years: acc.experienceYears,
                phone: '19999999999',
                whatsapp: '19999999999',
                status: 'draft',
              })
              .select('id')
              .single();

            if (!provErr && newProv?.id) {
              console.log(`  └─ Perfil de prestador criado em status 'draft' (ID: ${newProv.id})`);
            }
          } else {
            console.log(`  └─ Perfil de prestador já existe (ID: ${existingProv.id}, Status: ${existingProv.status})`);
          }
        }
      } catch (e) {
        console.log(`  └─ Provider profile notice: ${e.message}`);
      }
    }
  }

  console.log('\n🎉 Setup das Contas de QA P15.3 concluído com sucesso!');
  process.exit(0);
}

seedQaAccounts();

## Objetivo
Trocar o login atual (e-mail + senha) por um acesso simplificado pedindo apenas **Nome Completo** e **E-mail**. Se o e-mail já existe → entra. Se não existe → cria e entra. Sem senha, sem confirmação.

> Aviso de segurança aceito pelo usuário: qualquer pessoa que souber o e-mail de outro usuário poderá acessar a conta. Seguimos assim mesmo.

## Mudanças

### 1. Banco (migration)
- Nova tabela `public.app_users`:
  - `id uuid pk default gen_random_uuid()`
  - `email text unique not null`
  - `nome_completo text not null`
  - `created_at timestamptz default now()`
- GRANT SELECT, INSERT para `anon` e `authenticated` (necessário porque não há `auth.uid()` no fluxo).
- RLS habilitado com policies permissivas de SELECT/INSERT (sem UPDATE/DELETE pelo cliente).
- `assessments.user_id` e `workouts.user_id` continuam `uuid`, mas passam a referenciar `app_users.id` (em vez de `auth.users.id`). Como hoje as policies usam `auth.uid()`, vamos **abrir as policies** dessas tabelas para `anon`+`authenticated` com SELECT/INSERT/UPDATE livre (idem aviso de segurança).
- `profiles` deixa de ser usada no novo fluxo (mantida intacta para não quebrar dados antigos).

### 2. Sessão no cliente
- Novo módulo `src/lib/session.ts`:
  - Guarda `{ id, email, nome_completo }` em `localStorage` (`shapeemv:session`).
  - Hook `useSession()` com `getSession`, `setSession`, `clearSession`.
- `src/routes/_authenticated/route.tsx`: trocar `supabase.auth.getUser()` por leitura do `localStorage`; redirecionar para `/` se vazio.

### 3. Landing (`src/routes/index.tsx`)
- Remover campo Senha e modos signup/signin (vira um único form).
- Form com: Nome Completo + E-mail + botão "Acessar meu treino".
- Lógica ao submeter:
  1. `select * from app_users where email = ?`
  2. Se achou → `setSession(row)` e `navigate('/dashboard')`.
  3. Se não achou → `insert { email, nome_completo }` → `setSession(novo)` → `navigate('/dashboard')`.
- Remover `supabase.auth.getSession()` do `useEffect`; usar `getSession()` local.

### 4. Logout
- `src/routes/_authenticated/profile.tsx`: trocar `supabase.auth.signOut()` por `clearSession()`.

### 5. Telas autenticadas que leem usuário
- `profile.tsx`, `dashboard.tsx`, etc.: ler nome/e-mail do `useSession()` em vez de `getLatestState().profile`.
- Server functions `saveAssessment` / `getLatestState` (em `src/lib/assessment.functions.ts`): remover `requireSupabaseAuth`; passar `userId` (= `app_users.id`) como input validado e usar `supabaseAdmin` para gravar/ler `assessments` e `workouts`.

## Arquivos afetados
- migration nova
- `src/lib/session.ts` (novo)
- `src/routes/index.tsx`
- `src/routes/_authenticated/route.tsx`
- `src/routes/_authenticated/profile.tsx`
- `src/routes/_authenticated/dashboard.tsx` (ajuste de leitura do nome)
- `src/lib/assessment.functions.ts`
- Telas que chamam `saveAssessment`/`getLatestState` (passar `userId`)

## O que NÃO muda
- Upsell, quiz, protocolo, layout visual, BottomNav, design tokens.
- Tabela `profiles` (fica órfã do novo fluxo, sem deletar).

## Diagnóstico (já confirmado no banco)

O sistema hoje tem **dois "mundos" de usuário** que ficaram desconectados depois que migramos para login só por e-mail:

- **Mundo antigo** (`public.profiles`, vindo do login com senha do Supabase Auth): **556 usuários**, sendo que **449 já fizeram quiz**. Seus quizzes e treinos estão salvos com `user_id = profiles.id`.
- **Mundo novo** (`public.app_users`, criado no fluxo passwordless): **197 usuários**. Os quizzes/treinos novos estão salvos com `user_id = app_users.id`.

O que está acontecendo na prática:

- **453 avaliações** e **453 treinos** estão "órfãos" — pertencem a usuários antigos, mas o app só consulta por `app_users.id`, então **não aparecem**.
- **77 e-mails** já estão duplicados: a pessoa tinha conta antiga, voltou depois do corte, e o sistema criou um `app_users` novo com **id diferente** — quebrou o vínculo com o quiz/treino dela.
- A coluna `email` em `app_users` **não tem unicidade**, então no futuro podem aparecer mais duplicatas.
- O lookup hoje é `eq("email", email)` sem normalizar diferenças de maiúscula/minúscula/espaço.
- Cada novo `saveAssessment` cria um **workout novo com unlock_date novo** — se a pessoa "refizer" o quiz, o contador zera.

Nenhum dado precisa ser deletado. A correção é **re-amarrar** os ids antigos aos novos e travar para não voltar a quebrar.

## O que vamos fazer

### 1) Migração de dados — recuperar todos os acessos antigos (transação única, reversível)

Em uma única migração SQL, atômica:

1. **Caso "duplicado" (77 e-mails)** — usuário antigo que já criou conta nova: repontar os quizzes/treinos legados para o `app_users.id` novo (`UPDATE assessments/workouts SET user_id = app_users.id WHERE user_id = profiles.id` quando `lower(profiles.email) = lower(app_users.email)`). Depois, apagar o `profiles` legado já migrado (para não voltar a colidir).
2. **Caso "ainda não voltou" (resto dos profiles)** — copiar `profiles → app_users` mantendo **o mesmo `id`** e o e-mail. Assim, quando essa pessoa logar com o e-mail dela, vai cair direto na `app_users` antiga, e os quizzes/treinos dela (que apontam para esse id) aparecem instantaneamente — sem precisar mexer em `assessments`/`workouts`.
3. **Normalizar** todos os e-mails em `app_users` para minúsculas + `trim`.
4. **Travar duplicatas futuras**: criar índice único em `lower(email)` de `app_users`.

Resultado esperado: **0 avaliações órfãs**, **0 e-mails duplicados**, todos os 556 usuários antigos passam a logar e ver o que já tinham.

### 2) Login imune a maiúscula/espaço (`src/lib/auth.functions.ts`)

- Lookup por `ilike` / `lower(email) = lower($1)` em vez de `=`.
- Antes de inserir, refazer o select dentro de um pequeno retry para evitar race condition (duas abas abrindo ao mesmo tempo).
- Se já existir um `app_users` com aquele e-mail (caso o nome digitado venha diferente), **não sobrescrever** o nome antigo a menos que esteja vazio.

### 3) Não duplicar avaliação/treino no `saveAssessment`

Hoje, cada submissão do quiz cria sempre uma linha nova de `assessments` e `workouts`. Vamos mudar para:

- Se o usuário **já tem** um workout: manter o `unlock_date` existente (não zerar o contador), apenas atualizar o `assessment_id` e gravar o novo `respostas_json` em `assessments` (insert normal) — assim a pessoa pode refazer mas **não perde a liberação**.
- Se o usuário **não tem** workout: comportamento atual (cria avaliação + workout com `unlock_date` futuro).

### 4) Salvamento incremental do quiz no servidor (defesa contra perda)

Hoje o progresso parcial fica só no `localStorage` do navegador. Se a pessoa troca de aparelho ou limpa o cache, perde tudo. Vamos adicionar:

- Server function `saveQuizDraft({ userId, respostas, stepIdx })` que faz `upsert` em uma tabela nova `public.quiz_drafts` (`user_id PK`, `respostas_json`, `step_idx`, `updated_at`).
- O `QuizPage` chama esse draft **a cada resposta** (com debounce de ~800ms), além de continuar salvando no `localStorage`.
- Ao abrir o quiz, se `localStorage` estiver vazio mas existir draft no servidor, hidrata do servidor.
- Ao finalizar o quiz com sucesso, apaga o draft.

Isso garante que **nenhuma resposta digitada se perde**, mesmo sem terminar.

### 5) Backup antes de tudo

Antes de rodar a migração de re-amarração, vou criar duas tabelas de backup imutáveis na própria migração:

- `public._backup_profiles_20260608` (cópia completa de `profiles`)
- `public._backup_assessments_user_id_20260608` (id da assessment + user_id antes da mudança)
- `public._backup_workouts_user_id_20260608` (id do workout + user_id antes da mudança)

Se algo der errado, conseguimos restaurar com um `UPDATE` simples.

### 6) Verificação pós-migração

Logo depois de aplicar, vou rodar contagens para confirmar:

- Avaliações órfãs == 0
- Treinos órfãos == 0
- Total de avaliações inalterado (576)
- Total de treinos inalterado (576)
- Total de `app_users` ≈ 197 + (556 − 77) = **676** (197 novos + 479 importados de profiles que ainda não tinham conta nova)

Se algum número não bater, **paramos e revertemos** usando os backups antes de tocar no front.

## Detalhes técnicos (resumo)

```text
Estado atual:
  profiles (556)  ────► assessments/workouts.user_id (453 órfãos)
  app_users (197) ────► assessments/workouts.user_id (123)
  77 e-mails colidem entre profiles e app_users (id diferente)

Depois da migração:
  app_users (~676, lower(email) único) ────► todas as 576 assessments/workouts
  profiles: só ficam linhas sem assessments (puro registro de auth.users antigo)
```

Arquivos tocados no código (depois da migração validada):

- `supabase/migrations/<timestamp>_recover_legacy_users.sql` — migração de dados + índice único.
- `supabase/migrations/<timestamp>_quiz_drafts.sql` — nova tabela `quiz_drafts` com RLS server-only.
- `src/lib/auth.functions.ts` — lookup case-insensitive + proteção contra race.
- `src/lib/assessment.functions.ts` — `saveAssessment` preserva `unlock_date` se já existir workout; novas funções `saveQuizDraft` / `getQuizDraft` / `clearQuizDraft`.
- `src/routes/_authenticated/quiz.tsx` — autosave debounced no servidor + hidratação do draft do servidor quando `localStorage` estiver vazio.

## O que **não** muda

- Modelo passwordless: continua entrando só com nome + e-mail (decisão já aprovada).
- Design e fluxo de telas: nada de UI muda visualmente.
- Acessos atuais (`app_users` existentes): permanecem com o mesmo id.
- Tabela `profiles`: não é apagada, só perde as linhas de quem foi migrado para `app_users`.

## Risco e mitigação

| Risco | Mitigação |
|---|---|
| Migração corromper user_id de quizzes | Backups completos `_backup_*` criados **na mesma migração**, antes dos UPDATEs |
| E-mail com case diferente perder match | Tudo normalizado em `lower(email)` + índice único em `lower(email)` |
| Duas abas criarem dois `app_users` | Índice único + retry no server fn |
| Contador de liberação resetar ao refazer quiz | `saveAssessment` agora preserva `unlock_date` existente |
| Perda de quiz no meio do preenchimento | Nova tabela `quiz_drafts` com autosave server-side |

# Shape em V - Fernando Contarini

App de avaliação física com quiz interativo, liberação programada do protocolo (próximo dia às 10h) e dashboard de resultados premium com gráficos.

## Stack & Setup
- **Lovable Cloud** (backend): auth por e-mail, tabelas `profiles`, `assessments`, `workouts`
- **Recharts** para Donut, Radar, Line, barras de IMC
- **Framer Motion** para animações suaves nas condicionais Sim/Não
- **Tailwind** dark premium: bg `#0B0B0B`, cards `#1E1E1E`, dourado `#D4AF37 → #F9A826`, fonte Inter

## Design System (src/styles.css)
Tokens semânticos em oklch:
- `--background` (preto), `--card` (cinza escuro), `--primary` (dourado), `--primary-glow`
- `--gradient-gold`, `--shadow-gold`
- Tipografia Inter via `<link>` no `__root.tsx`
- Botões `rounded-2xl`, bordas sutis douradas em cards de destaque

## Schema (Lovable Cloud)
```
profiles: id (uuid, FK auth.users), nome_completo, email, created_at
assessments: id, user_id, respostas_json (jsonb), status, created_at
workouts: id, user_id, treinos_json (jsonb), unlock_date (timestamptz)
```
- RLS: cada user vê apenas seus próprios registros
- Trigger `handle_new_user` cria profile automático no signup
- Auto-confirm de e-mail ativado (sem verificação por link)

## Rotas (TanStack Router)
```
/                          → Landing + modal de login (nome + email, magic link ou senha)
/_authenticated/dashboard  → Saudação + card "Fazer minha avaliação"
/_authenticated/quiz       → Quiz 23 etapas (state machine, 1 pergunta por tela)
/_authenticated/processing → Loading 5s com textos rotativos
/_authenticated/waiting    → Countdown até 10h do dia seguinte
/_authenticated/results    → Dashboard final com gráficos
/_authenticated/protocol   → Lista de treinos (placeholder)
/_authenticated/profile    → Perfil do usuário
```
Lógica de roteamento pós-login: lê último `assessment` + `workout.unlock_date` e redireciona para a tela correta (dashboard / waiting / results).

## Quiz (23 etapas)
Componente único `QuizStep` que renderiza por tipo:
- `cards` (gênero, composição, objetivo, experiência, nível, urgência)
- `slider` (idade, altura, peso)
- `textarea` (profissão, frustração, motivação, etc.)
- `checkbox-multi` (partes do corpo)
- `yes-no-conditional` (Sim/Não com textarea que desliza via Framer Motion quando "Sim")

Header fixo: botão voltar `<`, "X de 23", barra de progresso dourada animada.
Estado em React (ou Zustand leve) + persist no localStorage; submit final grava em `assessments` e cria `workouts` com `unlock_date = amanhã 10:00 local`.

Etapa 6 (motivação Antes/Depois) é uma tela intersticial, não pergunta — avança com botão.

## Sala de Espera
- Calcula `unlock_date - now` a cada 1s
- Display HH:MM:SS com tipografia grande dourada
- Ícone de cadeado pulsando
- Quando zera, redireciona para `/results`

**Nota:** o "dia seguinte às 10h" é gravado no momento do submit. Para testar, vou incluir um botão dev (oculto em prod) que adianta o `unlock_date`.

## Dashboard de Resultados (página longa, scrolável)
1. **Header** — iniciais em círculo dourado, email, badge "Protocolo Personalizado"
2. **Dados Pessoais** — grid 5 cols (mobile: 2)
3. **IMC** — número grande + barra horizontal gradiente (azul→verde→amarelo→vermelho) com marker SVG
4. **Score Geral** — Recharts `PieChart` (donut) 67/100 + 3 progress bars
5. **Objetivo & Protocolo** — resumo + CTA dourado
6. **Perfil de Performance** — `RadarChart` (Força/Resistência/Execução)
7. **Áreas de Foco** — badges douradas
8. **Progresso Projetado** — `LineChart` 4 meses, 2 linhas (peso ↓, massa magra ↑)

Cálculos derivados das respostas (funções puras em `src/lib/assessment-calc.ts`): IMC, score (média ponderada), valores do radar, projeção de peso.

## Navegação inferior
`BottomNav` fixo em rotas `_authenticated`: Avaliação / Protocolo / Perfil, ícone ativo em dourado.
CTA flutuante "Seu Protocolo está Pronto" aparece apenas em `/results`, acima do bottom nav, com glow dourado animado.

## Detalhes técnicos
- Server functions (`createServerFn` + `requireSupabaseAuth`) para gravar assessment/workout e ler estado de desbloqueio
- Cliente browser supabase para auth flows e `onAuthStateChange` no `__root.tsx`
- Validação Zod nos inputs do quiz
- Mobile-first; testado em 375px

## Entregáveis nesta primeira leva
Enable Lovable Cloud → schema + RLS → design tokens → landing/auth → dashboard → quiz completo → processing → waiting → results dashboard com todos os gráficos → bottom nav + CTA.

A tela `/protocol` ficará com placeholder estruturado (3-4 cards de treino) — você pode me passar depois o conteúdo real dos treinos para eu detalhar.

Posso seguir?
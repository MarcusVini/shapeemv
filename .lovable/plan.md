## 1. Nova barra inferior (5 itens)

Ordem da esquerda para a direita:

1. **Início** — `/dashboard` (a nova home com os 3 cards)
2. **Avaliação** — `/results` (tela completa de resultados, gráficos, IMC etc.)
3. **Protocolo** — `/protocol` (treino)
4. **Suporte** — WhatsApp (mantém igual)
5. **Perfil** — `/profile`

Estados de bloqueio (mantém regra atual):
- Sem avaliação respondida → **Avaliação** e **Protocolo** ficam com ícone de cadeado. Ao tocar, mostra toast "Responda primeiro sua avaliação física…" e leva para `/dashboard`.
- Avaliação respondida mas antes da liberação → cadeado nos dois e ao tocar vai para a tela de espera com o cronômetro.
- Depois da liberação → ambos liberados.

## 2. Home (`/dashboard`) redesenhada

Cabeçalho:
- "Olá, **{primeiro_nome}** 👋"
- Subtítulo: "Bem-vindo ao **Shape em V**" (mantém branding)
- Botão de sair no canto (igual hoje)

Conteúdo muda conforme o estado:

**(a) Ainda não fez a avaliação** — mantém o card atual "Faça sua avaliação física" + estatísticas (23 perguntas / ~5 min). Cards de Avaliação Trinca e Protocolo aparecem visíveis porém **bloqueados** (cadeado + "Disponível após sua avaliação"), sem ação ao clicar (ou com toast informativo).

**(b) Já respondeu, antes da liberação (timer rodando)** — 3 cards, todos com cadeado:
- "Sua Avaliação Trinca" — ícone de check, descrição "Confira a sua avaliação física completa". Bloqueado.
- "Seu Protocolo está Pronto" — ícone de halter. Bloqueado.
- Card grande de countdown "Liberação em HH:MM:SS" (mesmo bloco que já existe hoje).
- "Compartilhe sua Jornada" (sempre visível, ver item c).

**(c) Liberado** — 3 cards ativos, layout da imagem 1:
- **Sua Avaliação Trinca** → navega para `/results`. Ícone check, copy "Confira a sua avaliação física completa."
- **Seu Protocolo está Pronto** → navega para `/protocol`. Ícone halter, copy "Acesse seu treino personalizado."
- **Compartilhe sua Jornada** — bloco maior, ícone raio. Texto:
  > "Agora você faz parte de um grupo de pessoas diferenciadas… Que estão construindo a melhor versão de si mesmas.
  > A sua evolução merece ser vista! Inspire pessoas e fortaleça o nosso movimento!"
  > 
  > Sub-bloco dourado: **"Poste stories do seu treino marcando @shapeemv"** — "Vou gostar de ver, vou repostar e você ainda ganhará seguidores! ⚡"

Rodapé do conteúdo (acima da bottom nav): "© Todos os direitos reservados · Shape em V" e link "sair da conta".

Observação: o handle `@shapeemv` é uma suposição. Se for outro (ex.: `@fernandocantarelli`), me diga e troco em 1 linha.

## 3. Tela "Avaliação" completa (`/results`)

Hoje a tela já tem: Dados pessoais, IMC, Score geral, Objetivo, Perfil de performance (radar), Áreas de foco e Progresso físico projetado. Vou **adicionar as seções que faltam** para bater com a imagem 2:

1. **Indicadores de estilo de vida** — gráfico de barras verticais (Treino, Técnica, Composição) usando os scores já calculados.
2. **Mentalidade** — bloco de texto puxando as respostas do quiz:
   - "O que te motiva a mudar" → resposta do campo motivação
   - "Seu Sonho" → resposta do campo sonho
3. **Seu progresso — Bem-estar** — gráfico de linha com 3 séries projetadas em 28 dias: **Testosterona +40%**, **Autoestima +80%**, **Saúde geral +65%** (mesmo padrão de cálculo do progresso físico, só que para indicadores subjetivos).
4. Ajuste o gráfico físico atual para o eixo X "Hoje / Dia 7 / Dia 14 / Dia 21 / Dia 28" e labels da legenda "Ganho muscular / Queima de gordura / Disposição" (matching a imagem).
5. Manter o CTA flutuante "Seu protocolo está pronto" no final (já existe).

A entrada nessa tela passa a ser tanto pelo card "Sua Avaliação Trinca" da home quanto pelo item **Avaliação** do menu inferior.

## Detalhes técnicos (referência interna)

- `src/components/BottomNav.tsx`: adicionar item **Início** apontando para `/dashboard`, mudar **Avaliação** para `/results` (com lógica de cadeado idêntica à do Protocolo: travada até `workout.unlock_date`).
- `src/routes/_authenticated/dashboard.tsx`: refatorar para o novo hub com 3 cards + bloco "Compartilhe sua Jornada" + rodapé. Reaproveitar lógica de `useQuery(state)` e timer já existentes.
- `src/routes/_authenticated/results.tsx`: adicionar seções "Indicadores de estilo de vida" (BarChart recharts), "Mentalidade" (texto puro com respostas), "Seu progresso — Bem-estar" (LineChart 28 dias). Ajustar eixo do gráfico físico para 28 dias.
- `src/lib/assessment-calc.ts`: adicionar `projectWellbeing(...)` retornando série de 5 pontos para testosterona/autoestima/saúde.
- Cards bloqueados: componente reutilizável `LockedCard` com overlay escuro + ícone de cadeado e copy "Disponível em HH:MM:SS".

Sem mudanças de banco/SQL.

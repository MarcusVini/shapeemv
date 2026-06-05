# Plano — Tela de Espera + Área do Aluno (Protocolo)

## 1. Tela de Espera (`src/routes/_authenticated/waiting.tsx`)
Refinar a tela existente com os textos exatos pedidos:
- Ícone de cadeado dourado gigante centralizado (manter animação flutuante).
- Título: **"Avaliação Recebida com Sucesso!"**
- Subtítulo: *"Nossa inteligência artificial e a metodologia de Fernando Cantarelli estão analisando as suas respostas. Seu Protocolo Shape em V será liberado amanhã, exatamente às 10:00 da manhã."*
- Aviso: *"Salve o link deste site. Um cronômetro abaixo mostra o tempo exato para a sua liberação:"*
- Manter countdown HH:MM:SS em cards dourados + auto-redirect ao zerar (já implementado).
- Manter botão dev "(dev) Liberar agora".

## 2. Protocolo — Estrutura com Abas (`src/routes/_authenticated/protocol.tsx`)
Reescrever totalmente a página. Layout:
- `BottomNav` fixo no rodapé (já tem ícone "Protocolo" ativo dourado).
- Cabeçalho: título **"Protocolo"** + nome do usuário.
- **Tabs horizontais roláveis** (scroll-x no mobile) com 4 abas:
  `[ Instruções ] [ Treino 1 ] [ Treino 2 ] [ Treino 3 ]`
  - Ativa: fundo dourado (`gold-gradient`), texto preto, bold.
  - Inativa: fundo `#1E1E1E`, texto branco.
  - Implementado com `useState` + botões (sem Radix Tabs para customização total e scroll horizontal nativo).

## 3. Aba "Instruções" — Carta de Boas-vindas
Componente `<InstrucoesTab />` renderizando seções verticais escroláveis:

**a) Capa de destaque**
- Imagem gerada via `imagegen` (homem atlético, físico em V, iluminação cinematográfica dourada) — `src/assets/welcome-cover.jpg`.
- Overlay escuro + texto "SHAPE EM V" sobreposto em tipografia black dourada.

**b) Títulos**
- H1: "SEJA BEM-VINDO AO SEU PROTOCOLO PERSONALIZADO SHAPE EM V"
- Autor: "FERNANDO CANTARELLI (@fernandocantarelli_)" — dourado.
- Saudação: "Fala mestre, seja muito bem-vindo ao seu Protocolo Personalizado do Shape em V."

**c) Blocos de texto** (cards `bg-card` `#1E1E1E`, borda sutil, título dourado, parágrafo cinza claro):
- Quem sou eu
- Parabéns por estar aqui
- O método exclusivo
- Por que o Shape em V funciona

**d) Card destaque "🔥 No Shape em V é outro jogo!"**
- Fundo preto, borda dourada brilhante (`gold-border` + `shadow-gold`), ícone 🔥.

**e) Bloco "Instruções"** — parágrafo introdutório.

**f) Card "Como Treinar"** — lista com 8 itens (Frequência, Repouso, Aquecimento, Execução, Progressão, Descanso, Alimentação, Consistência). Cada item com label em **dourado bold** seguido do texto.

## 4. Abas "Treino 1, 2, 3"
Componente `<TreinoTab treino={...} />` recebendo dados de um mock.

**Mock** (novo arquivo `src/lib/protocol-data.ts`):
```ts
export const TREINOS = [
  { id: 1, nome: "Treino 1", foco: "Peito e Tríceps",
    exercicios: [
      { nome: "Aquecimento — Esteira", subtitulo: "Preparação cardiovascular", series: 1, reps: "5 min", descanso: "—" },
      { nome: "Supino Reto com Barra", subtitulo: "Foco no peitoral médio", series: 4, reps: "10 a 12", descanso: "60s" },
      { nome: "Supino Inclinado com Halteres", subtitulo: "Peitoral superior", series: 4, reps: "10 a 12", descanso: "60s" },
      { nome: "Crucifixo", subtitulo: "Isolamento do peitoral", series: 3, reps: "12 a 15", descanso: "45s" },
      { nome: "Tríceps Pulley", subtitulo: "Cabeça lateral do tríceps", series: 4, reps: "12", descanso: "45s" },
      { nome: "Tríceps Francês", subtitulo: "Alongamento do tríceps", series: 3, reps: "10 a 12", descanso: "60s" },
    ]},
  { id: 2, nome: "Treino 2", foco: "Costas e Bíceps (A base do V)",
    exercicios: [ Aquecimento, Puxada Frontal, Remada Curvada, Pulldown, Remada Baixa, Rosca Direta, Rosca Martelo ] },
  { id: 3, nome: "Treino 3", foco: "Pernas e Ombros (Alargamento de deltoides)",
    exercicios: [ Aquecimento, Agachamento Livre, Leg Press, Cadeira Extensora, Elevação Lateral, Desenvolvimento com Halteres, Elevação Frontal ] },
];
```

**Card de Exercício**:
- Fundo `#18181B`, `rounded-2xl`, padding generoso.
- Header: círculo dourado com nº do exercício + nome (bold branco) + subtítulo (cinza pequeno).
- Mídia: `<div>` placeholder com `aspect-video`, `object-cover`, cantos arredondados, gradiente escuro + ícone `Dumbbell` central (sem chamar imagegen para evitar custo — placeholder elegante).
- 3 badges horizontais centralizadas: `Séries: X` | `Reps: Y` | `Descanso: Z` (fundo escuro, borda sutil cinza).
- Botão outlined dourado na base: "Adicionar Carga ⚖️" (sem ação funcional ainda — apenas UI, conforme escopo).

## 5. Detalhes técnicos
- Reusar tokens existentes: `gold-gradient`, `gold-border`, `shadow-gold`, `text-gold-gradient`, `shadow-card-premium`.
- Mobile-first: max-width `md`, padding `px-6`, scroll horizontal nas tabs com `overflow-x-auto scrollbar-none`.
- Framer Motion: fade-in suave ao trocar de aba (`AnimatePresence` + `motion.div` keyed pela aba).
- `imagegen` (standard quality) para a capa de boas-vindas — único asset novo.
- Sem mudanças em banco/server functions — toda a entrega é UI estática + mock.

## Arquivos
- `src/routes/_authenticated/waiting.tsx` — editar textos.
- `src/routes/_authenticated/protocol.tsx` — reescrever com tabs.
- `src/lib/protocol-data.ts` — **novo**, mock dos 3 treinos.
- `src/assets/welcome-cover.jpg` — **novo**, capa gerada.

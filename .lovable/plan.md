# Etapa "Você não está sozinho" — carrossel + CTA fixo pulsante

## Estrutura nova da tela (ordem vertical)

1. **Carrossel de antes/depois** (topo) — 6 imagens anexadas
2. **Headline** — "Você não está sozinho!"
3. **Texto** — "Mais de 12.000 alunos já transformaram seus corpos com o método Shape em V. A jornada começa agora."
4. **Botão fixo** no rodapé (já existe), com pulse leve

## Passos

### 1. Upload das 6 imagens como Lovable Assets
Subir cada uma via `lovable-assets create` a partir de `/mnt/user-uploads/`:
- `sm-aAiIU-...jpg` → `src/assets/transformacao-1.jpg.asset.json`
- `sm-0F4au-rafael-coltro.jpg` → `transformacao-2`
- `sm-aK3WS-dep-05.jpg` → `transformacao-3`
- `sm-yYkWA-...jpg` → `transformacao-4`
- `sm-DFSK9-...jpg` → `transformacao-5`
- `sm-kBBM0-...jpg` → `transformacao-6`

### 2. Componente do intersticial em `src/routes/_authenticated/quiz.tsx`
Reescrever `<Intersticial />` para suportar conteúdo customizado (carrossel + headline + texto), apenas quando `step.id === "motivacao_intersticial"`. Demais intersticiais mantêm o layout atual.

Layout:
- Carrossel: usar `embla-carousel-react` (já presente via shadcn `components/ui/carousel`) com autoplay leve (`setInterval` 3.5s) e dots dourados abaixo. Cada slide: imagem `aspect-square` com borda dourada sutil `gold-border` e `rounded-2xl`.
- Headline: `text-3xl font-black` (já no `StepView`, então a `question` continua sendo "Você não está sozinho!" e o componente só renderiza carrossel + parágrafo extra).
- Parágrafo: texto curto em `text-muted-foreground`.

### 3. Botão fixo pulsante
O botão "Continuar" já é fixo (footer). Adicionar uma animação de pulse muito sutil:
- Nova classe utilitária `animate-gold-pulse` em `src/styles.css`:
  - escala `1 → 1.02 → 1` em 2.4s, `ease-in-out`, infinito
  - acompanhada de variação leve no `box-shadow` dourado
- Aplicar a classe ao `<Button>` do footer **apenas** quando `step.type === "intersticial"` (mantém estática nas demais etapas para não distrair).

## Arquivos afetados
- `src/assets/transformacao-{1..6}.jpg.asset.json` (novos, 6 arquivos)
- `src/routes/_authenticated/quiz.tsx` (editar `Intersticial` + footer)
- `src/styles.css` (nova keyframe `gold-pulse`)

## Sem mudanças
- Sem alterações de schema, dados do quiz ou lógica de avanço.

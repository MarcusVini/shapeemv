## Nova etapa de Upsell no funil

### Fluxo atualizado
`quiz` → `processing` → **`upsell` (NOVA)** → `waiting` → `dashboard/results`

Hoje `processing.tsx` redireciona automaticamente para `/waiting` após ~6.5s. Vamos trocar esse destino para `/upsell`. A página de upsell não terá auto-redirect: o usuário só sai dela clicando nos botões da Kiwify (que fazem o redirect via `data-upsell-url` / `data-downsell-url`).

### 1. Criar `src/routes/_authenticated/upsell.tsx`

Rota nova autenticada (mantém o gate de login). Mobile-first, `max-w-md`, fundo `#0B0B0B`.

Estrutura visual:
- **Headline**: "Sua avaliação está sendo concluída..." — branco, grande, bold.
- **Sub-headline**: "Enquanto isso, veja o recado importante que o Fernando gravou especialmente pra você 👇" — cinza claro, menor.
- **Container do vídeo Vturb** centralizado, `max-width: 400px`.
- **Container dos botões Kiwify** — renderizado condicionalmente após 128s.

### 2. Injeção do player Vturb

Em `useEffect` (montagem única):
- Renderizar `<vturb-smartplayer id="vid-6a2581818e99006cc2b82f9a" />` no JSX (custom element).
- Criar `<script src="https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a2581818e99006cc2b82f9a/v4/player.js" async>` e `appendChild` em `document.head`.
- Guard de "já injetado" via `document.querySelector` no `src` para evitar duplicar em remounts.
- Cleanup: não remover o script (deixar cacheado).
- Declarar tipagem mínima `vturb-smartplayer` em `JSX.IntrinsicElements` para o TS aceitar.

### 3. Delay de 128s para os botões Kiwify

- `const [showOffer, setShowOffer] = useState(false)`
- `useEffect`: `setTimeout(() => setShowOffer(true), 128000)`; cleanup com `clearTimeout`.
- Enquanto `showOffer === false`, o bloco da Kiwify nem é montado (não fica só escondido com CSS — não monta mesmo, pra evitar render antes da hora).
- Quando `showOffer === true`:
  - Renderiza o `<div id="kiwify-upsell-Vj9idar" ...>` com o botão "Sim, eu aceito…" e o link "Não, eu gostaria de recusar…", traduzindo os `style` inline para objetos React (`backgroundColor`, `borderRadius`, etc.). Os atributos `data-upsell-url` / `data-downsell-url` permanecem iguais.
  - Em outro `useEffect` disparado quando `showOffer` vira `true`, injetar `<script src="https://snippets.kiwify.com/upsell/upsell.min.js">` em `document.body` (também com guard de duplicação). Esse script precisa rodar **depois** que o DOM com `id="kiwify-upsell-Vj9idar"` já existe — por isso só é injetado quando os botões aparecem.
- Animação leve `fade-in` (Framer Motion `motion.div` com `initial={{opacity:0, y:8}}`, `animate={{opacity:1, y:0}}`) quando o bloco aparece.

### 4. Redirecionar `processing` → `/upsell`

Em `src/routes/_authenticated/processing.tsx`, trocar:
```ts
setTimeout(() => navigate({ to: "/waiting", replace: true }), 6500);
```
por:
```ts
setTimeout(() => navigate({ to: "/upsell", replace: true }), 6500);
```

### 5. Persistência em refresh

A página `/upsell` é estática (não depende do progresso do quiz salvo) — se o usuário der refresh, ele continua em `/upsell` normalmente. Como a rota está sob `_authenticated`, o login é exigido. Não é necessário tocar no quiz/state.

Sem auto-redirect para `/waiting`: a saída é exclusivamente via botões Kiwify. Quem chegar em `/upsell` direto pela URL também vê o vídeo (comportamento desejado para evitar reiniciar quiz).

### Arquivos afetados
- **Novo**: `src/routes/_authenticated/upsell.tsx`
- **Editado**: `src/routes/_authenticated/processing.tsx` (1 linha — destino do navigate)
- Auto-gerado pelo plugin: `src/routeTree.gen.ts`

### Notas técnicas
- `dangerouslySetInnerHTML` não é necessário — convertemos o HTML da Kiwify para JSX com `style` objects, o que é mais seguro e mantém os IDs/atributos `data-*` intactos (o script da Kiwify procura por `#kiwify-upsell-Vj9idar`).
- Custom element `<vturb-smartplayer>` funciona no React 19 sem warnings; adicionamos a declaração de tipo para o TS strict não reclamar.
- Scripts externos sempre injetados com guard anti-duplicação para sobreviver a HMR e remounts.

## Alterações na página de upsell (`src/routes/_authenticated/upsell.tsx`)

1. **Trocar o vídeo Vturb** — atualizar `VTURB_SRC` e o `id` do elemento `<vturb-smartplayer>` para o novo player:
   - Script: `.../players/6a280947135e043f2b702184/v4/player.js`
   - Elemento: `id="vid-6a280947135e043f2b702184"`

2. **Ajustar delay do botão de compra** — mudar o `setTimeout` de `128000` ms (2m08s) para `148000` ms (2m28s).

3. **Atualizar link do botão de compra** — trocar o `href` do CTA de `https://pay.kiwify.com.br/Vj9idar` para `https://pay.kiwify.com.br/zByOXHf`.

Nenhuma outra página ou tabela será alterada.
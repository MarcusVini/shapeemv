## Mudança em `src/routes/_authenticated/upsell.tsx`

### Remover
- `KIWIFY_SRC` const
- `useEffect` que injeta o script da Kiwify
- Bloco `<div id="kiwify-upsell-Vj9idar">` (botão + link de recusa atuais)

### Adicionar (dentro do mesmo `motion.div` com fade-in, mantendo o delay de 128s já existente via `showOffer`)
- `<a href="https://pay.kiwify.com.br/Vj9idar">` estilizado como botão verde `#27AF60`, largura 100% até 400px, texto branco bold 20px:  
  **"Sim, eu aceito essa oferta especial!"**
- `<button>` abaixo, usando `useNavigate` do `@tanstack/react-router` para ir a `/dashboard`, estilo cinza `#A1A1AA` sublinhado 16px:  
  **"Não, eu gostaria de recusar essa oferta"**

### Manter intacto
- Player Vturb e injeção do script Vturb
- Delay de 128s (`showOffer`) e animação fade-in
- Layout, headline, sub-headline, background `#0B0B0B`

Resultado: visualmente idêntico ao print, mas sem dependência do script da Kiwify — o botão verde abre o checkout direto e o link de recusa leva pro dashboard.
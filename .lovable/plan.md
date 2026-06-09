Reduzir o tamanho do modal de boas-vindas (`src/components/WelcomeModal.tsx`) para caber inteiro na tela mobile sem rolagem, mantendo o botão "Entendi, vamos começar!" sempre visível.

## Mudanças

**Arquivo:** `src/components/WelcomeModal.tsx`

1. **Container do modal**: adicionar `max-h-[95vh]` e `flex flex-col` para limitar altura à viewport.
2. **Padding**: reduzir de `p-6 pt-8` para `p-4 pt-6`.
3. **Título**: de `text-xl` para `text-lg`, margem do troféu menor.
4. **Troféu**: reduzir de `h-10 w-10` para `h-8 w-8`.
5. **Texto de introdução**: encurtar para uma frase mais direta ("Siga os passos abaixo para começar:") e reduzir margem superior.
6. **StepCards**: 
   - Reduzir padding de `p-3.5` para `p-2.5`
   - Espaçamento entre cards de `space-y-3` para `space-y-2`
   - Texto de cada passo encurtado (manter essência mas mais conciso)
   - Ícone menor: `h-6 w-6` em vez de `h-7 w-7`
7. **Aviso de suporte**: padding menor `p-2.5`, texto mais curto.
8. **Botão**: reduzir altura de `h-14` para `h-12`, margem superior `mt-4`.

Resultado: modal compacto que cabe em uma tela mobile padrão (~700px de altura) sem necessidade de scroll, com o botão sempre visível.

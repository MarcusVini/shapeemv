## Problema

Na tela inicial pós-cadastro, a aba **Protocolo** (BottomNav) está clicável e dá acesso direto ao protocolo, mesmo quando o usuário ainda não respondeu a avaliação ou ainda está dentro do prazo de espera de 24h.

## Comportamento esperado

A aba Protocolo deve funcionar como um "cadeado" com 3 estados:

1. **Sem avaliação respondida** → ícone com cadeado. Ao clicar, mostra aviso "Responda primeiro sua avaliação física para liberar o protocolo." e leva para `/dashboard`.
2. **Avaliação respondida, mas dentro do prazo de 24h** → ícone com cadeado. Ao clicar, leva para `/waiting`, que já exibe o cronômetro "Liberação em HH:MM:SS" (mesma tela usada após enviar o quiz).
3. **Prazo cumprido** → ícone normal de Protocolo, navegação livre para `/protocol`.

## Mudanças

### 1. `src/components/BottomNav.tsx`
- Adicionar `useQuery` chamando `getLatestState` (já existe em `assessment.functions.ts` e retorna `assessment` + `workout.unlock_date`).
- Calcular `protocolUnlocked = !!workout && Date.now() >= new Date(workout.unlock_date).getTime()` e `hasAssessment = !!assessment`.
- Trocar o `<Link to="/protocol">` por um `<button>` quando bloqueado:
  - Sem avaliação: `toast` "Responda primeiro sua avaliação física." e `navigate({ to: "/dashboard" })`.
  - Com avaliação mas ainda travado: `navigate({ to: "/waiting" })`.
- Ícone: usar `Lock` (lucide) sobreposto ou substituindo o `Dumbbell` quando bloqueado, com cor `text-muted-foreground` em vez do dourado ativo.
- Label "Protocolo" mantida.

### 2. `src/routes/_authenticated/protocol.tsx`
- Adicionar guarda no componente: ler `getLatestState`; se `!assessment` redireciona para `/dashboard`; se `assessment` mas `Date.now() < unlock_date`, redireciona para `/waiting`. Isso impede acesso direto pela URL.

### 3. Sem mudanças de schema/banco
A coluna `workout.unlock_date` já é definida no servidor por `saveAssessment` usando `nextUnlockDate()` (24h). O `/waiting` já consome esse valor e mostra o timer.

## Resultado

- Usuário recém-cadastrado: vê cadeado na aba Protocolo; clique alerta para fazer a avaliação.
- Após enviar quiz: cadeado permanece; clique abre tela com cronômetro até a liberação.
- Após o tempo: cadeado some, acesso liberado normalmente.

## Refatoração da página de Protocolo

### 1. `src/lib/protocol-data.ts`
Substituir completamente os dados pelos 4 treinos enviados:
- **Treino 1**: Costas (Dorsais / Bíceps / Deltoide Posterior) — 7 exercícios
- **Treino 2**: Peitoral (Peitoral / Deltoide / Tríceps) — 8 exercícios
- **Treino 3**: Pernas (Inferiores completo) — 6 exercícios
- **Treino 4**: Ombros (Deltoides e complementar) — 6 exercícios

Adicionar campo novo `videoUrl: string` em cada exercício (com os links embed do YouTube ou a string `"EM BREVE"`). Adicionar também o array fixo `ABDOMEN` com os 3 exercícios (corda, infra ao chão, prancha).

Renomear `subtitulo` → `foco` para alinhar com o novo JSON (e atualizar consumo em `protocol.tsx`).

### 2. `src/routes/_authenticated/protocol.tsx`
- Adicionar 4ª aba (`t4` → Treino 4: Ombros). As abas viram: `Instruções | Treino 1 | Treino 2 | Treino 3 | Treino 4`.
- O cabeçalho de cada treino mostra o novo `foco` completo (ex.: "Ênfase em Costas (Dorsais / Bíceps / Deltoide Posterior)").
- A faixa de abas já tem scroll horizontal — confirmar que 5 abas cabem sem quebrar layout mobile (sem scroll horizontal na página).

### 3. Novo player de vídeo no `ExercicioCard`
Substituir o placeholder com ícone de halter pela lógica condicional:
- Se `videoUrl === "EM BREVE"`: `<div>` com fundo `#1E1E1E`, `aspect-video`, `rounded-lg`, texto centralizado dourado **"VÍDEO EM BREVE"**.
- Caso contrário: `<iframe>` do YouTube/Instagram com:
  - `className="aspect-video w-full rounded-lg shadow-md"`
  - `allowFullScreen`
  - `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
  - `loading="lazy"` para performance.

### 4. Bloco fixo "ABDÔMEN" no rodapé de cada treino
Componente novo renderizado abaixo da lista de exercícios em **todas as 4 abas de treino** (não em Instruções):
- Título destacado: **"ABDÔMEN: FAZER DE 1 A 2 VEZES NA SEMANA"** (faixa com gold-border + leve glow dourado para destaque visual).
- 3 cards reutilizando `ExercicioCard`:
  1. Abdomen Corda — 3×10-12, 40s — vídeo YouTube
  2. Abdomen Infra ao Chão — 3×10-12, 40s — embed Instagram
  3. Isometria Prancha — 2×40s, 40s — EM BREVE

### 5. Garantias de qualidade
- Mobile-first: max-w-md mantido, iframes com `w-full` para não estourar.
- Sem mudança em schema do banco, sem mudança em outras telas.
- O botão "Adicionar Carga" permanece como está (placeholder visual).

### Arquivos afetados
- `src/lib/protocol-data.ts` — reescrita completa
- `src/routes/_authenticated/protocol.tsx` — nova aba T4, novo player, bloco abdômen

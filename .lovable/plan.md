# Revisão do fluxo + Avaliação personalizada

Objetivo: coletar mais sinais relevantes no quiz, transformar isso em uma avaliação realmente personalizada (texto + números) e polir pontos fracos do fluxo atual.

---

## 1) Quiz — novas perguntas para personalizar a avaliação

Hoje o quiz tem 23 passos, mas falta dado para calcular nutrição, recuperação e prescrição realista. Vou **adicionar 9 perguntas** (agrupadas por bloco) e ajustar 2 existentes.

### Bloco "Corpo" (adicionar)
- `peso_meta` (slider, kg) — peso que quer atingir
- `circunferencia_cintura` (slider, cm, opcional) — refina cálculo de risco metabólico (melhor que IMC sozinho)

### Bloco "Rotina & Recuperação" (novo bloco)
- `dias_treino_semana` (cards: 2, 3, 4, 5, 6) — base de prescrição
- `tempo_treino` (cards: 30min / 45min / 60min / 75min+)
- `local_treino` (cards: Academia completa / Academia básica / Casa com equipamentos / Casa sem equipamentos)
- `horas_sono` (slider 4–10h) — entra em Recuperação
- `nivel_estresse` (slider 1–10) — entra em Recuperação
- `agua_dia` (cards: <1L / 1–2L / 2–3L / 3L+)

### Bloco "Nutrição"
- `refeicoes_dia` (cards: 2 / 3 / 4 / 5+)
- `qualidade_alimentacao` (cards: Ruim / Regular / Boa / Excelente) — substitui parte do que hoje é só "gasto"
- `alcool_semana` (cards: Não bebo / 1–2x / 3–5x / Quase todo dia)
- `suplementacao` (checkbox-multi: Whey, Creatina, Multivitamínico, Pré-treino, Nenhum)

### Ajustes em existentes
- `composicao`: alinhar as keys com o que `assessment-calc.ts` espera (hoje há mismatch: quiz usa `muito_magro`, `magro_barriga`, `muito_acima_peso`, `musculoso` que nem entram no `scoreFromMap` → todos caem no fallback 50). Vou expandir o map.
- `areas_incomodam`: adicionar "abdômen definido" e "postura".

### Reorganização visual
- Inserir 2 telas intersticiais novas para quebrar a percepção de "quiz longo": após bloco Corpo e após bloco Rotina.
- Barra de progresso já existe; passar a mostrar **categoria atual** ("Corpo • 4/6") em vez de só número global.

---

## 2) Avaliação personalizada — `/results`

### 2.1 Hero "Diagnóstico personalizado" (novo, topo da página)
Bloco em destaque com:
- Saudação pelo primeiro nome
- **Parágrafo gerado** a partir das respostas (template determinístico, sem IA), ex.:
  > "Marcos, 34 anos. Seu perfil indica **sobrepeso leve** (IMC 27.3) com **baixa recuperação** (dormindo 5h e estresse 8/10) e **execução intermediária**. Sua maior alavanca nos próximos 28 dias é **ajustar sono + reduzir gordura visceral**, mantendo treino 4x/semana de 45min."
- 3 **tags de perfil** auto-geradas (ex.: "Estressado crônico", "Tempo curto", "Foco em definição")

### 2.2 Novos scores no Perfil de Performance (radar)
Hoje: Força, Resistência, Execução. Vai virar 5 eixos:
- Força (já existe)
- Resistência (já existe)
- Execução (já existe)
- **Recuperação** = f(horas_sono, nivel_estresse)
- **Nutrição** = f(qualidade_alimentacao, refeicoes_dia, agua_dia, alcool_semana)

### 2.3 Novo bloco "Metabolismo & Calorias"
Calcula via Mifflin-St Jeor + fator de atividade (dias_treino_semana):
- TMB (kcal/dia em repouso)
- Gasto total estimado (kcal/dia)
- Meta calórica sugerida (déficit/superávit conforme `objetivo`)
- Proteína-alvo em g (1.8–2.2 g/kg conforme objetivo)

### 2.4 Projeções 28 dias **personalizadas** (não mais hardcoded)
Hoje `project28DaysPhysical` só olha `objetivo`. Vai considerar:
- `dias_treino_semana` e `tempo_treino` (volume → multiplicador)
- `horas_sono` + `nivel_estresse` (recuperação → multiplicador)
- `experiencia` (iniciante ganha mais rápido — "newbie gains")
- `peso` e `peso_meta` (calibra o delta projetado)

Idem `project28DaysWellbeing` (testosterona/autoestima/saúde): muda conforme sono/estresse/álcool.

### 2.5 Novo bloco "Suas 3 alavancas" (recomendações)
Top 3 ações priorizadas pela maior fraqueza detectada, ex.:
- "Dormir 7h+ (hoje: 5h) → +20% recuperação"
- "Aumentar proteína para 150g/dia"
- "3L de água/dia"

### 2.6 IMC mais inteligente
Hoje IMC só usa peso/altura. Vou adicionar nota contextual quando `composicao = musculoso` (IMC alto não significa gordura) e quando idade > 60 (faixas ajustadas).

---

## 3) Pontos de melhoria do fluxo

### 3.1 Quiz
- **Auto-save** a cada step (localStorage) para não perder respostas se recarregar
- **Tela de revisão** antes do submit final (lista compacta com botão "editar" por pergunta)
- Botão "Voltar" em todos os steps (verificar se está consistente)

### 3.2 Processing / Waiting
- Mensagens do processing referenciarem nome + objetivo do usuário
- Waiting: além do countdown, mostrar preview borrado da avaliação ("desbloqueia em…")

### 3.3 Dashboard
- Card "Sua Avaliação Trinca" hoje é genérico → mostrar **1 insight chave** (ex.: "Score 72/100 · IMC 27.3 · Foco: definição")
- Quando assessment incompleto, CTA mais forte indicando quantas perguntas faltam

### 3.4 Profile
- Botão **"Refazer avaliação"** (sobrescreve `assessments`)
- Botão **"Atualizar peso"** (rápido, sem refazer quiz inteiro)

### 3.5 Bugs/inconsistências detectadas
- `calcComposicaoScore` não cobre 4 das 7 opções do quiz → todos caem no fallback 50. **Corrigir.**
- `projectProgress` calculada mas nunca usada (`void projection;`) → remover.
- Strings de `LABEL.composicao` em `results.tsx` não batem com novos values do quiz → atualizar.

---

## Arquivos afetados

- `src/lib/quiz-data.ts` — +9 perguntas, +2 intersticiais, ajustes composicao/areas
- `src/lib/assessment-calc.ts` — corrigir composicaoScore, novos scores (recuperação, nutrição), Mifflin-St Jeor, projeções personalizadas, gerador de diagnóstico textual, gerador de tags, gerador de "3 alavancas"
- `src/routes/_authenticated/quiz.tsx` — auto-save localStorage, tela de revisão, barra com categoria
- `src/routes/_authenticated/results.tsx` — hero diagnóstico, radar 5 eixos, bloco metabolismo, bloco alavancas, nota IMC, atualizar labels
- `src/routes/_authenticated/dashboard.tsx` — insight chave no card de avaliação
- `src/routes/_authenticated/profile.tsx` — botões refazer avaliação / atualizar peso
- `src/routes/_authenticated/processing.tsx` e `waiting.tsx` — copy personalizada + preview

**Sem mudanças de schema do banco** — `respostas_json` é JSONB livre, então novos campos entram naturalmente. Avaliações antigas continuam funcionando (todos os novos campos têm fallback).

---

## Pergunta antes de implementar

Posso seguir com **tudo** acima ou prefere que eu faça em fases? Sugestão de fase 1 (maior impacto):
1. Corrigir bugs + adicionar perguntas de **Rotina/Recuperação/Nutrição** + Hero diagnóstico + radar 5 eixos + bloco metabolismo + 3 alavancas.

E deixar para fase 2: tela de revisão do quiz, refazer avaliação, preview no waiting.

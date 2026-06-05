
# Análise do Shape em V — pontos a melhorar

Fiz uma revisão completa do app (landing, auth, quiz, processamento, espera, resultados, protocolo, perfil, BottomNav, server functions e schema do banco). Abaixo está o diagnóstico organizado por prioridade. Você escolhe quais blocos quer que eu implemente.

---

## 🔴 Prioridade Alta — funcionalidades incompletas / inconsistências reais

1. **Protocolo é genérico, não personalizado**
   `src/lib/protocol-data.ts` tem 3 treinos estáticos (Peito/Tríceps, Costas/Bíceps, Pernas/Ombros) iguais para todo mundo, embora o quiz pergunte gênero, composição, objetivo, áreas que incomodam, dor/lesão, frequência etc. A promessa do app é "protocolo 100% personalizado", mas o conteúdo entregue não varia.
   - **Mínimo**: gerar variações do protocolo a partir das respostas (ex.: objetivo "secar" reduz descansos e adiciona cardio; áreas "barriga/glúteos" priorizam blocos; dor lombar troca agachamento livre por leg press; mulher → ênfase em glúteos/posterior).
   - **Ideal**: salvar o protocolo gerado em `workouts.treinos_json` no momento do `saveAssessment` para histórico/imutabilidade.

2. **Vídeos/imagens de exercícios ausentes**
   Cada `ExercicioCard` mostra apenas um ícone de halter num placeholder. Falta o que mais importa num app de treino: demonstração visual ou link para vídeo de execução.

3. **Botão "Adicionar Carga" não faz nada**
   Em `protocol.tsx` o botão existe mas não tem onClick. Ou implementar (registrar carga por exercício/sessão em nova tabela `workout_logs`) ou remover para não frustrar o usuário.

4. **Sem registro de treino concluído / progresso**
   Não há como marcar "treino feito hoje", ver streak, semana, evolução real. O gráfico de "progresso projetado" é uma estimativa, não dado real.

5. **Sem recuperação de senha**
   A tela de login só tem signup/signin. Usuário que esqueceu a senha não tem saída (suporte via WhatsApp não substitui `resetPasswordForEmail`).

6. **Sem confirmação de e-mail explicada**
   Se o auto-confirm estiver desligado, o usuário tenta logar logo após signup e recebe "Invalid login credentials" sem entender o motivo. Tratar a mensagem ou habilitar auto-confirm conscientemente.

7. **Política de senha fraca**
   `minLength={6}` no input e leaked-password protection desligada conforme pedido anterior. Tudo bem manter, mas recomendo no mínimo 8 caracteres para evitar comprometimentos triviais.

---

## 🟡 Prioridade Média — UX / qualidade percebida

8. **Quiz não tem "salvar e continuar depois"**
   23 perguntas e zero persistência intermediária. Se o usuário fechar o app no meio, perde tudo.

9. **Quiz sem barra de progresso clara por etapa** (verificar — ler `quiz.tsx`; se já tem, ok).

10. **Resultados não mostra os 23 dados respondidos**
    Mostra dados pessoais, IMC, score, radar de 3 eixos, áreas e projeção. Boa parte das respostas (frequência, sono, alimentação, etc.) não aparece em lugar algum — desperdiça contexto do quiz.

11. **Liberação de 24h sem aviso por e-mail/push**
    O usuário precisa abrir o app exatamente na hora certa. Enviar e-mail "seu protocolo está liberado" aumentaria muito o engajamento (usar email function do Cloud).

12. **Falta calendário/cronograma semanal de treinos**
    Hoje só temos "Treino 1/2/3" em abas. Sem orientação de "hoje é Treino 1, amanhã Treino 2".

13. **Sem onboarding do primeiro treino**
    Após liberar o protocolo, cair direto na tela cheia de texto + exercícios é denso. Um "comece pelo Treino 1" com CTA destacado ajuda.

14. **Perfil minimalista demais**
    Só mostra nome, e-mail e logout. Falta: editar nome, refazer avaliação, ver histórico de avaliações, link para suporte, política/termos.

15. **`/results` não é acessível pelo BottomNav** após liberação — o usuário não consegue revisitar facilmente o relatório (precisa navegar manualmente).

---

## 🟢 Prioridade Baixa — polimento, SEO, robustez

16. **SEO da landing**
    `index.tsx` tem title/description simples mas falta og:image, og:title, twitter:card e JSON-LD. App de venda direta perde compartilhamento.

17. **Logout em duplicidade**
    Botão "Sair" aparece em `dashboard` (ícone no topo) E em `profile`. Pode ficar só em Perfil.

18. **Tipografia**: hoje tudo usa a fonte padrão. Considerar uma fonte display masculina/atlética (Bebas Neue, Archivo Black) para títulos e Inter/Manrope no corpo — combina com a identidade "Shape em V dourado".

19. **`getLatestState` é chamado em dashboard, protocol, profile, results e BottomNav** com mesma `queryKey: ["state"]`. Já está bom (cache compartilhado), mas falta `staleTime` para não re-fetchar a cada navegação.

20. **`BottomNav` faz `refetchInterval: 30s`** mesmo quando já está desbloqueado — economiza se parar o intervalo após `protocolUnlocked === true`.

21. **WhatsApp hardcoded** em `BottomNav.tsx` (`554999557290`). Mover para env/config.

22. **Não há analytics** (PostHog/Plausible) para entender funil de cadastro → quiz → liberação → uso do protocolo.

23. **Falta política de privacidade / termos** acessível em rota pública (`/privacidade`, `/termos`) — exigido pela LGPD para SaaS que coleta dados de saúde.

24. **Sem dark/light toggle** (o tema é dark-only, o que combina com o branding — mas vale validar).

---

## 🛡️ Segurança / dados

25. **Tabela `workouts.treinos_json` está vazia `{}`** — não armazenamos nada do protocolo gerado. Se você mudar `protocol-data.ts` no futuro, usuários antigos verão um protocolo diferente do que receberam originalmente. **Snapshot do protocolo no momento da liberação** resolve.

26. **RLS já está ok** (escopo por `auth.uid()`), grants presentes, sem `anon` exposto. ✅

27. **Edge case**: se um usuário deletar a `assessment` (não permitido por RLS hoje), o `workout` órfão continua. Não é problema imediato.

---

## Como você quer prosseguir?

Sugiro atacar em ondas:

- **Onda 1 (essencial)**: #1 personalização do protocolo + snapshot (#25), #2 vídeos/imagens dos exercícios, #3 implementar ou remover "Adicionar Carga", #5 recuperar senha.
- **Onda 2 (engajamento)**: #4 marcar treino feito + streak, #11 e-mail de liberação, #12 cronograma semanal.
- **Onda 3 (polimento)**: #8 salvar quiz parcial, #14 perfil expandido, #16 SEO completo, #18 tipografia, #23 termos/privacidade.

Me diga quais itens (pode citar por número) você quer que eu implemente primeiro e eu já preparo o plano detalhado de execução.

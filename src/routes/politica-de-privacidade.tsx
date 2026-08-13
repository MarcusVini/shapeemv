import { createFileRoute } from "@tanstack/react-router";
import { OFFICIAL_URL } from "@/lib/legal";
import { LegalLayout } from "./termos-de-uso";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Shape em V" },
      {
        name: "description",
        content:
          "Como os dados são utilizados no Shape em V e como identificar o acesso oficial da plataforma.",
      },
      { property: "og:title", content: "Política de Privacidade — Shape em V" },
      {
        property: "og:description",
        content: "Tratamento de dados, cookies e segurança de acesso no Shape em V.",
      },
    ],
  }),
  component: PrivacyPage,
});

const PARAGRAPHS = [
  "A sua privacidade é importante. Esta Política de Privacidade explica de forma simples como os dados podem ser utilizados dentro do Shape em V.",
  "Podemos coletar dados como nome, e-mail, informações de acesso, respostas da avaliação, preferências de treino, registros de uso do app, confirmações de aceite, dados técnicos de navegação, dispositivo, origem de acesso e parâmetros de campanha.",
  "Essas informações podem ser usadas para liberar o acesso, identificar o aluno, organizar a experiência dentro do aplicativo, exibir o protocolo indicado, oferecer suporte, melhorar a plataforma, manter a segurança do acesso e acompanhar o funcionamento das páginas.",
  `O acesso oficial ao Shape em V acontece somente através do link: ${OFFICIAL_URL}.`,
  "Não informe seus dados, não baixe aplicativos e não solicite acesso através de links, páginas, perfis, mensagens ou aplicativos de terceiros que não sejam o link oficial informado.",
  "O Shape em V não vende dados pessoais do aluno. Os dados podem ser tratados apenas para funcionamento da plataforma, liberação de acesso, suporte, segurança, comunicação, melhoria da experiência e cumprimento de obrigações aplicáveis.",
  "Podemos usar cookies, localStorage, parâmetros de URL, UTMs e dados técnicos para preservar sessão, entender origem de acesso, melhorar campanhas, manter rastreamento e garantir funcionamento correto da plataforma.",
  "Ao utilizar o Shape em V, o aluno concorda com o tratamento dos dados necessários para funcionamento do aplicativo.",
  "Caso precise de suporte, utilize somente os canais oficiais informados na sua compra ou na comunicação oficial do Shape em V.",
];

function PrivacyPage() {
  return <LegalLayout title="Política de Privacidade — Shape em V" paragraphs={PARAGRAPHS} />;
}

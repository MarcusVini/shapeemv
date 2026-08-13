import { createFileRoute } from "@tanstack/react-router";
import { OFFICIAL_URL } from "@/lib/legal";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Shape em V" },
      {
        name: "description",
        content:
          "Termos de Uso do Shape em V: acesso oficial pelo navegador, sem download de aplicativo.",
      },
      { property: "og:title", content: "Termos de Uso — Shape em V" },
      {
        property: "og:description",
        content: "Regras de uso e acesso oficial do aplicativo web Shape em V.",
      },
    ],
  }),
  component: TermsPage,
});

const PARAGRAPHS = [
  "O Shape em V é uma plataforma web de acesso digital ao método Shape em V, do Fernando Cantarelli, com conteúdos, treinos, orientações e materiais voltados à rotina de treinamento.",
  `O acesso oficial ao Shape em V acontece somente através do link: ${OFFICIAL_URL}.`,
  "Não é necessário baixar nenhum aplicativo, arquivo, APK, programa ou extensão para acessar o Shape em V. O acesso deve ser feito pelo navegador, usando o e-mail informado na compra.",
  "O Shape em V não se responsabiliza por links, aplicativos, arquivos, páginas, perfis, grupos, mensagens, cobranças, downloads ou acessos realizados fora do link oficial informado nestes termos.",
  "Qualquer tentativa de download, instalação ou acesso fora do link oficial deve ser desconsiderada pelo aluno, pois não faz parte do funcionamento oficial do Shape em V.",
  "Os conteúdos disponibilizados no Shape em V têm finalidade informativa, educacional e de orientação geral para treino. Eles não substituem avaliação médica, nutricional, fisioterapêutica ou acompanhamento presencial de profissional de educação física.",
  "Caso o aluno tenha dores, lesões, limitações, doenças ou qualquer condição específica, deve procurar orientação profissional antes de iniciar os treinos.",
  "O aluno é responsável por executar os exercícios respeitando seus limites, sua condição física, seu ambiente de treino, os equipamentos disponíveis e as orientações de segurança.",
  "O acesso ao Shape em V é individual e vinculado aos dados utilizados na compra. É proibido compartilhar, vender, emprestar, gravar, distribuir, copiar, disponibilizar publicamente ou comercializar qualquer conteúdo, treino, vídeo, material ou acesso do Shape em V sem autorização.",
  "O Shape em V pode atualizar conteúdos, treinos, páginas, layout, funcionalidades, avisos e termos sempre que necessário para melhorar a experiência, segurança e funcionamento da plataforma.",
  "Ao acessar e utilizar o Shape em V, o aluno declara que leu, entendeu e concorda com estes Termos de Uso.",
  "Se o aluno não concordar com estes termos, não deve utilizar o aplicativo.",
];

function TermsPage() {
  return <LegalLayout title="Termos de Uso — Shape em V" paragraphs={PARAGRAPHS} />;
}

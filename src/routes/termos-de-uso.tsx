import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LAST_UPDATED_LABEL, OFFICIAL_URL } from "@/lib/legal";

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

export function LegalLayout({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>

        <h1 className="mt-5 text-2xl font-black leading-tight text-gold-gradient">{title}</h1>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Última atualização: {LAST_UPDATED_LABEL}
        </p>

        <div className="mt-6 space-y-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="rounded-2xl border border-white/5 bg-card/60 p-4 text-[13px] leading-relaxed text-muted-foreground"
            >
              {p}
            </p>
          ))}
        </div>

        <Link
          to="/"
          className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl gold-gradient text-sm font-bold text-primary-foreground shadow-gold-sm"
        >
          Voltar ao Shape em V
        </Link>

        <p className="mt-4 text-center text-[10px] text-muted-foreground/70">
          Acesso oficial: {OFFICIAL_URL}
        </p>
      </div>
    </main>
  );
}

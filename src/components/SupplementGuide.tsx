import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Sparkles, Ticket } from "lucide-react";

const SOLDIER_URL = "https://soldiersnutrition.com.br/";

const AULAS = [
  { id: "intro", label: "Introdução", title: "Como usar este guia", video: "Fpud6bF6K2A" },
  { id: "a1", label: "Aula 1", title: "Creatina", video: "bLM_PDRWW2s" },
  { id: "a2", label: "Aula 2", title: "Whey Protein", video: "NSAvpiIVwsE" },
  { id: "a3", label: "Aula 3", title: "Pré-treinos e termogênicos", video: "BjX9s7DxW4Y" },
  { id: "a4", label: "Aula 4", title: "Ômega 3", video: "DWnz6JYTA0s" },
  { id: "a5", label: "Aula 5", title: "Barras de proteína", video: "OGOS7ELCsIE" },
];

function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="aspect-video w-full"
      />
    </div>
  );
}

function SoldierButton({ label }: { label: string }) {
  return (
    <a
      href={SOLDIER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl gold-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-gold-sm"
    >
      {label}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export function SupplementGuide() {
  return (
    <section className="relative overflow-hidden rounded-3xl gold-border bg-[#141416] p-6 shadow-gold">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full gold-gradient px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground">
          <Sparkles className="h-3 w-3" /> Guia Extra
        </span>

        <h2 className="mt-3 text-2xl font-black leading-tight text-foreground">
          <span className="text-gold-gradient">Guia de Suplementos</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aulas rápidas para você entender como usar suplementos de forma simples e estratégica
          dentro da sua rotina.
        </p>

        {/* Recomendação */}
        <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <p className="text-xs leading-relaxed text-foreground/90">
            Antes de começar as aulas, uma recomendação do Fernando Cantarelli: para quem quer
            incluir suplementos na rotina, a Soldier Nutrition é uma opção para conhecer. Você pode
            acessar o site oficial e usar o cupom CANTARELLI para garantir desconto na sua compra.
          </p>
          <div className="mt-4">
            <SoldierButton label="Conhecer Soldier Nutrition" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
            <Ticket className="h-3.5 w-3.5" /> Cupom: CANTARELLI
          </p>
        </div>

        {/* Aulas */}
        <Accordion type="single" collapsible className="mt-6 space-y-3">
          {AULAS.map((aula) => (
            <AccordionItem
              key={aula.id}
              value={aula.id}
              className="overflow-hidden rounded-2xl border border-border bg-card px-4"
            >
              <AccordionTrigger className="py-4 text-left hover:no-underline">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">
                    {aula.label}
                  </p>
                  <p className="mt-0.5 text-sm font-black text-foreground">{aula.title}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <YouTubeEmbed id={aula.video} title={`${aula.label} — ${aula.title}`} />
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Quer conhecer os suplementos recomendados pelo Fernando? Acesse a Soldier
                  Nutrition e use o cupom <span className="font-black text-primary">CANTARELLI</span>.
                </p>
                <div className="mt-3">
                  <SoldierButton label="Usar cupom CANTARELLI" />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Suplementos são opcionais e podem complementar a rotina se fizer sentido para você.
          Nenhum suplemento é obrigatório para evoluir no protocolo.
        </p>
      </div>
    </section>
  );
}

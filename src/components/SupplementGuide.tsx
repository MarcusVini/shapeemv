import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown, ExternalLink, Gift, Sparkles, Ticket } from "lucide-react";

const SCA_REF = "sca_ref=11106229.X4Uwv7jvjWQv9Br";

const CREATINA_URL = `https://soldiersnutrition.com.br/products/creatina-monohidratada-100-pura-importada-soldiers-nutrition-tamanho-1kg?${SCA_REF}`;
const WHEY_URL = `https://soldiersnutrition.com.br/collections/whey-protein?${SCA_REF}`;
const OMEGA3_URL = `https://soldiersnutrition.com.br/products/omega-3-1000mg-meg-3-soldiers-nutrition-quantidade-60-caps?_pos=1&_sid=07516c6b1&_ss=r&${SCA_REF}`;
const PRE_TREINO_URL = `https://soldiersnutrition.com.br/collections/top-pre-treino?${SCA_REF}`;
const BARRA_URL = `https://soldiersnutrition.com.br/collections/barra-de-proteina?${SCA_REF}`;

const AULAS = [
  { id: "intro", label: "Introdução", title: "Como usar este guia", video: "Fpud6bF6K2A", url: CREATINA_URL, cta: "Conhecer Creatina" },
  { id: "a1", label: "Aula 1", title: "Creatina", video: "bLM_PDRWW2s", url: CREATINA_URL, cta: "Conhecer Creatina" },
  { id: "a2", label: "Aula 2", title: "Whey Protein", video: "NSAvpiIVwsE", url: WHEY_URL, cta: "Conhecer Whey Protein" },
  { id: "a3", label: "Aula 3", title: "Pré-treinos e termogênicos", video: "BjX9s7DxW4Y", url: PRE_TREINO_URL, cta: "Conhecer Pré-treinos" },
  { id: "a4", label: "Aula 4", title: "Ômega 3", video: "DWnz6JYTA0s", url: OMEGA3_URL, cta: "Conhecer Ômega 3" },
  { id: "a5", label: "Aula 5", title: "Barras de proteína", video: "OGOS7ELCsIE", url: BARRA_URL, cta: "Conhecer Barra de Proteína" },
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

function SoldierButton({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
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
    <div className="relative overflow-hidden rounded-3xl gold-border bg-[#141416] shadow-gold">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

      {/* Recolhido por padrão — Bônus Surpresa */}
      <Accordion type="single" collapsible className="relative">
        <AccordionItem
          value="bonus"
          className="border-b-0"
        >
          <AccordionTrigger className="group w-full items-center gap-4 rounded-3xl p-5 text-left hover:no-underline">
            <div className="flex w-full items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gold-gradient text-primary-foreground shadow-gold-sm">
                <Gift className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3 w-3" /> Bônus Surpresa
                </span>
                <p className="mt-0.5 text-base font-black text-foreground">
                  Guia de <span className="text-gold-gradient">Suplementos</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Toque para abrir. Aulas rápidas sobre creatina, whey e mais.
                </p>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-5 pb-6">
            <div className="pt-2">
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

              {/* Aulas — recolhidas, só expandem ao clicar */}
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
                        Nutrition e use o cupom{" "}
                        <span className="font-black text-primary">CANTARELLI</span>.
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

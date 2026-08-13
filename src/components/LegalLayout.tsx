import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LAST_UPDATED_LABEL, OFFICIAL_URL } from "@/lib/legal";

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

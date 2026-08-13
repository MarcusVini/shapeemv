import { Link } from "@tanstack/react-router";
import { OFFICIAL_URL } from "@/lib/legal";

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`mt-10 space-y-1 text-center ${className}`}>
      <p className="text-[10px] leading-relaxed text-muted-foreground/70">
        Acesso oficial: {OFFICIAL_URL}. O Shape em V não exige download de aplicativo.
      </p>
      <p className="text-[10px] text-muted-foreground/70">
        <Link to="/termos-de-uso" className="underline underline-offset-2 hover:text-primary">
          Termos de Uso
        </Link>
        <span className="mx-1.5">·</span>
        <Link
          to="/politica-de-privacidade"
          className="underline underline-offset-2 hover:text-primary"
        >
          Política de Privacidade
        </Link>
      </p>
    </footer>
  );
}

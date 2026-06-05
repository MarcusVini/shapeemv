import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Dumbbell, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "554999557290";

const navItems = [
  { to: "/dashboard", label: "Avaliação", icon: ClipboardList },
  { to: "/protocol", label: "Protocolo", icon: Dumbbell },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const supportMessage = encodeURIComponent(
    `Olá, vim do Shape em V (${email ?? "email não identificado"}) e preciso de suporte.`,
  );
  const supportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${supportMessage}`;

  const linkClasses = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/results"
              : pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={linkClasses(active)}>
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")} />
              {label}
            </Link>
          );
        })}

        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses(false)}
        >
          <MessageCircle className="h-5 w-5" />
          Suporte
        </a>

        <Link to="/profile" className={linkClasses(pathname.startsWith("/profile"))}>
          <User
            className={cn(
              "h-5 w-5",
              pathname.startsWith("/profile") && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]",
            )}
          />
          Perfil
        </Link>
      </div>
    </nav>
  );
}

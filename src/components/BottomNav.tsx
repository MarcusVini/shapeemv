import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Avaliação", icon: ClipboardList },
  { to: "/protocol", label: "Protocolo", icon: Dumbbell },
  { to: "/profile", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/results"
              : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

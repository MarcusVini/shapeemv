import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import beforeAfterAsset from "@/assets/before-after.png.asset.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shape em V — Fernando Contarini" },
      {
        name: "description",
        content: "Avaliação física personalizada pelo método Shape em V.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome_completo: nome },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-10 pb-12">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Método</p>
          <h2 className="mt-1 text-2xl font-black text-gold-gradient">Shape em V</h2>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mx-auto mb-8 h-56 w-56 overflow-hidden rounded-full gold-border shadow-gold"
        >
          <img
            src={beforeAfterAsset.url}
            alt="Transformação Shape em V"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black leading-tight text-foreground">
            Construa o seu <span className="text-gold-gradient">Shape em V</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            A avaliação inteligente do Fernando Contarini analisa seu corpo, seus
            objetivos e libera um protocolo 100% personalizado.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          {[
            "Diagnóstico em 23 etapas",
            "Score físico e projeção em 4 meses",
          ].map((t) => (
            <li
              key={t}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{t}</span>
            </li>
          ))}
        </motion.ul>

        <div className="mt-10 space-y-3">
          <Button
            onClick={() => {
              setMode("signup");
              setOpen(true);
            }}
            className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold hover:opacity-95"
          >
            <Zap className="mr-2 h-5 w-5" /> Começar minha avaliação
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setMode("signin");
              setOpen(true);
            }}
            className="h-12 w-full rounded-2xl text-sm text-muted-foreground hover:text-foreground"
          >
            Já tenho conta — entrar
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {mode === "signup" ? "Criar minha conta" : "Entrar"}
            </DialogTitle>
            <DialogDescription>
              {mode === "signup"
                ? "Vamos começar sua avaliação Shape em V."
                : "Bem-vindo de volta."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-input"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 rounded-xl bg-input"
                placeholder="voce@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="h-12 rounded-xl bg-input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl gold-gradient font-semibold text-primary-foreground shadow-gold-sm"
            >
              {loading ? "Carregando…" : mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signup"
                ? "Já tenho conta — entrar"
                : "Não tenho conta — criar"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import beforeAfterAsset from "@/assets/before-after-v2.jpg.asset.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSession, setSession } from "@/lib/session";
import { loginOrCreateUser } from "@/lib/auth.functions";
import { usePageView } from "@/lib/tracking";
import { Link } from "@tanstack/react-router";
import { SecurityNoticeModal, useSecurityNotice } from "@/components/SecurityNoticeModal";
import { LegalFooter } from "@/components/LegalFooter";
import { OFFICIAL_URL, TERMS_VERSION } from "@/lib/legal";
import { recordTermsAcceptance } from "@/lib/legal.functions";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shape em V — Método Fernando Cantarelli" },
      {
        name: "description",
        content: "Avaliação física guiada pelo método Shape em V. Protocolo, treinos e projeção em 4 meses.",
      },
    ],
  }),
  component: LandingPage,
});

const HIGHLIGHTS = [
  { n: "01", title: "Avaliação em 2 minutos", desc: "Diagnóstico direto sobre corpo e rotina." },
  { n: "02", title: "Score físico e projeção 4 meses", desc: "Onde você está e onde pode chegar." },
  { n: "03", title: "Protocolo do seu objetivo", desc: "Treinos organizados para seguir com direção." },
];

function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedLogin, setAcceptedLogin] = useState(false);
  const { show: showNotice, accept: acceptNotice } = useSecurityNotice();
  usePageView("page_view", "landing");

  useEffect(() => {
    if (getSession()) navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedLogin) {
      toast.error("Para continuar, confirme que você leu e entendeu o aviso de segurança.");
      return;
    }
    const emailNorm = email.trim().toLowerCase();
    const nomeNorm = nome.trim();
    if (!nomeNorm || !emailNorm) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginOrCreateUser({
        data: { email: emailNorm, nome_completo: nomeNorm },
      });
      setSession({
        id: user.id,
        email: user.email,
        nome_completo: user.nome_completo || nomeNorm,
      });
      void recordTermsAcceptance({
        data: {
          email: emailNorm,
          user_id: user.id,
          terms_version: TERMS_VERSION,
          source: "login",
        },
      }).catch(() => {});
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="relative min-h-screen bg-background overflow-hidden">

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-20%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-20%] h-[420px] w-[420px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-8 pb-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/80">Método</p>
            <h2 className="mt-1 text-xl font-black text-gold-gradient">Shape em V</h2>
          </div>
          <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            v.2026
          </span>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/80">
            Avaliação · Protocolo · Treinos
          </p>
          <h1 className="mt-3 text-[2.5rem] font-black leading-[1.05] text-foreground">
            Construa o seu{" "}
            <span className="text-gold-gradient">Shape em V</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Comece pela avaliação e descubra qual caminho faz mais sentido para o seu físico atual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="relative mx-auto mt-8 aspect-[4/3] w-full overflow-hidden rounded-[28px] gold-border shadow-gold"
        >
          <img
            src={beforeAfterAsset.url}
            alt="Transformação Shape em V"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              Antes · Depois
            </p>
            <span className="text-[10px] font-bold text-primary">Método Cantarelli</span>
          </div>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 space-y-3"
        >
          {HIGHLIGHTS.map((h) => (
            <li
              key={h.n}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-black text-primary">
                {h.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{h.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{h.desc}</p>
              </div>
            </li>
          ))}
        </motion.ul>

        <div className="mt-10">
          <Button
            onClick={() => setOpen(true)}
            className="group h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold hover:opacity-95"
          >
            Acessar meu treino
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Leva menos de 2 minutos · Sem cartão de crédito
          </p>
        </div>

        <LegalFooter />
      </div>

      <SecurityNoticeModal show={showNotice} onAccept={acceptNotice} />


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">Acessar meu treino</DialogTitle>
            <DialogDescription>
              Informe seu nome e e-mail para entrar. Se for sua primeira vez, criamos sua conta automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl gold-gradient font-semibold text-primary-foreground shadow-gold-sm"
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

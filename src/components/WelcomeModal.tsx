import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Clock, Link2, HelpCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

const WELCOME_KEY = "has_seen_welcome";

export function useWelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, "true");
    setShow(false);
  };

  return { show, dismiss };
}

export function WelcomeModal({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Overlay escuro com blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onDismiss} />

          {/* Card do modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm max-h-[95vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#18181B] shadow-2xl"
          >
            {/* Brilho dourado no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent" />

            {/* Botão de fechar */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-4 pt-5">
              {/* Título */}
              <h2 className="text-center text-base font-black leading-tight text-gold-gradient">
                BEM-VINDO AO SHAPE EM V!
              </h2>
              <div className="mx-auto mt-1.5 flex h-7 w-7 items-center justify-center rounded-full gold-gradient">
                <span className="text-sm">🏆</span>
              </div>

              {/* Texto de introdução */}
              <p className="mt-2 text-xs leading-snug text-center text-muted-foreground">
                Siga os passos abaixo para começar:
              </p>

              {/* Lista de passos */}
              <div className="mt-2.5 space-y-1.5">
                <StepCard
                  icon={<ClipboardList className="h-3.5 w-3.5 text-primary-foreground" />}
                  title="Passo 1"
                  text="Responda a avaliação física com 100% de sinceridade."
                />
                <StepCard
                  icon={<Clock className="h-3.5 w-3.5 text-primary-foreground" />}
                  title="Passo 2"
                  text="Aguarde o cronômetro enquanto montamos seu protocolo."
                />
                <StepCard
                  icon={<Link2 className="h-3.5 w-3.5 text-primary-foreground" />}
                  title="Passo 3"
                  text="Salve: shapeemv.lovable.app. Liberado amanhã às 10h."
                />
              </div>

              {/* Aviso de suporte */}
              <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2">
                <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Dúvidas? Use o botão de Suporte no menu.
                </p>
              </div>

              {/* Botão de ação */}
              <button
                onClick={onDismiss}
                className="mt-3 h-11 w-full rounded-2xl gold-gradient text-sm font-bold text-primary-foreground shadow-gold-sm transition-transform active:scale-[0.98]"
              >
                Entendi, vamos começar!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#1E1E1E] p-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg gold-gradient">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-gold-gradient">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

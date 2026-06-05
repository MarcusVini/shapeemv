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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#18181B] shadow-2xl"
          >
            {/* Brilho dourado no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 to-transparent" />

            {/* Botão de fechar */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 pt-8">
              {/* Título */}
              <h2 className="text-center text-xl font-black leading-tight text-gold-gradient">
                BEM-VINDO AO SHAPE EM V!
              </h2>
              <div className="mx-auto mt-2 flex h-10 w-10 items-center justify-center rounded-full gold-gradient">
                <span className="text-lg">🏆</span>
              </div>

              {/* Texto de introdução */}
              <p className="mt-4 text-sm leading-relaxed text-center text-muted-foreground">
                Fala mestre, parabéns por dar o primeiro passo! Para garantir que o seu protocolo seja perfeito para o seu corpo, siga os passos abaixo:
              </p>

              {/* Lista de passos */}
              <div className="mt-5 space-y-3">
                <StepCard
                  icon={<ClipboardList className="h-4 w-4 text-primary-foreground" />}
                  title="Passo 1"
                  text="Responda nossa avaliação física. Seja 100% sincero, é com base nisso que nossa inteligência vai moldar seu treino e sua dieta."
                />
                <StepCard
                  icon={<Clock className="h-4 w-4 text-primary-foreground" />}
                  title="Passo 2"
                  text="Após finalizar, aguarde o cronômetro. Nós precisamos de um tempo para analisar e montar o seu protocolo personalizado."
                />
                <StepCard
                  icon={<Link2 className="h-4 w-4 text-primary-foreground" />}
                  title="Passo 3"
                  text="Salve este link: https://shapeemv.lovable.app/. Seu treino e sua avaliação completa estarão liberados no dia seguinte, exatamente às 10:00 da manhã."
                />
              </div>

              {/* Aviso de suporte */}
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Teve algum problema ou dúvida? Clique no botão de Suporte no menu para falar com a nossa equipe.
                </p>
              </div>

              {/* Botão de ação */}
              <button
                onClick={onDismiss}
                className="mt-5 h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm transition-transform active:scale-[0.98]"
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
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-[#1E1E1E] p-3.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gold-gradient">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gold-gradient">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Globe, Ban } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OFFICIAL_URL, TERMS_VERSION, getAcceptance, saveAcceptance } from "@/lib/legal";
import { recordTermsAcceptance } from "@/lib/legal.functions";

export function useSecurityNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getAcceptance()) setShow(true);
  }, []);

  const accept = () => {
    saveAcceptance();
    setShow(false);
    void recordTermsAcceptance({
      data: { terms_version: TERMS_VERSION, source: "security_notice" },
    }).catch(() => {});
  };

  return { show, accept };
}

export function SecurityNoticeModal({ show, onAccept }: { show: boolean; onAccept: () => void }) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  function handleContinue() {
    if (!checked) {
      setError(true);
      return;
    }
    onAccept();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="Aviso de segurança do Shape em V"
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-primary/20 bg-[#141414] shadow-2xl"
          >
            <div className="h-1 w-full gold-gradient" />

            <div className="overflow-y-auto px-5 pb-5 pt-5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl gold-gradient">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="mt-3 text-center text-lg font-black leading-tight text-gold-gradient">
                Bem-vindo ao Shape em V
              </h2>
              <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
                Este é o aplicativo oficial do método Shape em V, do Fernando Cantarelli.
              </p>

              <div className="mt-4 space-y-2">
                <NoticeItem
                  icon={<Globe className="h-3.5 w-3.5 text-primary" />}
                  text={
                    <>
                      Por segurança, o acesso ao Shape em V acontece somente pela versão web
                      oficial, através deste link:{" "}
                      <span className="font-semibold text-primary">{OFFICIAL_URL}</span>
                    </>
                  }
                />
                <NoticeItem
                  icon={<Ban className="h-3.5 w-3.5 text-primary" />}
                  text="Você não precisa baixar nenhum aplicativo, arquivo, programa, APK ou extensão no seu celular para acessar o Shape em V."
                />
                <NoticeItem
                  icon={<AlertTriangle className="h-3.5 w-3.5 text-primary" />}
                  text="Se alguém enviar um link para baixar um aplicativo, instalar algo no celular ou acessar uma página diferente dizendo ser o Shape em V, não faça o download e não informe seus dados."
                />
                <NoticeItem
                  icon={<ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                  text="O acesso deve ser feito apenas pelo navegador, usando o mesmo e-mail informado na compra."
                />
              </div>

              <p className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-muted-foreground">
                O Shape em V não se responsabiliza por acessos, downloads, aplicativos, links,
                páginas, perfis, mensagens, grupos ou cobranças feitas fora do link oficial
                informado acima.
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setChecked(e.target.checked);
                    if (e.target.checked) setError(false);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]"
                />
                <span className="text-[11px] leading-snug text-foreground">
                  Declaro que entendi que o Shape em V é acessado somente pelo link oficial, que não
                  preciso baixar nenhum aplicativo e que li e aceito os{" "}
                  <Link to="/termos-de-uso" className="text-primary underline underline-offset-2">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    to="/politica-de-privacidade"
                    className="text-primary underline underline-offset-2"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <p className="mt-2 text-center text-[11px] font-medium text-destructive">
                  Para continuar, confirme que você leu e entendeu o aviso de segurança.
                </p>
              )}

              <button
                onClick={handleContinue}
                aria-disabled={!checked}
                className={`mt-4 h-12 w-full rounded-2xl text-sm font-bold transition-all ${
                  checked
                    ? "gold-gradient text-primary-foreground shadow-gold-sm active:scale-[0.98]"
                    : "cursor-not-allowed border border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                ENTENDI, ACESSAR O SHAPE EM V
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NoticeItem({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#1B1B1B] p-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-[11px] leading-snug text-muted-foreground">{text}</p>
    </div>
  );
}

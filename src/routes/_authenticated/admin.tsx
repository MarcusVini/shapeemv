import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportTableCsv } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const TABLES = [
  { key: "app_users", label: "Usuários (app_users)" },
  { key: "assessments", label: "Avaliações (assessments)" },
  { key: "workouts", label: "Treinos (workouts)" },
  { key: "quiz_drafts", label: "Rascunhos (quiz_drafts)" },
] as const;

const TOKEN_KEY = "shapeemv:admin_token";

function AdminPage() {
  const exportFn = useServerFn(exportTableCsv);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  function download(name: string, csv: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${name}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleExport(table: (typeof TABLES)[number]["key"]) {
    if (!token.trim()) {
      toast.error("Informe o token de admin");
      return;
    }
    setBusy(table);
    try {
      const res = await exportFn({ data: { token: token.trim(), table } });
      localStorage.setItem(TOKEN_KEY, token.trim());
      download(table, res.csv);
      toast.success(`${table}: ${res.count} registros exportados`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao exportar";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin · Exportar dados</h1>
            <p className="text-sm text-muted-foreground">
              Baixe os dados das tabelas em CSV.
            </p>
          </div>
        </header>

        <div className="rounded-lg border border-border bg-card p-4">
          <label className="text-sm font-medium">Token de admin</label>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole o ADMIN_TOKEN"
            className="mt-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Configurado como secret <code>ADMIN_TOKEN</code> no servidor.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TABLES.map((t) => (
            <Button
              key={t.key}
              variant="outline"
              className="h-auto justify-between py-4"
              disabled={busy !== null}
              onClick={() => handleExport(t.key)}
            >
              <span className="text-left">
                <span className="block font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">
                  Baixar CSV
                </span>
              </span>
              {busy === t.key ? (
                <span className="text-xs">…</span>
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

/** Feedback visual de sucesso/erro nas mensagens retornadas por server actions. */
export function MensagemStatus({
  sucesso,
  erro,
}: {
  sucesso?: string;
  erro?: string;
}) {
  if (!sucesso && !erro) return null;
  return (
    <p
      role="status"
      className={cn(
        "rounded-lg border px-3 py-2 text-xs font-semibold",
        erro
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {erro ?? sucesso}
    </p>
  );
}

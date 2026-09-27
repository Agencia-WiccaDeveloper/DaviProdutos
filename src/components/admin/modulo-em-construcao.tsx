import { PackageX } from "lucide-react";

export function ModuloEmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          {titulo}
        </h1>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <PackageX className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm text-slate-500">
          Este módulo será entregue na próxima fase.
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  titulo: string;
  subtitulo?: string;
  href?: string;
  labelAcao?: string;
  className?: string;
};

/** Cabeçalho de seção da home com ação "ver mais". */
export function SectionHeader({
  titulo,
  subtitulo,
  href,
  labelAcao = "Ver tudo",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          {titulo}
        </h2>
        {subtitulo ? (
          <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
        >
          {labelAcao}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

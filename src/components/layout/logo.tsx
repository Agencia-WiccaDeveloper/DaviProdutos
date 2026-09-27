import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Em telas pequenas mostra só o monograma + DAVI. */
  compacto?: boolean;
};

export function Logo({ className, compacto = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DAVI PRODUTOS — Página inicial"
      className={cn(
        "flex items-center gap-2 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 font-display text-xl font-bold text-white shadow-sm"
      >
        D
      </span>
      <span
        className={cn(
          "font-display text-lg leading-none font-bold tracking-wide text-brand-900",
          compacto ? "block sm:text-lg" : "sm:text-xl lg:text-2xl",
        )}
      >
        DAVI
        <span className="text-brand-600"> PRODUTOS</span>
      </span>
    </Link>
  );
}

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  nota: number;
  total: number;
  className?: string;
  /** Tamanho das estrelas em px. */
  tamanho?: number;
};

/** Estrelas de avaliação com nota média e total de comentários. */
export function RatingStars({
  nota,
  total,
  className,
  tamanho = 14,
}: RatingStarsProps) {
  const cheias = Math.floor(nota);
  const temMeia = nota - cheias >= 0.5;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Avaliação: ${nota} de 5 estrelas, ${total} avaliações`}
    >
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const preenchida = i < cheias || (i === cheias && temMeia);
          return (
            <Star
              key={i}
              style={{ width: tamanho, height: tamanho }}
              className={cn(
                "shrink-0",
                preenchida
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200",
              )}
            />
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700">
        {nota > 0 ? nota.toFixed(1) : "—"}
      </span>
      {total > 0 ? (
        <span className="text-xs text-slate-400">({total})</span>
      ) : null}
    </div>
  );
}

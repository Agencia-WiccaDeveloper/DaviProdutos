import { cn } from "@/lib/utils";

/** Bloco de carregamento (skeleton) com shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200/70",
        className,
      )}
    />
  );
}

/** Grid de skeletons para a home/catálogo em carregamento. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

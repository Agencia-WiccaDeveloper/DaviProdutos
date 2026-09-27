import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="font-display text-lg font-bold tracking-wide text-slate-800">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
};

const toneClasses = {
  brand: "bg-brand-100 text-brand-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-100 text-slate-700",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

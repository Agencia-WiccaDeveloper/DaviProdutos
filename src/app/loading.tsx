import { Container } from "@/components/layout/container";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <Container className="py-6 sm:py-8">
      {/* Hero skeleton */}
      <Skeleton className="mb-6 h-44 w-full rounded-2xl sm:h-56" />

      {/* Grid skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}

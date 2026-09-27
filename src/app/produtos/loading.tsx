import { Container } from "@/components/layout/container";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProdutosLoading() {
  return (
    <Container className="py-6 sm:py-8">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-5 h-4 w-40" />
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}

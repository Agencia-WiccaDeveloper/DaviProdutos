import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <Container className="py-12">
      <EmptyState
        icon={Heart}
        title="Nenhum favorito ainda"
        description="Toque no coração dos produtos para salvá-los aqui."
      />
    </Container>
  );
}

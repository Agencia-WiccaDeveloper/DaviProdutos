import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Phone, ShoppingCart, Truck, User } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MenuDrawer } from "@/components/layout/menu-drawer";
import { SearchBar } from "@/components/layout/search-bar";
import { Button } from "@/components/ui/button";
import { listarCategorias } from "@/services/categorias";
import { HeaderClient } from "@/components/layout/header-client";
import { contarItensCarrinho } from "@/lib/session-cart";
import { lerSessao } from "@/lib/auth";
import { lerCarrinho } from "@/services/carrinho";
import { MiniCart } from "@/components/layout/mini-cart";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import type { CategoriaResumo } from "@/services/categorias";

function ActionLink({
  href,
  icon: Icon,
  label,
  badge,
  className,
}: {
  href: string;
  icon: typeof User;
  label: string;
  badge?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-w-11 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700 ${className ?? ""}`}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      <span className="hidden text-[10px] font-semibold leading-none lg:block">
        {label}
      </span>
      {badge ? (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white lg:-right-1">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export async function Header() {
  let categorias: CategoriaResumo[] = [];
  try {
    categorias = await listarCategorias();
  } catch {
    categorias = [];
  }
  const contagemCarrinho = await contarItensCarrinho();
  const sessao = await lerSessao();
  const itensCarrinho = await lerCarrinho();

  // Foto do usuário logado
  let avatarUsuario: string | null = null;
  if (sessao) {
    const [u] = await db
      .select({ avatar: users.avatar })
      .from(users)
      .where(eq(users.id, sessao.uid))
      .limit(1);
    avatarUsuario = u?.avatar ?? null;
  }

  return (
    <>
      <MiniCart inicial={itensCarrinho} />
      <header className="relative z-40">
      {/* Topbar */}
      <div className="bg-brand-950 text-brand-100">
        <Container className="flex h-9 items-center justify-between text-[11px] sm:text-xs">
          <p className="flex items-center gap-1.5 truncate">
            <Truck className="h-3.5 w-3.5 shrink-0 text-brand-300" aria-hidden />
            <span className="truncate">
              Frete grátis acima de R$ 199 · Compra 100% segura
            </span>
          </p>
          <p className="hidden items-center gap-4 sm:flex">
            <a
              href="tel:+5511999990000"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden /> (11) 99999-0000
            </a>
            <Link
              href="/produtos"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Rastrear pedido
            </Link>
          </p>
        </Container>
      </div>

      {/* Barra principal */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <Container className="flex items-center gap-2 py-3 sm:gap-4">
          <HeaderClient categorias={categorias} />

          <Logo compacto className="mr-auto lg:mr-0" />

          {/* Busca — desktop */}
          <div className="hidden flex-1 px-2 md:block">
            <SearchBar className="max-w-2xl mx-auto" />
          </div>

          {/* Ações */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {sessao ? (
              <Link
                href="/conta"
                className="relative hidden min-w-11 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700 sm:flex"
              >
                <span className="relative h-6 w-6 overflow-hidden rounded-full bg-brand-100">
                  {avatarUsuario ? (
                    <Image
                      src={avatarUsuario}
                      alt=""
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-brand-700">
                      {sessao.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="hidden text-[10px] font-semibold leading-none lg:block">
                  {sessao.nome.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <ActionLink
                href="/conta"
                icon={User}
                label="Minha conta"
                className="hidden sm:flex"
              />
            )}
            <ActionLink
              href="/favoritos"
              icon={Heart}
              label="Favoritos"
            />
            <ActionLink
              href="/carrinho"
              icon={ShoppingCart}
              label="Carrinho"
              badge={String(contagemCarrinho)}
            />
          </div>
        </Container>

        {/* Busca — mobile */}
        <Container className="pb-3 md:hidden">
          <SearchBar />
        </Container>
      </div>

      {/* Navegação de categorias */}
      <div className="border-b border-slate-200 bg-white">
        {/* Desktop */}
        <nav
          aria-label="Categorias"
          className="hidden lg:block"
        >
          <Container>
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/produtos?ofertas=1"
                  className="flex items-center gap-1.5 px-3 py-3 text-sm font-bold text-brand-600 transition-colors hover:text-brand-800"
                >
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?ordenar=novidades"
                  className="px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
                >
                  Novidades
                </Link>
              </li>
              <li aria-hidden className="mx-2 h-5 w-px bg-slate-200" />
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/produtos?categoria=${cat.slug}`}
                    className="block px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
                  >
                    {cat.nome}
                  </Link>
                </li>
              ))}
              <li className="ml-auto">
                <Button
                  size="sm"
                  className="pointer-events-none bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-700"
                >
                  Até 25% OFF
                </Button>
              </li>
            </ul>
          </Container>
        </nav>
      </div>
      </header>
    </>
  );
}

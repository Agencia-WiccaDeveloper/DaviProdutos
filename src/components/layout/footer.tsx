import Link from "next/link";
import {
  CreditCard,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

const colunas = [
  {
    titulo: "Institucional",
    links: [
      { label: "Sobre a DAVI PRODUTOS", href: "#" },
      { label: "Nossas lojas", href: "#" },
      { label: "Trabalhe conosco", href: "#" },
      { label: "Seja um revendedor", href: "#" },
    ],
  },
  {
    titulo: "Atendimento",
    links: [
      { label: "Central de atendimento", href: "#" },
      { label: "Minha conta", href: "/conta" },
      { label: "Meus pedidos", href: "/conta" },
      { label: "Rastrear pedido", href: "#" },
    ],
  },
  {
    titulo: "Políticas",
    links: [
      { label: "Política de privacidade", href: "#" },
      { label: "Trocas e devoluções", href: "#" },
      { label: "Frete e entregas", href: "#" },
      { label: "Termos de uso", href: "#" },
    ],
  },
];

const redes = [
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: FacebookIcon, label: "Facebook", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

const pagamentos = ["PIX", "Visa", "Mastercard", "Elo"];

export function Footer() {
  // ===FOOTER-CONTEUDO===
  return (
    <footer className="mt-auto bg-brand-950 text-slate-300">
      {/* Faixa de garantias */}
      <div className="border-b border-white/10">
        <Container className="grid grid-cols-1 gap-5 py-6 sm:grid-cols-3">
          <p className="flex items-center gap-3 text-xs sm:text-sm">
            <ShieldCheck
              className="h-5 w-5 shrink-0 text-brand-400"
              aria-hidden
            />
            <span>
              <strong className="block text-white">Compra 100% segura</strong>
              Site protegido e dados criptografados
            </span>
          </p>
          <p className="flex items-center gap-3 text-xs sm:text-sm">
            <Truck className="h-5 w-5 shrink-0 text-brand-400" aria-hidden />
            <span>
              <strong className="block text-white">Envio rápido</strong>
              Frete grátis acima de R$ 199
            </span>
          </p>
          <p className="flex items-center gap-3 text-xs sm:text-sm">
            <CreditCard
              className="h-5 w-5 shrink-0 text-brand-400"
              aria-hidden
            />
            <span>
              <strong className="block text-white">Pague como preferir</strong>
              PIX ou cartão em até 12x
            </span>
          </p>
        </Container>
      </div>

      {/* Colunas */}
      <Container className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 md:col-span-4 lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-slate-400 sm:text-sm">
            Produtos profissionais para lavagem, limpeza e estética automotiva.
            Qualidade, confiança e resultado de detailing em cada item.
          </p>
          <div className="mt-5 flex gap-2">
            {redes.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-200 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {colunas.map((col) => (
          <nav key={col.titulo} aria-label={col.titulo}>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-300">
              {col.titulo}
            </h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 transition-colors hover:text-white sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      {/* Atendimento + pagamentos */}
      <Container className="flex flex-col gap-4 border-t border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <a
            href="tel:+5511999990000"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-brand-400" aria-hidden />
            (11) 99999-0000
          </a>
          <a
            href="mailto:contato@daviprodutos.com.br"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-brand-400" aria-hidden />
            contato@daviprodutos.com.br
          </a>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-brand-400" aria-hidden />
            Site seguro
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5" aria-label="Formas de pagamento">
          {pagamentos.map((p) => (
            <span
              key={p}
              className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      </Container>

      {/* Copyright */}
      <div className="border-t border-white/10 bg-brand-900/60 py-4">
        <Container className="text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} DAVI PRODUTOS · CNPJ 00.000.000/0001-00
          · Todos os direitos reservados.
        </Container>
      </div>
    </footer>
  );
}

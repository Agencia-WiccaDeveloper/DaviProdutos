/**
 * Seed de desenvolvimento — DAVI PRODUTOS
 * Dados 100% fictícios. Executar: npx tsx src/db/seed.ts
 */
process.loadEnvFile(".env.local");

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import {
  addresses,
  cartItems,
  carts,
  categories,
  coupons,
  favorites,
  notifications,
  orderItems,
  orders,
  productImages,
  products,
  reviews,
  users,
} from "./schema";

const slugify = (nome: string) =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const img = (slug: string, n = 1) =>
  `https://picsum.photos/seed/davi-${slug}-${n}/800/800`;

async function main() {
  const connection = mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 5,
  });
  const db = drizzle(connection, { schema, mode: "default" });

  console.log("🧹 Limpando tabelas...");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(reviews);
  await db.delete(favorites);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(notifications);
  await db.delete(coupons);
  await db.delete(addresses);
  await db.delete(users);
  await db.delete(categories);

  console.log("👤 Usuários...");
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaCliente = await bcrypt.hash("cliente123", 10);

  const [admin, cliente] = await db
    .insert(users)
    .values([
      {
        nome: "Davi Administrador",
        email: "admin@daviprodutos.com.br",
        senhaHash: senhaAdmin,
        telefone: "(11) 99999-0001",
        cpf: "111.444.777-35",
        role: "ADMIN",
      },
      {
        nome: "Cliente Teste da Silva",
        email: "cliente@teste.com.br",
        senhaHash: senhaCliente,
        telefone: "(11) 98888-0002",
        cpf: "222.333.666-88",
        role: "CUSTOMER",
      },
    ])
    .$returningId();

  const clienteId = cliente.id;

  console.log("📍 Endereços...");
  const [endereco] = await db
    .insert(addresses)
    .values([
      {
        userId: clienteId,
        destinatario: "Cliente Teste da Silva",
        cep: "01310-100",
        rua: "Avenida Paulista",
        numero: "1000",
        complemento: "Apto 42",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        referencia: "Próximo à estação Trianon-Masp",
        principal: true,
      },
      {
        userId: clienteId,
        destinatario: "Cliente Teste da Silva (Trabalho)",
        cep: "04538-133",
        rua: "Rua Joaquim Floriano",
        numero: "500",
        bairro: "Itaim Bibi",
        cidade: "São Paulo",
        estado: "SP",
        referencia: "Portão da garagem",
        principal: false,
      },
    ])
    .$returningId();

  console.log("📂 Categorias...");
  const listaCategorias = [
    ["Lavagem", "Espumas, shampoos neutros e tudo para lavar sem manchar a pintura."],
    ["Shampoos Automotivos", "Shampoos concentrados, com cera e de contato seguro."],
    ["Ceras", "Ceras de carnaúba, selantes e líquidas para brilho e proteção."],
    ["Descontaminantes", "Removedores de piche, alcatrão e contaminantes ferrosos."],
    ["Limpadores", "Multiuso, APC, limpadores de interior e de vidros."],
    ["Microfibras", "Toalhas, aplicadores e panos de alta absorção sem risco de riscos."],
    ["Acessórios", "Baldes, escovas, pulverizadores e organização."],
    ["Kits", "Kits completos de lavagem e estética com preço especial."],
  ] as const;

  await db.insert(categories).values(
    listaCategorias.map(([nome, descricao]) => ({
      nome,
      slug: slugify(nome),
      descricao,
    })),
  );

  const cats = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const catId = (slug: string) => {
    const found = cats.find((c) => c.slug === slug);
    if (!found) throw new Error(`Categoria não encontrada: ${slug}`);
    return found.id;
  };

  // ===PRODUTOS===
  console.log("🛍️ Produtos...");
  const prefixos: Record<string, string> = {
    lavagem: "LAV",
    "shampoos-automotivos": "SHA",
    ceras: "CER",
    descontaminantes: "DES",
    limpadores: "LIM",
    microfibras: "MIC",
    acessorios: "ACE",
    kits: "KIT",
  };
  const skusPorCategoria = new Map<number, number>();

  type NovoProduto = {
    cat: string;
    nome: string;
    preco: string;
    promo?: string;
    custo: string;
    estoque: number;
    destaque?: boolean;
    curta: string;
  };

  const listaProdutos: NovoProduto[] = [
    { cat: "shampoos-automotivos", nome: "Shampoo Neutro Concentrado 1,5L", preco: "59.90", promo: "44.90", custo: "22.00", estoque: 45, destaque: true, curta: "Shampoo neutro pH 7, rende até 50 lavagens." },
    { cat: "shampoos-automotivos", nome: "Shampoo com Cera 750ml", preco: "39.90", custo: "14.00", estoque: 60, curta: "Limpa e deixa camada de cera em uma etapa." },
    { cat: "ceras", nome: "Cera de Carnaúba Premium 300g", preco: "89.90", custo: "38.00", estoque: 25, destaque: true, curta: "Brilho molhado e proteção de até 3 meses." },
    { cat: "ceras", nome: "Cera Líquida Spray 500ml", preco: "49.90", promo: "39.90", custo: "18.00", estoque: 40, curta: "Aplicação rápida com resultado espelhado." },
    { cat: "descontaminantes", nome: "Removedor de Piche e Prego 500ml", preco: "54.90", custo: "21.00", estoque: 30, curta: "Remove piche, prego e alcatrão com segurança." },
    { cat: "descontaminantes", nome: "Descontaminante Ferro Plus 500ml", preco: "68.90", promo: "59.90", custo: "26.00", estoque: 18, destaque: true, curta: "Elimina contaminação ferrosa em minutos." },
    { cat: "limpadores", nome: "Limpador Multiuso APC 5L", preco: "79.90", custo: "30.00", estoque: 22, curta: "Diluição de 1:5 a 1:20 para todo o interior." },
    { cat: "limpadores", nome: "Limpador de Interior Citrus 750ml", preco: "34.90", custo: "12.00", estoque: 50, curta: "Remove oleosidade com perfume cítrico." },
    { cat: "microfibras", nome: "Toalha Microfibra Secagem 40x60cm", preco: "29.90", custo: "9.00", estoque: 120, destaque: true, curta: "Absorve 8x o peso, sem risco de riscos." },
    { cat: "microfibras", nome: "Kit 6 Toalhas Microfibra Multiuso", preco: "99.90", promo: "79.90", custo: "34.00", estoque: 35, curta: "Kit com bordas não costuradas, 380gsm." },
    { cat: "acessorios", nome: "Balde Profissional com Rodela 20L", preco: "89.90", custo: "36.00", estoque: 15, curta: "Separa sujidade e reduz riscos na lavagem." },
    { cat: "acessorios", nome: "Escova de Rodas Soft 45cm", preco: "42.90", custo: "15.00", estoque: 28, curta: "Cerdas macias para rodas e frisos delicados." },
    { cat: "acessorios", nome: "Pulverizador Profissional 1,5L", preco: "62.90", custo: "24.00", estoque: 20, curta: "Resistência química e jato ajustável." },
    { cat: "lavagem", nome: "Espuma de Neve Snow Foam 1L", preco: "74.90", promo: "64.90", custo: "28.00", estoque: 32, destaque: true, curta: "Espuma densa para pré-lavagem sem toques." },
    { cat: "kits", nome: "Kit Lavagem Completa 5 Peças", preco: "249.90", promo: "199.90", custo: "92.00", estoque: 12, destaque: true, curta: "Shampoo + cera + toalha + balde + aplicador." },
  ];

  const produtosInseridos = await db
    .insert(products)
    .values(
      listaProdutos.map((p) => {
        const categoriaId = catId(p.cat);
        const seq = (skusPorCategoria.get(categoriaId) ?? 0) + 1;
        skusPorCategoria.set(categoriaId, seq);
        const indiceCategoria = cats.findIndex((c) => c.slug === p.cat);
        const prefixo = prefixos[p.cat] ?? "GEN";
        void indiceCategoria;
        return {
          categoryId: categoriaId,
          nome: p.nome,
          slug: slugify(p.nome),
          descricao: `${p.curta} Produto profissional da linha DAVI PRODUTOS, desenvolvido para uso em lavagem e estética automotiva com máxima segurança para as superfícies e fácil aplicação. Rendimento testado no uso diário por profissionais do ramo.`,
          descricaoCurta: p.curta,
          sku: `DP-${prefixo}-${String(seq).padStart(3, "0")}`,
          preco: p.preco,
          precoPromocional: p.promo ?? null,
          custo: p.custo,
          estoque: p.estoque,
          peso: "0.850",
          altura: "25.00",
          largura: "12.00",
          comprimento: "12.00",
          destaque: p.destaque ?? false,
        };
      }),
    )
    .$returningId();

  console.log("🖼️ Imagens...");
  const todosProdutos = await db
    .select({ id: products.id, slug: products.slug })
    .from(products);
  await db.insert(productImages).values(
    todosProdutos.flatMap((p) => [
      { productId: p.id, url: img(p.slug, 1), alt: p.slug, ordem: 0, principal: true },
      { productId: p.id, url: img(p.slug, 2), alt: `${p.slug} ângulo 2`, ordem: 1, principal: false },
    ]),
  );

  const prodId = (slug: string) => {
    const found = todosProdutos.find((p) => p.slug === slug);
    if (!found) throw new Error(`Produto não encontrado: ${slug}`);
    return found.id;
  };
  void produtosInseridos;

  console.log("⭐ Reviews e favoritos...");
  await db.insert(reviews).values([
    { userId: cliente.id, productId: prodId("shampoo-neutro-concentrado-1-5l"), nota: 5, comentario: "Espuma incrível e rende muito. Melhor custo-benefício que já usei.", status: "APPROVED" },
    { userId: admin.id, productId: prodId("cera-de-carnauba-premium-300g"), nota: 5, comentario: "Brilho espelhado de verdade. Aplicação fácil e rápida.", status: "APPROVED" },
    { userId: cliente.id, productId: prodId("toalha-microfibra-secagem-40x60cm"), nota: 4, comentario: "Absorve muito bem; achei um pouco grande para carros pequenos.", status: "APPROVED" },
    { userId: admin.id, productId: prodId("kit-lavagem-completa-5-pecas"), nota: 5, comentario: "Kit completo, chegou tudo certinho. Recomendo para começar no detailing.", status: "APPROVED" },
  ]);

  await db.insert(favorites).values([
    { userId: clienteId, productId: prodId("espuma-de-neve-snow-foam-1l") },
    { userId: clienteId, productId: prodId("cera-de-carnauba-premium-300g") },
  ]);

  console.log("📦 Pedidos...");
  const [pedido1, pedido2] = await db
    .insert(orders)
    .values([
      {
        userId: clienteId,
        addressId: endereco.id,
        subtotal: "104.70",
        desconto: "0.00",
        frete: "19.90",
        total: "124.60",
        status: "DELIVERED",
        pagamento: "PIX",
      },
      {
        userId: clienteId,
        addressId: endereco.id,
        subtotal: "112.70",
        desconto: "11.27",
        frete: "0.00",
        total: "101.43",
        status: "PROCESSING",
        pagamento: "CARTAO",
        observacoes: "Embrulhar para presente se possível.",
      },
    ])
    .$returningId();

  await db.insert(orderItems).values([
    { orderId: pedido1.id, productId: prodId("shampoo-neutro-concentrado-1-5l"), nomeProduto: "Shampoo Neutro Concentrado 1,5L", sku: "DP-SHA-001", quantidade: 1, precoUnitario: "44.90", subtotal: "44.90" },
    { orderId: pedido1.id, productId: prodId("toalha-microfibra-secagem-40x60cm"), nomeProduto: "Toalha Microfibra Secagem 40x60cm", sku: "DP-MIC-001", quantidade: 2, precoUnitario: "29.90", subtotal: "59.80" },
    { orderId: pedido2.id, productId: prodId("limpador-de-interior-citrus-750ml"), nomeProduto: "Limpador de Interior Citrus 750ml", sku: "DP-LIM-002", quantidade: 2, precoUnitario: "34.90", subtotal: "69.80" },
    { orderId: pedido2.id, productId: prodId("escova-de-rodas-soft-45cm"), nomeProduto: "Escova de Rodas Soft 45cm", sku: "DP-ACE-002", quantidade: 1, precoUnitario: "42.90", subtotal: "42.90" },
  ]);

  console.log("🎟️ Cupons e notificações...");
  await db.insert(coupons).values([
    { codigo: "DAVI10", tipo: "PERCENTUAL", valor: "10.00", validade: new Date("2027-12-31T23:59:59Z"), limiteUso: 100 },
    { codigo: "PRIMEIRACOMPRA", tipo: "VALOR_FIXO", valor: "20.00", validade: new Date("2027-06-30T23:59:59Z"), limiteUso: 50 },
    { codigo: "FRETEGRATIS", tipo: "FRETE_GRATIS", valor: "0.00", validade: new Date("2027-12-31T23:59:59Z"), limiteUso: 200 },
  ]);

  await db.insert(notifications).values([
    { userId: clienteId, titulo: "Pedido entregue!", mensagem: "Seu pedido foi entregue. Avalie os produtos e acumule vantagens na próxima compra.", tipo: "PEDIDO" },
    { userId: clienteId, titulo: "Promoção da semana", mensagem: "Shampoos e ceras com até 25% OFF por tempo limitado.", tipo: "PROMOCAO" },
  ]);

  console.log("🛒 Carrinho de exemplo...");
  await db.insert(carts).values({ userId: clienteId });

  const [contUsers] = await db.select({ n: sql<number>`count(*)` }).from(users);
  const [contProd] = await db.select({ n: sql<number>`count(*)` }).from(products);
  const [contOrders] = await db.select({ n: sql<number>`count(*)` }).from(orders);
  console.log(
    `🎉 Seed concluído: ${contUsers.n} usuários, ${contProd.n} produtos, ${contOrders.n} pedidos.`,
  );

  await connection.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Falha no seed:", err);
    process.exit(1);
  });

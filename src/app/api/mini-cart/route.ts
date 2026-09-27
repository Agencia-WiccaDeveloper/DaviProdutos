import { NextResponse } from "next/server";
import { lerCarrinho } from "@/services/carrinho";

/** GET /api/mini-cart — dados do carrinho para o drawer. */
export async function GET() {
  const itens = await lerCarrinho();
  return NextResponse.json({ itens });
}

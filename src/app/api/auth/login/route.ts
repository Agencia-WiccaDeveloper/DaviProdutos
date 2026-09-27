import { NextRequest, NextResponse } from "next/server";
import { entrar } from "@/app/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
    }

    // Simulate FormData for the entrar action
    const formData = new FormData();
    formData.set("email", email);
    formData.set("senha", senha);

    // The entrar action uses redirect() which throws NEXT_REDIRECT
    // We need to catch that and return success instead
    try {
      await entrar({}, formData);
    } catch (e: any) {
      // next/navigation redirect throws an error we can detect
      if (e?.digest?.startsWith("NEXT_REDIRECT")) {
        return NextResponse.json({ ok: true });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ erro: e.message ?? "Erro ao fazer login" }, { status: 400 });
  }
}
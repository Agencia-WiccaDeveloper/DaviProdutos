import "server-only";

/**
 * Notificação de novos pedidos via WhatsApp (WhatsApp Cloud API — Meta).
 * =====================================================================
 * Envia para o ADMINISTRADOR (dono da loja) uma mensagem com os detalhes
 * de cada compra realizada, independente da forma de pagamento.
 *
 * Variáveis necessárias (configure no .env.local):
 * - WHATSAPP_ACCESS_TOKEN   (token permanente do app Meta)
 * - WHATSAPP_PHONE_NUMBER_ID (ID do número de telefone do app)
 * - WHATSAPP_ADMIN_PHONE    (número do dono, ex: 5511999999999)
 *
 * Se não configurado, registra em log (dev) e não falha o fluxo.
 */

export type DadosPedidoWhatsApp = {
  pedidoId: number;
  cliente: string;
  email: string;
  telefone: string | null;
  pagamento: string;
  entrega: string;
  itens: { nome: string; quantidade: number; subtotal: string }[];
  subtotal: string;
  frete: string;
  total: string;
};

function montarMensagem(d: DadosPedidoWhatsApp): string {
  const linhasItens = d.itens
    .map((i) => `• ${i.quantidade}x ${i.nome} — R$ ${i.subtotal}`)
    .join("\n");

  return [
    `🛒 *NOVO PEDIDO #${d.pedidoId} — DAVI PRODUTOS*`,
    "",
    `👤 *Cliente:* ${d.cliente}`,
    `📧 E-mail: ${d.email}`,
    d.telefone ? `📱 Telefone: ${d.telefone}` : "",
    `💳 *Pagamento:* ${d.pagamento}`,
    `🚚 *Entrega:* ${d.entrega}`,
    "",
    "*Itens:*",
    linhasItens,
    "",
    `Subtotal: R$ ${d.subtotal}`,
    `Frete: R$ ${d.frete}`,
    `*Total: R$ ${d.total}*`,
    "",
    `Acompanhe: ${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/pedidos/${d.pedidoId}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export async function notificarNovoPedidoWhatsApp(
  dados: DadosPedidoWhatsApp,
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

  const mensagem = montarMensagem(dados);

  if (!token || !phoneNumberId || !adminPhone) {
    // Sem credenciais configuradas: registra em log (não falha o fluxo).
    console.log(
      `[whatsapp] notificação pendente (não configurado) — pedido #${dados.pedidoId}:\n${mensagem}`,
    );
    return;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone,
          type: "text",
          text: { body: mensagem },
        }),
      },
    );

    if (!res.ok) {
      const erro = await res.text().catch(() => "");
      console.error(`[whatsapp] falha ao enviar (${res.status}): ${erro}`);
    }
  } catch (e) {
    console.error("[whatsapp] erro de rede ao enviar:", e);
  }
}

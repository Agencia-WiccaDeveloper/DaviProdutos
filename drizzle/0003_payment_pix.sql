-- Migration 0003: colunas adicionais para o fluxo PIX (Mercado Pago).
-- payment_method_id: identificador do meio de pagamento no gateway ("pix", "visa", etc.).
-- payment_qr_code / payment_qr_code64: dados do QR Code PIX (copia-e-cola + base64).
ALTER TABLE orders
  ADD COLUMN payment_method_id VARCHAR(30) NULL,
  ADD COLUMN payment_qr_code TEXT NULL,
  ADD COLUMN payment_qr_code64 TEXT NULL;

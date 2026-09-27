-- Migration 0004: expiração do PIX, código de retirada e avatar (foto de perfil).
-- payment_expires_at: data/hora em que o QR Code PIX expira (criado + 1h).
-- pickup_code: código único de retirada na loja (gerado no servidor).
-- pickup_at: quando a retirada foi confirmada (impede reutilização do código).
-- users.avatar: ampliado de VARCHAR para TEXT para suportar foto de perfil (base64).
ALTER TABLE orders
  ADD COLUMN payment_expires_at DATETIME NULL,
  ADD COLUMN pickup_code VARCHAR(20) NULL,
  ADD COLUMN pickup_at DATETIME NULL;

ALTER TABLE users MODIFY COLUMN avatar TEXT NULL;

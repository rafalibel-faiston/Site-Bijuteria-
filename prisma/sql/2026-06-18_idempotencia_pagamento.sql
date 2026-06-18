-- Migração: idempotência de pedido + referência de pagamento (webhook)
-- Aditiva e não-destrutiva (colunas nullable). O projeto usa `prisma db push`,
-- então o caminho recomendado é rodar `npm run db:push` apontando para o banco.
-- Este SQL é a alternativa manual (psql / cliente do Postgres).
--
-- ORDEM SEGURA (zero downtime):
--   1. Rode este SQL (ou `npm run db:push`) no banco de PRODUÇÃO.
--   2. Só depois faça o merge do PR (deploy do código que usa as colunas).
-- O código atual em produção ignora colunas novas, então o passo 1 é seguro.

ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "pagamentoRef" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Pedido_idempotencyKey_key" ON "Pedido" ("idempotencyKey");
CREATE UNIQUE INDEX IF NOT EXISTS "Pedido_pagamentoRef_key" ON "Pedido" ("pagamentoRef");

-- =========================================================================
-- ÁTRIOS OBRA & GESTÃO - ADICIONAR COLUNA 'supplies' NO SUPABASE
-- Comando único e direto: Não depende de outras colunas nem cria índices
-- =========================================================================

ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS supplies JSONB DEFAULT '[]'::jsonb;

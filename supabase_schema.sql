-- =========================================================================
-- ÁTRIOS OBRA & GESTÃO - SCHEMA COMPLETO DO BANCO DE DADOS (SUPABASE POSTGRESQL)
-- =========================================================================

-- Tabela: companies (Empresas e Usuários)
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  plan TEXT DEFAULT 'free',
  address TEXT,
  nif TEXT,
  phone TEXT,
  website TEXT,
  logo TEXT,
  "qrCode" TEXT,
  "subscriptionExpiresAt" TEXT,
  "isManual" BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT true,
  "canEditSensitiveData" BOOLEAN DEFAULT false,
  "unlockRequested" BOOLEAN DEFAULT false,
  "lastLocale" TEXT DEFAULT 'pt',
  master_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: budgets (Orçamentos, Obras e Pedidos)
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "clientPhone" TEXT,
  "clientNif" TEXT,
  "workLocation" TEXT,
  notes TEXT,
  date TEXT,
  validity TEXT,
  status TEXT DEFAULT 'pending',
  "totalAmount" NUMERIC DEFAULT 0,
  "totalPaid" NUMERIC DEFAULT 0,
  "servicesSelected" JSONB DEFAULT '[]'::jsonb,
  items JSONB DEFAULT '[]'::jsonb,
  expenses JSONB DEFAULT '[]'::jsonb,
  supplies JSONB DEFAULT '[]'::jsonb,
  payments JSONB DEFAULT '[]'::jsonb,
  "projectFiles" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de busca para budgets
CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON public.budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON public.budgets(created_at DESC);

-- Tabela: products (Catálogo de Materiais e Produtos)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT,
  description TEXT,
  image TEXT,
  price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: store_orders (Pedidos da Loja)
CREATE TABLE IF NOT EXISTS public.store_orders (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  "productId" TEXT,
  "productName" TEXT,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  "uploadedImage" TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: push_subscriptions (Notificações Push)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id TEXT PRIMARY KEY,
  subscription TEXT,
  token TEXT,
  plan TEXT,
  "companyId" TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: intro_banners (Banners Promocionais e de Apresentação)
CREATE TABLE IF NOT EXISTS public.intro_banners (
  id TEXT PRIMARY KEY,
  tag TEXT DEFAULT 'DESTAQUE',
  tag_color TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  desktop_image_url TEXT,
  accent_color TEXT DEFAULT '#ff5722',
  highlights JSONB DEFAULT '[]'::jsonb,
  mockup_badge TEXT DEFAULT 'DESTAQUE',
  mockup_headline TEXT,
  mockup_details JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

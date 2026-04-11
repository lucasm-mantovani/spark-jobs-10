-- ============================================================
-- FASE 1: Criar tabelas de vagas e candidatos
-- ============================================================

-- 1. Tabela de vagas
CREATE TABLE public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  behavioral_criteria TEXT NOT NULL DEFAULT '',
  hiring_model TEXT NOT NULL DEFAULT 'CLT' CHECK (hiring_model IN ('CLT', 'PJ', 'Estágio', 'Freelancer', 'Temporário')),
  salary_min INTEGER NOT NULL DEFAULT 0,
  salary_max INTEGER NOT NULL DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

-- Admins e recrutadores podem gerenciar vagas
CREATE POLICY "Authenticated users can view vagas" ON public.vagas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and recruiters can insert vagas" ON public.vagas
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')
  );

CREATE POLICY "Admins and recruiters can update vagas" ON public.vagas
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')
  );

CREATE POLICY "Admins can delete vagas" ON public.vagas
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Candidatos anônimos podem visualizar vagas ativas (para o formulário público)
CREATE POLICY "Public can view active vagas" ON public.vagas
  FOR SELECT TO anon
  USING (status = 'active');


-- 2. Tabela de candidatos
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  vaga_id UUID REFERENCES public.vagas(id) ON DELETE CASCADE NOT NULL,
  vaga_title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo', 'Triado', 'Entrevistado', 'Teste', 'Contratado', 'Rejeitado')),
  answers JSONB NOT NULL DEFAULT '{}',
  ai_scores JSONB DEFAULT '{}',
  resume_url TEXT,
  notes JSONB NOT NULL DEFAULT '[]',
  history JSONB NOT NULL DEFAULT '[]',
  tests JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Admins e recrutadores podem ver e gerenciar candidatos
CREATE POLICY "Authenticated users can view candidates" ON public.candidates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update candidates" ON public.candidates
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')
  );

CREATE POLICY "Admins can delete candidates" ON public.candidates
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Candidatos anônimos podem se inscrever (formulário público)
CREATE POLICY "Public can insert candidates" ON public.candidates
  FOR INSERT TO anon
  WITH CHECK (true);


-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER vagas_updated_at
  BEFORE UPDATE ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

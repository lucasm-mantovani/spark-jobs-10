
-- Create vagas table
CREATE TABLE public.vagas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  behavioral_criteria TEXT NOT NULL DEFAULT '',
  hiring_model TEXT NOT NULL DEFAULT 'CLT',
  salary_min NUMERIC NOT NULL DEFAULT 0,
  salary_max NUMERIC NOT NULL DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vagas" ON public.vagas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can view active vagas" ON public.vagas
  FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Admins can insert vagas" ON public.vagas
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vagas" ON public.vagas
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vagas" ON public.vagas
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  vaga_title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Novo',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  resume_url TEXT,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view candidates" ON public.candidates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert candidates" ON public.candidates
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public can insert candidates" ON public.candidates
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates" ON public.candidates
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete candidates" ON public.candidates
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

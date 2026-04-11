
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;

-- Recreate with proper checks
CREATE POLICY "Authenticated users can insert candidates" ON public.candidates
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')
  );

CREATE POLICY "Authenticated users can update candidates" ON public.candidates
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')
  );

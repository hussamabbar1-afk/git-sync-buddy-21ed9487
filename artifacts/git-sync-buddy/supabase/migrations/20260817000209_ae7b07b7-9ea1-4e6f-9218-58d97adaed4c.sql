GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company's leads"
ON public.leads FOR SELECT TO authenticated
USING (company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()));
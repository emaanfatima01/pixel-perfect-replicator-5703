DROP POLICY "profiles readable by signed in" ON public.profiles;
CREATE POLICY "profiles own or coordinator read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY "ann read" ON public.announcements;
CREATE POLICY "ann read for app roles" ON public.announcements FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'supervisor'::public.app_role)
  OR public.has_role(auth.uid(), 'student'::public.app_role)
);
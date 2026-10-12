import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Role } from "@/lib/fyp";

export type Me = { id: string; email: string; profile: Profile | null; role: Role };

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<Me | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      const list = (roles ?? []).map((r) => r.role);
      const role: Role = list.includes("admin") ? "admin" : list.includes("supervisor") ? "supervisor" : "student";
      return { id: u.user.id, email: u.user.email ?? "", profile, role };
    },
  });
}

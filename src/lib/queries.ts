import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Me } from "@/lib/auth";

export function useProjects(me: Me | null | undefined) {
  return useQuery({
    enabled: !!me,
    queryKey: ["projects", me?.id, me?.role],
    queryFn: async () => {
      let q = supabase
        .from("projects")
        .select("*, student:profiles!projects_student_id_fkey(id, full_name, reg_number), supervisor:profiles!projects_supervisor_id_fkey(id, full_name)")
        .order("updated_at", { ascending: false });
      if (me!.role === "student") q = q.eq("student_id", me!.id);
      if (me!.role === "supervisor") q = q.eq("supervisor_id", me!.id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useMilestonesFor(projectIds: string[]) {
  return useQuery({
    enabled: projectIds.length > 0,
    queryKey: ["milestones", projectIds],
    queryFn: async () => {
      const { data, error } = await supabase.from("milestones").select("*").in("project_id", projectIds).order("position");
      if (error) throw error;
      return data;
    },
  });
}

export function useFeedbackFor(projectIds: string[]) {
  return useQuery({
    enabled: projectIds.length > 0,
    queryKey: ["feedback", projectIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*, author:profiles!feedback_author_id_fkey(full_name)")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export async function openDocument(path: string) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
  if (error || !data) throw error ?? new Error("Could not open file");
  window.open(data.signedUrl, "_blank", "noopener");
}

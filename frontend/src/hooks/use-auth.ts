import { useQuery } from "@tanstack/react-query";
import { fetchParentProfile } from "@/api/auth";

export function useParentProfile() {
  return useQuery({
    queryKey: ["parentProfile"],
    queryFn: fetchParentProfile,
    enabled: !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000,
  });
}

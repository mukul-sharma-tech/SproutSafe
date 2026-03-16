import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChildren,
  addChild,
  fetchWebUsageStats,
  fetchWebUsageStatsFull,
  fetchBlockedStats,
  fetchBlockedStatsFull,
  fetchAlerts,
  fetchAlertsFull,
  fetchActivities,
  fetchNotifications,
  clearAlerts,
  blockUrl,
  unblockUrl,
} from "@/api/children";
import { toast } from "sonner";

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: fetchChildren,
    enabled: !!localStorage.getItem("token"),
    staleTime: 30 * 1000,
  });
}

export function useAddChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string }) => addChild(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      toast.success("Child added successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add child");
    },
  });
}

export function useWebUsageStats(email: string | null) {
  return useQuery({
    queryKey: ["webUsageStats", email],
    queryFn: () => fetchWebUsageStats(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useWebUsageStatsFull(email: string | null) {
  return useQuery({
    queryKey: ["webUsageStatsFull", email],
    queryFn: () => fetchWebUsageStatsFull(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useBlockedStats(email: string | null) {
  return useQuery({
    queryKey: ["blockedStats", email],
    queryFn: () => fetchBlockedStats(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useBlockedStatsFull(email: string | null) {
  return useQuery({
    queryKey: ["blockedStatsFull", email],
    queryFn: () => fetchBlockedStatsFull(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useAlerts(email: string | null) {
  return useQuery({
    queryKey: ["alerts", email],
    queryFn: () => fetchAlerts(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useAlertsFull(email: string | null) {
  return useQuery({
    queryKey: ["alertsFull", email],
    queryFn: () => fetchAlertsFull(email!),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useActivities(email: string | null, timeFrame: string) {
  return useQuery({
    queryKey: ["activities", email, timeFrame],
    queryFn: () => fetchActivities(email!, timeFrame),
    enabled: !!email,
    refetchInterval: 10_000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!localStorage.getItem("token"),
    refetchInterval: 15_000,
  });
}

export function useClearAlerts(email: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearAlerts(email!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts", email] });
      qc.invalidateQueries({ queryKey: ["alertsFull", email] });
      toast.success("All alerts dismissed");
    },
    onError: () => {
      toast.error("Failed to dismiss alerts");
    },
  });
}

export function useBlockUrl(email: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => blockUrl(email!, url),
    onSuccess: (_data, url) => {
      qc.invalidateQueries({ queryKey: ["blockedStatsFull", email] });
      qc.invalidateQueries({ queryKey: ["blockedStats", email] });
      toast.success(`${url} has been blocked`);
    },
    onError: () => {
      toast.error("Failed to block website");
    },
  });
}

export function useUnblockUrl(email: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => unblockUrl(email!, url),
    onSuccess: (_data, url) => {
      qc.invalidateQueries({ queryKey: ["blockedStatsFull", email] });
      qc.invalidateQueries({ queryKey: ["blockedStats", email] });
      toast.success(`${url} has been unblocked`);
    },
    onError: () => {
      toast.error("Failed to unblock website");
    },
  });
}

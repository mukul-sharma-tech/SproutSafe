import apiClient from "./client";
import type {
  Child,
  WebUsageStats,
  WebUsageStatsFull,
  BlockedStats,
  BlockedStatsFull,
  AlertsResponse,
  ActivitiesResponse,
} from "@/types/models";

export async function fetchChildren(): Promise<Child[]> {
  const { data } = await apiClient.get("/api/parent/children");
  return data;
}

export async function addChild(payload: { name: string; email: string }): Promise<{ token: string }> {
  const { data } = await apiClient.post("/api/child/add-child", payload);
  return data;
}

export async function fetchWebUsageStats(email: string): Promise<WebUsageStats> {
  const { data } = await apiClient.get(`/api/child/web-usage/${email}`);
  return data;
}

export async function fetchWebUsageStatsFull(email: string): Promise<WebUsageStatsFull> {
  const { data } = await apiClient.get(`/api/child/web-usagefull/${email}`);
  return data;
}

export async function fetchBlockedStats(email: string): Promise<BlockedStats> {
  const { data } = await apiClient.get(`/api/child/blocked/${email}`);
  return data;
}

export async function fetchBlockedStatsFull(email: string): Promise<BlockedStatsFull> {
  const { data } = await apiClient.get(`/api/child/blockedfull/${email}`);
  return data;
}

export async function fetchAlerts(email: string): Promise<AlertsResponse> {
  const { data } = await apiClient.get(`/api/child/alerts/${email}`);
  return data;
}

export async function fetchAlertsFull(email: string): Promise<AlertsResponse> {
  const { data } = await apiClient.get(`/api/child/alertsfull/${email}`);
  return data;
}

export async function fetchActivities(childEmail: string, timeFrame: string): Promise<ActivitiesResponse> {
  const { data } = await apiClient.post("/api/child/web-usage-filtered", { childEmail, timeFrame });
  return data;
}

export async function clearAlerts(email: string): Promise<void> {
  await apiClient.delete(`/api/child/delete-alerts/${email}`);
}

export async function blockUrl(email: string, url: string): Promise<void> {
  await apiClient.post("/api/parent/children/block", { url, email });
}

export async function unblockUrl(email: string, url: string): Promise<void> {
  await apiClient.post("/api/parent/children/unblock", { url, email });
}

export async function generateChildToken(id: string): Promise<{ token: string }> {
  const { data } = await apiClient.post(`/api/parent/children/${id}/token`);
  return data;
}

export async function fetchNotifications(): Promise<any[]> {
  const { data } = await apiClient.get("/api/parent/notifications");
  return Array.isArray(data) ? data : data?.notifications ?? [];
}

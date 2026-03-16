import apiClient from "./client";

export interface TimedBlock {
  _id: string;
  domain: string;
  expiresAt: string;
  createdAt: string;
}

export async function fetchTimedBlocks(): Promise<TimedBlock[]> {
  const { data } = await apiClient.get("/api/timed-blocks");
  return data;
}

export async function addTimedBlock(domain: string, minutes: number): Promise<TimedBlock> {
  const { data } = await apiClient.post("/api/timed-blocks", { domain, minutes });
  return data;
}

export async function removeTimedBlock(id: string): Promise<void> {
  await apiClient.delete(`/api/timed-blocks/${id}`);
}

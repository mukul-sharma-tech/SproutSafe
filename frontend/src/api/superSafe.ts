import apiClient from "./client";

export interface SuperSafeSettings {
  enabled: boolean;
  blockExtensionsPage: boolean;
  customBlockedWords: string[];
  voiceMessageUrl: string | null;
}

export interface AllowedSite {
  _id: string;
  domain: string;
  createdAt: string;
}

export async function fetchSuperSafeSettings(): Promise<SuperSafeSettings> {
  const { data } = await apiClient.get("/api/supersafe/settings");
  return data;
}

export async function updateSuperSafeToggle(enabled: boolean): Promise<SuperSafeSettings> {
  const { data } = await apiClient.put("/api/supersafe/toggle", { enabled });
  return data;
}

export async function updateBlockExtensionsPage(enabled: boolean): Promise<{ blockExtensionsPage: boolean }> {
  const { data } = await apiClient.put("/api/supersafe/toggle-block-extensions", { enabled });
  return data;
}

export async function fetchAllowedSites(): Promise<AllowedSite[]> {
  const { data } = await apiClient.get("/api/supersafe/allowed-sites");
  return data;
}

export async function addAllowedSite(domain: string): Promise<AllowedSite> {
  const { data } = await apiClient.post("/api/supersafe/allowed-sites", { domain });
  return data;
}

export async function deleteAllowedSite(id: string): Promise<void> {
  await apiClient.delete(`/api/supersafe/allowed-sites/${id}`);
}

export async function addCustomBlockedWord(word: string): Promise<{ customBlockedWords: string[] }> {
  const { data } = await apiClient.post("/api/supersafe/custom-blocked-words", { word });
  return data;
}

export async function removeCustomBlockedWord(word: string): Promise<{ customBlockedWords: string[] }> {
  const { data } = await apiClient.delete("/api/supersafe/custom-blocked-words", { data: { word } });
  return data;
}

export async function uploadVoiceMessage(formData: FormData): Promise<{ voiceMessageUrl: string }> {
  const { data } = await apiClient.post("/api/supersafe/voice-message", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchVoiceMessage(): Promise<{ voiceMessageUrl: string | null }> {
  const { data } = await apiClient.get("/api/supersafe/voice-message");
  return data;
}


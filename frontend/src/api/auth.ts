import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

export interface ParentProfile {
  name: string;
  email: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/login", payload);
  return data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/signup", payload);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.put("/api/auth/change-password", { currentPassword, newPassword });
  return data;
}

export async function fetchParentProfile(): Promise<ParentProfile> {
  const { data } = await apiClient.get("/api/auth/user");
  return data;
}

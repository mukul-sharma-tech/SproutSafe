// Auth flow is now handled directly via JWT in AuthModal.
// This file is kept as a stub for any residual imports.
export async function handlePostAuth(_user: {
  email: string;
  name?: string;
  sub: string;
}): Promise<{ isVerified: boolean }> {
  return { isVerified: true };
}

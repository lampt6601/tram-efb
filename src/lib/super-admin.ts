export const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? "tranhuucanh2000@gmail.com";

export function checkIsSuperAdmin(email: string | undefined | null): boolean {
  return !!email && email === SUPER_ADMIN_EMAIL;
}

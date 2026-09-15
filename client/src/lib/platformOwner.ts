export const PLATFORM_OWNER_EMAIL = "dominiquereed35@gmail.com";
export const PLATFORM_OWNER_OPEN_ID = "2cUjYc8q9VsFQXVDdB5U6U";

export function isPlatformOwner(
  user: { email?: string | null; openId?: string | null } | null | undefined
): boolean {
  const emailMatches = user?.email?.trim().toLowerCase() === PLATFORM_OWNER_EMAIL;
  const openIdMatches = user?.openId === PLATFORM_OWNER_OPEN_ID;
  return emailMatches || openIdMatches;
}

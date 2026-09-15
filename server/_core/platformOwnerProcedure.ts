import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";
import { ENV } from "./env";

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isCanonicalPlatformOwner(user: { email?: string | null; openId?: string | null }) {
  const emailMatches = normalizeEmail(user.email) === ENV.ownerEmail;
  const openIdMatches = Boolean(ENV.ownerOpenId) && user.openId === ENV.ownerOpenId;
  return emailMatches || openIdMatches;
}

export const platformOwnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isCanonicalPlatformOwner(ctx.user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform owner access is restricted to the designated owner account.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

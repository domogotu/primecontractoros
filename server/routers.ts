import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    signup: publicProcedure
      .input(z.object({
        legalBusinessName: z.string(),
        dba: z.string().optional(),
        businessEmail: z.string().email(),
        phone: z.string().optional(),
        website: z.string().optional(),
        state: z.string().optional(),
        entityType: z.string().optional(),
        fullName: z.string(),
        loginEmail: z.string().email(),
        password: z.string().min(8),
        jobTitle: z.string().optional(),
        userPhone: z.string().optional(),
        accessChoice: z.enum(["trial", "limited", "paid"]),
      }))
      .mutation(async ({ input }) => {
        // For now, just return success - full implementation would create workspace/user
        return {
          success: true,
          message: "Workspace created successfully",
          workspaceId: "ws_" + Math.random().toString(36).substr(2, 9),
        };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        // For now, just return success - full implementation would verify credentials
        return {
          success: true,
          message: "Login successful",
          user: {
            id: "user_" + Math.random().toString(36).substr(2, 9),
            email: input.email,
            name: "User",
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;

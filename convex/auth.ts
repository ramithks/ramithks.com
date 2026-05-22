import { query } from "./_generated/server";
import { v } from "convex/values";

export const verifyPasscode = query({
  args: { passcode: v.string() },
  handler: async (_ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    return args.passcode === adminPassword;
  },
});

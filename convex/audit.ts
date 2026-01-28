import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
    args: {
        action: v.string(),
        actorId: v.string(),
        actorName: v.string(),
        resourceId: v.optional(v.string()),
        resourceType: v.optional(v.string()),
        details: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        return await ctx.db.query("auditLogs")
            .order("desc")
            .take(limit);
    },
});

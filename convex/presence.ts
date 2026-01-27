import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("presence")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastSeen: Date.now(),
                online: true,
            });
        } else {
            await ctx.db.insert("presence", {
                userId: args.userId,
                lastSeen: Date.now(),
                online: true,
            });
        }
    },
});

export const getOnline = query({
    args: { userIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const now = Date.now();
        const threshold = 60 * 1000; // 1 minute timeout

        const presenceList = await Promise.all(
            args.userIds.map(async (userId) => {
                const presence = await ctx.db
                    .query("presence")
                    .withIndex("by_userId", (q) => q.eq("userId", userId))
                    .first();

                if (presence && (now - presence.lastSeen < threshold)) {
                    return userId;
                }
                return null;
            })
        );

        return presenceList.filter(Boolean) as string[];
    },
});

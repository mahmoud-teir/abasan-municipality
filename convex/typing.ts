import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
    args: {
        conversationId: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                expiresAt: now + 5000, // 5 seconds expiry
            });
        } else {
            await ctx.db.insert("typing", {
                conversationId: args.conversationId,
                userId: args.userId,
                expiresAt: now + 5000,
            });
        }
    },
});

export const getTyping = query({
    args: { conversationId: v.string() },
    handler: async (ctx, args) => {
        const now = Date.now();
        // Clean up old typing indicators? Ideally done via cron or on-read filter.
        // For now, valid typing is expiresAt > now
        const typers = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return typers.filter(t => t.expiresAt > now).map(t => t.userId);
    },
});

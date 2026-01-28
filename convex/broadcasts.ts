import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
    args: {
        title: v.string(),
        message: v.string(),
        type: v.string(),
        audience: v.string(),
        sentBy: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("broadcasts", {
            ...args,
            timestamp: Date.now(),
        });

        // In a real app, this would also trigger push notifications 
        // or create individual user notifications here.
        // For now, it just records the broadcast which the frontend can listen to.
    },
});

export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    // ... existing code ...
    handler: async (ctx, args) => {
        const limit = args.limit || 20;
        return await ctx.db.query("broadcasts")
            .order("desc")
            .take(limit);
    },
});

export const deleteBroadcast = mutation({
    args: { id: v.id("broadcasts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

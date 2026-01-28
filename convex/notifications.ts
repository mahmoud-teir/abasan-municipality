import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(20);
    },
});

export const unreadCount = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("read"), false))
            .collect();
        return notifications.length;
    },
});

export const send = mutation({
    args: {
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            ...args,
            read: false,
        });
    },
});

export const markRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { read: true });
    },
});

export const markAllRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("read"), false))
            .collect();

        for (const notification of notifications) {
            await ctx.db.patch(notification._id, { read: true });
        }
    },
});
export const sendBatch = mutation({
    args: {
        notifications: v.array(v.object({
            userId: v.string(),
            title: v.string(),
            message: v.string(),
            link: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        for (const notification of args.notifications) {
            await ctx.db.insert("notifications", {
                ...notification,
                read: false,
            });
        }
    },
});

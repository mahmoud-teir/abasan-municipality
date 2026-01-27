import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(), // User who is reading (to exclude their own messages)
    },
    handler: async (ctx, args) => {
        // Find all unread messages in this conversation NOT sent by this user
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.and(
                q.neq(q.field("senderId"), args.userId),
                q.eq(q.field("read"), false)
            ))
            .collect();

        // Mark them as read
        for (const msg of unreadMessages) {
            await ctx.db.patch(msg._id, { read: true });
        }

        // Also reset conversation unread count if applicable (handled in conversations.ts usually, but good to sync)
        // Actually conversations.ts markAsRead resets to 0. Ideally we call that one.
    },
});

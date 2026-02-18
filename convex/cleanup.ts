import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Delete conversations older than the specified number of days
export const cleanupOldConversations = internalMutation({
    args: {
        maxAgeDays: v.optional(v.number()), // Default: 30 days
    },
    handler: async (ctx, args) => {
        const maxAgeDays = args.maxAgeDays ?? 30;
        const cutoffTimestamp = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

        // Find old conversations (closed ones first, then any old ones)
        const oldConversations = await ctx.db
            .query("conversations")
            .filter((q) => q.lt(q.field("lastMessageAt"), cutoffTimestamp))
            .collect();

        let deletedCount = 0;

        for (const conversation of oldConversations) {
            // Delete all messages in this conversation
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conversation._id)
                )
                .collect();

            for (const msg of messages) {
                // If message has a file, delete from storage too
                if (msg.fileId) {
                    try {
                        await ctx.storage.delete(msg.fileId);
                    } catch {
                        // File might already be deleted, ignore
                    }
                }
                await ctx.db.delete(msg._id);
            }

            // Delete typing indicators for this conversation
            const typingIndicators = await ctx.db
                .query("typing")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conversation._id)
                )
                .collect();

            for (const indicator of typingIndicators) {
                await ctx.db.delete(indicator._id);
            }

            // Delete the conversation itself
            await ctx.db.delete(conversation._id);
            deletedCount++;
        }

        console.log(
            `[Cleanup] Deleted ${deletedCount} old conversations (older than ${maxAgeDays} days)`
        );

        return { deletedCount };
    },
});

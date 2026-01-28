import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {
        requestId: v.optional(v.string()),
        conversationId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        if (args.requestId) {
            return await ctx.db
                .query("messages")
                .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
                .order("asc")
                .collect();
        }

        if (args.conversationId) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
                .order("asc")
                .collect();

            return await Promise.all(
                messages.map(async (msg) => ({
                    ...msg,
                    fileUrl: msg.fileId ? await ctx.storage.getUrl(msg.fileId) : undefined,
                }))
            );
        }

        return [];
    },
});

export const send = mutation({
    args: {
        requestId: v.optional(v.string()),
        conversationId: v.optional(v.string()),
        content: v.string(),
        senderId: v.string(),
        senderName: v.string(),
        senderRole: v.string(),
        senderImage: v.optional(v.string()),
        contentType: v.optional(v.string()),
        fileId: v.optional(v.id("_storage")),
        fileName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            ...args,
            read: false
        });

        if (args.conversationId) {
            const conversation = await ctx.db.get(args.conversationId as any);
            if (conversation && 'unreadCount' in conversation) {
                // Determine if increment unread (if sender is not admin, increment for admin)
                // Simplify: just increment unreadCount if senderRole is CITIZEN
                const inc = args.senderRole !== 'ADMIN' && args.senderRole !== 'SUPER_ADMIN' ? 1 : 0;

                await ctx.db.patch(args.conversationId as any, {
                    lastMessageAt: Date.now(),
                    lastMessagePreview: args.content.substring(0, 50),
                    unreadCount: (conversation.unreadCount as number) + inc,
                    status: 'OPEN' // Re-open if closed
                });

                // Notify Participant if sender is Admin
                if (args.senderRole === 'ADMIN' || args.senderRole === 'SUPER_ADMIN') {
                    await ctx.db.insert("notifications", {
                        userId: conversation.participantId,
                        title: "رسالة جديدة من البلدية",
                        message: args.content.substring(0, 100),
                        link: "/citizen/chat", // Assuming there is a chat page or popup, actually global widget opens anywhere
                        read: false,
                    });
                }
            }
        }
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.messageId);
    },
});

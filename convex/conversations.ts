import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or Create conversation for a citizen
export const getOrCreate = mutation({
    args: {
        participantId: v.string(),
        participantName: v.string(),
        participantEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if exists AND is OPEN
        const existing = await ctx.db
            .query("conversations")
            .withIndex("by_participantId", (q) => q.eq("participantId", args.participantId))
            .filter((q) => q.eq(q.field("status"), "OPEN"))
            .first();

        if (existing) {
            return existing._id;
        }

        // Create new
        const id = await ctx.db.insert("conversations", {
            participantId: args.participantId,
            participantName: args.participantName,
            participantEmail: args.participantEmail,
            lastMessageAt: Date.now(),
            unreadCount: 0,
            status: "OPEN",
        });

        // Seed initial welcome message? Optional.

        return id;
    },
});

export const deleteConversation = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        // Delete conversation
        await ctx.db.delete(args.conversationId);

        // Delete messages associated
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }
    },
});

// Get conversation details
export const get = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});

// List all conversations (for Admin)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_status") // Optimize later
            .order("desc") // Order by creation/last message ideally
            .collect();
    },
});

// Mark as read (for Admin)
export const markAsRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            unreadCount: 0,
        });

        // We should also ideally mark all messages as read here, but that is heavy. 
        // Best to let client call proper separate mutation or do it here. 
        // For simplicity: We trust that client calls this when opening.
    },
});

// Close conversation
export const close = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            status: "CLOSED",
        });
    },
});

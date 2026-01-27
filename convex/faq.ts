import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { isAdminOnly: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("canned_responses");

        if (args.isAdminOnly !== undefined) {
            // In a real app we would index this or filter in memory if small
            // Since we don't have an index on isAdminOnly yet and dataset is small, filter is fine
            const all = await q.order("desc").collect();
            return all.filter(faq => faq.isAdminOnly === args.isAdminOnly);
        }

        return await q.order("desc").collect();
    },
});

export const create = mutation({
    args: {
        question: v.string(),
        answer: v.string(),
        isAdminOnly: v.boolean(),
        createdBy: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("canned_responses", args);
    },
});

export const deleteFAQ = mutation({
    args: { id: v.id("canned_responses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

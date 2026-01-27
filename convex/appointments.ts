import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const book = mutation({
    args: {
        citizenId: v.optional(v.string()),
        citizenName: v.string(),
        citizenEmail: v.optional(v.string()),
        citizenPhone: v.optional(v.string()),
        department: v.string(),
        reason: v.string(),
        date: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("appointments", {
            ...args,
            status: "pending",
        });
    },
});

export const list = query({
    args: { status: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const q = ctx.db.query("appointments");
        if (args.status) {
            const status = args.status;
            return await q.withIndex("by_status", (q) => q.eq("status", status)).order("asc").collect();
        }
        return await q.order("desc").collect();
    },
});

export const listByCitizen = query({
    args: { citizenId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("appointments")
            .withIndex("by_citizenId", (q) => q.eq("citizenId", args.citizenId))
            .order("desc")
            .collect();
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("appointments"),
        status: v.string(), // 'approved', 'rejected', 'completed'
        notes: v.optional(v.string()),
        adminId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            notes: args.notes,
            adminId: args.adminId,
        });
    },
});

export const deleteAppointment = mutation({
    args: { id: v.id("appointments") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

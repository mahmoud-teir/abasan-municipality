import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActive = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("emergency_alerts")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .order("desc") // Get latest if multiple (though allow only 1 ideally)
            .first();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        message: v.string(),
        level: v.string(), // 'info', 'warning', 'critical'
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        // Resolve any existing active alerts first to ensure only one at a time
        const existing = await ctx.db
            .query("emergency_alerts")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        for (const alert of existing) {
            await ctx.db.patch(alert._id, {
                isActive: false,
                resolvedAt: Date.now(),
            });
        }

        // Create new alert
        await ctx.db.insert("emergency_alerts", {
            ...args,
            isActive: true,
        });
    },
});

export const resolve = mutation({
    args: {
        id: v.id("emergency_alerts"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            isActive: false,
            resolvedAt: Date.now(),
        });
    },
});

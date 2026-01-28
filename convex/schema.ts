import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        requestId: v.optional(v.string()), // Made optional
        conversationId: v.optional(v.string()), // Added for global chat
        content: v.string(),
        senderId: v.string(),
        senderName: v.string(),
        senderRole: v.string(),
        senderImage: v.optional(v.string()),
        read: v.optional(v.boolean()), // Optional for backward compatibility
        contentType: v.optional(v.string()), // 'text' | 'image' | 'file'
        fileId: v.optional(v.id("_storage")),
        fileName: v.optional(v.string()),
    })
        .index("by_requestId", ["requestId"])
        .index("by_conversationId", ["conversationId"]),

    conversations: defineTable({
        participantId: v.string(), // Citizen ID
        participantName: v.string(),
        participantEmail: v.optional(v.string()),
        adminId: v.optional(v.string()), // Assigned Admin
        lastMessageAt: v.number(),
        lastMessagePreview: v.optional(v.string()),
        unreadCount: v.number(), // For Admin
        status: v.string(), // OPEN, CLOSED
    }).index("by_participantId", ["participantId"])
        .index("by_status", ["status"]),

    notifications: defineTable({
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        link: v.optional(v.string()),
        read: v.boolean(),
    }).index("by_userId", ["userId"]),

    presence: defineTable({
        userId: v.string(),
        lastSeen: v.number(),
        online: v.boolean(),
    })
        .index("by_userId", ["userId"])
        .index("by_lastSeen", ["lastSeen"]),

    typing: defineTable({
        conversationId: v.string(),
        userId: v.string(),
        expiresAt: v.number(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_expiresAt", ["expiresAt"]),

    canned_responses: defineTable({
        question: v.string(),
        answer: v.string(),
        isAdminOnly: v.boolean(),
        createdBy: v.optional(v.string())
    }).index("by_isAdminOnly", ["isAdminOnly"]),

    emergency_alerts: defineTable({
        title: v.string(),
        message: v.string(),
        level: v.string(), // 'info', 'warning', 'critical'
        isActive: v.boolean(),
        createdBy: v.string(), // Admin ID
        resolvedAt: v.optional(v.number()),
    }).index("by_isActive", ["isActive"]),

    appointments: defineTable({
        citizenId: v.optional(v.string()), // Optional for guest bookings if valid
        citizenName: v.string(),
        citizenEmail: v.optional(v.string()),
        citizenPhone: v.optional(v.string()),
        department: v.string(), // e.g. 'mayor', 'engineering', 'licenses'
        reason: v.string(),
        date: v.number(), // Timestamp of the appointment
        status: v.string(), // 'pending', 'approved', 'rejected', 'completed'
        notes: v.optional(v.string()), // Admin notes
        adminId: v.optional(v.string()), // Who processed it
    }).index("by_status", ["status"])
        .index("by_date", ["date"])
        .index("by_citizenId", ["citizenId"]),

    auditLogs: defineTable({
        action: v.string(), // e.g. 'delete_user', 'update_settings'
        actorId: v.string(), // User ID of who performed the action
        actorName: v.string(),
        resourceId: v.optional(v.string()), // ID of the object affected
        resourceType: v.optional(v.string()), // 'user', 'post', 'setting'
        details: v.optional(v.string()), // JSON string or text details
        timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]),

    broadcasts: defineTable({
        title: v.string(),
        message: v.string(),
        type: v.string(), // 'info', 'warning', 'success'
        audience: v.string(), // 'all', 'employees', 'citizens'
        sentBy: v.string(), // Admin ID
        timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]),
});

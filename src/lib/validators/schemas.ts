import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================
export const createRequestSchema = z.object({
    type: z.enum(['BUILDING_PERMIT', 'RENOVATION_PERMIT', 'DEMOLITION_PERMIT', 'LAND_DIVISION', 'OTHER']),
    propertyAddress: z.string().min(5, 'Property address is required'),
    plotNumber: z.string().optional(),
    basinNumber: z.string().optional(),
    description: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
    status: z.enum(['UNDER_REVIEW', 'NEEDS_DOCUMENTS', 'APPROVED', 'REJECTED']),
    note: z.string().optional(),
});

// ============================================
// Complaint Schemas
// ============================================
export const createComplaintSchema = z.object({
    title: z.string().min(5, 'Title is required'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.enum(['ROADS', 'WATER', 'ELECTRICITY', 'SEWAGE', 'GARBAGE', 'PARKS', 'NOISE', 'OTHER']),
    location: z.string().min(5, 'Location details are required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    image: z.any().optional(),
});

export const addResponseSchema = z.object({
    content: z.string().min(1, 'Response content is required'),
    closeComplaint: z.boolean().optional(),
});

// ============================================
// Appointment Schemas
// ============================================
export const createAppointmentSchema = z.object({
    serviceType: z.string().min(1, 'Service type is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    notes: z.string().optional(),
});

// ============================================
// Auth Schemas
// ============================================
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    nationalId: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// ============================================
// News Schemas
// ============================================
export const createNewsSchema = z.object({
    titleAr: z.string().min(5, 'Arabic title is required'),
    titleEn: z.string().min(5, 'English title is required'),
    contentAr: z.string().min(20, 'Arabic content is required'),
    contentEn: z.string().min(20, 'English content is required'),
    excerpt: z.string().optional(),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
});

// ============================================
// Type Exports
// ============================================
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateNewsInput = z.infer<typeof createNewsSchema>;

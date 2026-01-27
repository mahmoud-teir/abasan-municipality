import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

/**
 * Log a user action to the audit logs
 * 
 * @param action - The action type (e.g., 'CREATE_USER', 'UPDATE_ROLE')
 * @param details - Additional details or JSON string
 * @param targetId - ID of the entity being acted upon (optional)
 * @param actorId - ID of the user performing the action (optional, derived from session if missing)
 */
export async function logAudit({
    action,
    details,
    targetId,
    actorId
}: {
    action: string;
    details?: string;
    targetId?: string;
    actorId?: string;
}) {
    try {
        let finalActorId = actorId;

        // If no actorId provided, try to get from current session
        if (!finalActorId) {
            const session = await auth.api.getSession({
                headers: await headers()
            });
            finalActorId = session?.user.id;
        }

        // If still no actor ID, we can't log this properly (or log as 'SYSTEM' user if exists)
        if (!finalActorId) {
            console.warn(`[AuditLog] Attempted to log '${action}' without an actor ID.`);
            // In some cases we might want to allow system actions, but for now we require a user or actorId
            // We could have a specific SYSTEM_USER_ID env var.
            return;
        }

        // Get IP - simplified
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || 'unknown';

        await prisma.auditLog.create({
            data: {
                action,
                details,
                targetId,
                actorId: finalActorId,
                ipAddress: ip
            }
        });
    } catch (error) {
        // Audit log failure should not crash the app, but should be reported
        console.error('[AuditLog] Failed to create log:', error);
    }
}

import { AuditLogViewer } from "@/components/admin/audit/audit-log-viewer";
import { getTranslations } from "next-intl/server";

export default async function AuditPage() {
    const t = await getTranslations();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">Monitor system activity and security events.</p>
            </div>

            <AuditLogViewer />
        </div>
    );
}

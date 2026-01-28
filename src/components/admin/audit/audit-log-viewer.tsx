'use client';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function AuditLogViewer() {
    const logs = useQuery(api.audit.list, { limit: 100 });

    if (!logs) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent actions performed by administrators and system processes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell>
                                        <div className="font-medium">{log.actorName}</div>
                                        <div className="text-xs text-muted-foreground">ID: {log.actorId.slice(0, 8)}...</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {log.action}
                                        </Badge>
                                        {log.details && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title={log.details}>
                                                {log.details}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {log.resourceType && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {log.resourceType}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {log.resourceId?.slice(0, 8)}...
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <div className="text-sm">{format(new Date(log.timestamp), "MMM d, HH:mm")}</div>
                                        <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "yyyy")}</div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

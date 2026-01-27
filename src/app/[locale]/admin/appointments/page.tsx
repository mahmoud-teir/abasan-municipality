'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth/auth-client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminAppointmentsPage() {
    const { data: session } = useSession();
    const appointments = useQuery(api.appointments.list, {});
    const updateStatus = useMutation(api.appointments.updateStatus);

    const [selectedAppt, setSelectedAppt] = useState<any>(null); // For Reject Dialog
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    const handleApprove = async (id: any) => {
        try {
            await updateStatus({
                id,
                status: 'approved',
                adminId: session?.user?.id,
            });
            toast.success('Appointment approved');
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!selectedAppt) return;
        try {
            await updateStatus({
                id: selectedAppt._id,
                status: 'rejected',
                notes: rejectReason,
                adminId: session?.user?.id,
            });
            toast.success('Appointment rejected');
            setIsRejectOpen(false);
            setRejectReason('');
            setSelectedAppt(null);
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            case 'completed': return <Badge variant="secondary">Completed</Badge>;
            default: return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
        }
    };

    if (appointments === undefined) {
        return <div className="p-8 text-center text-muted-foreground">Loading appointments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                    <p className="text-muted-foreground">Manage citizen appointment requests.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Citizen</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No appointment requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((appt) => (
                                    <TableRow key={appt._id}>
                                        <TableCell>{getStatusBadge(appt.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{appt.citizenName}</span>
                                                <span className="text-xs text-muted-foreground">{appt.citizenPhone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{appt.department.replace('_', ' ')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {format(new Date(appt.date), 'PP')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={appt.reason}>
                                            {appt.reason}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {appt.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleApprove(appt._id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedAppt(appt);
                                                            setIsRejectOpen(true);
                                                        }}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {appt.status === 'rejected' && appt.notes && (
                                                <span className="text-xs text-red-500 italic">Note: {appt.notes}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Appointment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Schedule conflict, Department unavailable..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

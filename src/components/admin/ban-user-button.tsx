'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { banUser, unbanUser } from '@/actions/user.actions';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    userId: string;
    isBanned: boolean;
    failedAttempts: number;
    userName: string;
    targetRole?: string;
};

export function BanUserButton({ userId, isBanned, failedAttempts, userName, targetRole }: Props) {
    const [loading, setLoading] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [open, setOpen] = useState(false);

    // Disable if target is Admin or Super Admin
    if (targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') {
        return null;
    }

    const handleUnban = async () => {
        setLoading(true);
        const res = await unbanUser(userId);
        if (res.success) {
            toast.success('User unbanned successfully');
        } else {
            toast.error(res.error || 'Failed to unban user');
        }
        setLoading(false);
    };

    const handleBan = async () => {
        setLoading(true);
        const res = await banUser(userId, banReason);
        if (res.success) {
            toast.success('User banned successfully');
            setOpen(false);
        } else {
            toast.error(res.error || 'Failed to ban user');
        }
        setLoading(false);
    };

    if (isBanned) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleUnban}
                disabled={loading}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 me-1" />}
                Unban
            </Button>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                    <Ban className="w-4 h-4 me-1" />
                    Ban
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Ban User: {userName}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will immediately prevent the user from logging in.
                        {failedAttempts > 0 && (
                            <div className="mt-2 p-2 bg-slate-50 rounded text-slate-700">
                                Current Failed Attempts: <span className="font-bold">{failedAttempts}</span>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 space-y-2">
                    <Label htmlFor="reason">Ban Reason (Optional)</Label>
                    <Input
                        id="reason"
                        placeholder="e.g. Violation of terms"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); handleBan(); }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                        Confirm Ban
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

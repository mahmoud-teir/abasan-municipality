'use client';

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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, XCircle } from 'lucide-react';
import { cancelRequest } from '@/actions/request.actions';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { useSession } from '@/lib/auth/auth-client';

interface CancelRequestButtonProps {
    requestId: string;
    currentStatus: string;
    label?: string;
    confirmTitle?: string;
    confirmDesc?: string;
    cancelLabel?: string;
    confirmLabel?: string;
}

export function CancelRequestButton({
    requestId,
    currentStatus,
    label = 'Cancel Request',
    confirmTitle = 'Are you sure?',
    confirmDesc = 'This action cannot be undone.',
    cancelLabel = 'Cancel',
    confirmLabel = 'Yes, Cancel Request'
}: CancelRequestButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { data: session } = useSession();

    const NON_CANCELLABLE_STATUSES = ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

    if (NON_CANCELLABLE_STATUSES.includes(currentStatus)) {
        return null;
    }

    const handleCancel = async () => {
        if (!session?.user?.id) return;

        startTransition(async () => {
            const result = await cancelRequest(requestId, session.user.id);
            if (result.success) {
                toast.success('Request cancelled successfully');
            } else {
                toast.error(result.error as string);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <XCircle className="w-4 h-4 me-2" />
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {confirmDesc}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        disabled={isPending}
                    >
                        {isPending ? '...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { updateAppointmentStatus } from '@/actions/appointment.actions';
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
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';

interface CancelAppointmentButtonProps {
    appointmentId: string;
}

export function CancelAppointmentButton({ appointmentId }: CancelAppointmentButtonProps) {
    const t = useTranslations('services.appointments.actions');
    const [isPending, startTransition] = useTransition();
    const { data: session } = useSession();

    const handleCancel = () => {
        if (!session?.user?.id) return;

        startTransition(async () => {
            const result = await cancelAppointment(appointmentId, session.user.id);
            if (result.success) {
                toast.success(t('cancelSuccess'));
            } else {
                toast.error(result.error as string);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    {t('cancel')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('cancelConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('cancelConfirmDesc')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('back')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleCancel();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {t('confirmCancel')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

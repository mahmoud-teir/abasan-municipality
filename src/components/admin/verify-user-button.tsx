'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyUser } from '@/actions/user.actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface VerifyUserButtonProps {
    userId: string;
    isVerified: boolean;
    currentUserRole: string;
}

export function VerifyUserButton({ userId, isVerified, currentUserRole }: VerifyUserButtonProps) {
    const [loading, setLoading] = useState(false);
    const t = useTranslations('admin.usersPage');

    const canVerify = currentUserRole === 'SUPER_ADMIN';

    const handleVerify = async () => {
        if (!canVerify) return;
        setLoading(true); // ...
        try {
            const result = await verifyUser(userId, !isVerified);
            if (result.success) {
                toast.success(isVerified ? 'User verification revoked' : 'User verified successfully');
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error('Error updating verification status');
        } finally {
            setLoading(false);
        }
    };

    if (isVerified) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={handleVerify}
                            disabled={!canVerify || loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Verified (Click to revoke)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={handleVerify}
                        disabled={!canVerify || loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Unverified (Click to verify)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

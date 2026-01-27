'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, ExternalLink } from 'lucide-react';

type Props = {
    imageUrl?: string | null;
    userName: string;
};

export function ViewNationalIdButton({ imageUrl, userName }: Props) {
    const [open, setOpen] = useState(false);

    if (!imageUrl) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" title="View National ID">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>National ID: {userName}</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-slate-100">
                    <img
                        src={imageUrl}
                        alt={`ID of ${userName}`}
                        className="object-contain w-full h-full"
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" asChild>
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Open Full Size
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

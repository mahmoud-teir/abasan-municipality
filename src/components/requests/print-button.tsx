'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md print:hidden"
        >
            <Printer className="w-4 h-4" />
            Print Permit / طباعة التصريح
        </Button>
    );
}

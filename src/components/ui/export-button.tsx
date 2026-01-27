'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface ExportButtonProps {
    data: any[];
    filename?: string;
    label?: string;
    className?: string;
}

export function ExportButton({ data, filename = 'export', label, className }: ExportButtonProps) {
    const t = useTranslations('common');

    const handleExport = () => {
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Generate file
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    return (
        <Button
            variant="outline"
            className={`gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 ${className}`}
            onClick={handleExport}
            disabled={!data || data.length === 0}
        >
            <FileSpreadsheet className="w-4 h-4" />
            {label || t('export')}
        </Button>
    );
}

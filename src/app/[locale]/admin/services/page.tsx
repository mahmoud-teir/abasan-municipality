import { getTranslations, getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getServiceTypes, getAllServices } from '@/actions/service.actions';
import { AddServiceDialog } from '@/components/services/add-service-dialog';
import { DeleteServiceButton } from '@/components/services/delete-service-button';
import { EditServiceDialog } from '@/components/services/edit-service-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function AdminServicesPage() {
    const t = await getTranslations();
    const locale = await getLocale();
    const result = await getAllServices();
    const services = result.success ? (result.data as any[]) : [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {t('admin.servicesMenu')}
                </h1>
                <AddServiceDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.servicesMenu')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Slug</TableHead>
                                <TableHead>Name (Ar)</TableHead>
                                <TableHead>Name (En)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-mono text-xs">{service.slug}</TableCell>
                                    <TableCell>{service.nameAr}</TableCell>
                                    <TableCell>{service.nameEn}</TableCell>
                                    <TableCell>
                                        <Badge variant={service.active ? 'default' : 'secondary'}>
                                            {service.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <EditServiceDialog service={service} />
                                            <DeleteServiceButton
                                                id={service.id}
                                                name={locale === 'ar' ? service.nameAr : service.nameEn}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

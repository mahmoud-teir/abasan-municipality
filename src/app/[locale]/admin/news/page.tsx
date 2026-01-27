import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { getAllNews } from '@/actions/news.actions';
import { DeleteNewsButton } from '@/components/admin/news/delete-news-button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function AdminNewsPage() {
    const t = await getTranslations();
    const result = await getAllNews();
    const newsList = result.success ? (result.data as any[]) : [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {t('admin.news')}
                </h1>
                <Button asChild>
                    <Link href="/admin/news/new">
                        <Plus className="w-4 h-4 me-2" />
                        {t('admin.newsPage.add')}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.newsPage.list')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {newsList.length === 0 ? (
                        <div className="text-muted-foreground text-center py-8">
                            {t('admin.newsPage.empty')}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-start">{t('admin.newsPage.table.titleAr')}</TableHead>
                                    <TableHead className="text-start">{t('admin.newsPage.table.titleEn')}</TableHead>
                                    <TableHead className="text-start">{t('admin.newsPage.table.status')}</TableHead>
                                    <TableHead className="text-start">{t('admin.newsPage.table.date')}</TableHead>
                                    <TableHead className="text-end">{t('admin.newsPage.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {newsList.map((news) => (
                                    <TableRow key={news.id}>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={news.titleAr}>
                                            {news.titleAr}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={news.titleEn}>
                                            {news.titleEn}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={news.published ? "default" : "secondary"}>
                                                {news.published ? t('admin.newsPage.table.published') : t('admin.newsPage.table.draft')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(news.publishedAt || news.createdAt), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/news/${news.id}`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <DeleteNewsButton id={news.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

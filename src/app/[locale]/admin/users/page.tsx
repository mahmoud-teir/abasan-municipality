import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { VerifyUserButton } from '@/components/admin/verify-user-button';
import { UserRoleDialog } from '@/components/admin/user-role-dialog';
import { BanUserButton } from '@/components/admin/ban-user-button';
import { ViewNationalIdButton } from '@/components/admin/view-national-id-button';
import { ExportButton } from '@/components/ui/export-button';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getRoleColor(role: string) {
    switch (role) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
            return 'text-red-600 border-red-200 bg-red-50';
        case 'EMPLOYEE':
        case 'ENGINEER':
            return 'text-blue-600 border-blue-200 bg-blue-50';
        default:
            return 'text-slate-600 border-slate-200 bg-slate-50';
    }
}

export default async function UsersPage({ searchParams }: Props) {
    const t = await getTranslations();

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const currentUserRole = session.user.role;
    const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';

    // Fetch users (simple fetch, could add pagination later)
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 for now
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('admin.dashboard')} / {t('admin.users')}</h1>
                <ExportButton
                    data={users.map(u => ({
                        Name: u.name,
                        Email: u.email,
                        Phone: u.phone,
                        'National ID': u.nationalId,
                        Role: u.role,
                        'Join Date': format(new Date(u.createdAt), 'yyyy-MM-dd'),
                        Verified: u.emailVerified ? 'Yes' : 'No',
                        Banned: u.isBanned ? 'Yes' : 'No'
                    }))}
                    filename="users_list"
                    label={t('admin.exportUsers') || 'Export Users'}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.usersPage.table.title') || 'Users List'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-start">{t('common.name')}</TableHead>
                                <TableHead className="text-start">{t('common.email')}</TableHead>
                                <TableHead className="text-center">{t('admin.usersPage.table.status')}</TableHead>
                                <TableHead className="text-start">{t('admin.usersPage.table.joinedAt')}</TableHead>
                                <TableHead className="text-start">{t('admin.usersPage.table.role')}</TableHead>
                                <TableHead className="text-end">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.nationalId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-center">
                                        <VerifyUserButton
                                            userId={user.id}
                                            isVerified={user.emailVerified}
                                            currentUserRole={currentUserRole || 'CITIZEN'}
                                        />
                                    </TableCell>
                                    <TableCell>{format(new Date(user.createdAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getRoleColor(user.role || 'CITIZEN')}>
                                            {user.role || 'CITIZEN'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <ViewNationalIdButton
                                                imageUrl={user.nationalIdImage}
                                                userName={user.name || ''}
                                            />
                                            <BanUserButton
                                                userId={user.id}
                                                isBanned={user.isBanned}
                                                failedAttempts={user.failedLoginAttempts || 0}
                                                userName={user.name || ''}
                                                targetRole={user.role || 'CITIZEN'}
                                            />
                                            <UserRoleDialog
                                                userId={user.id}
                                                currentRole={user.role || 'CITIZEN'}
                                                userName={user.name || ''}
                                                currentUserRole={currentUserRole || 'CITIZEN'}
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

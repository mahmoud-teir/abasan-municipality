import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { PermitQRCode } from '@/components/requests/permit-qr-code';
import { PrintButton } from '@/components/requests/print-button';
import Image from 'next/image';

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function PrintPermitPage({ params }: PageProps) {
    const { id, locale } = await params;
    const t = await getTranslations('requests');
    const tCommon = await getTranslations('common');
    const tMetadata = await getTranslations('metadata');

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const request = await prisma.request.findUnique({
        where: { id },
        include: {
            user: true
        }
    });

    if (!request) {
        notFound();
    }

    const userRole = (session.user as any).role;
    const isOwner = request.userId === session.user.id;
    const isEmployee = ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'ENGINEER', 'SUPERVISOR'].includes(userRole);

    if (!isOwner && !isEmployee) {
        redirect('/');
    }

    if (request.status !== 'APPROVED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold text-red-600">Permit Not Approved</h1>
                <p>This request has not been approved yet and cannot be printed.</p>
            </div>
        );
    }

    const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${request.requestNo}`;

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white p-4 print:p-0 font-sans">
            {/* Print Button (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
                <PrintButton />
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none p-8 md:p-12 min-h-[297mm] relative flex flex-col gap-8 print:w-full print:max-w-none">

                {/* Header */}
                <header className="flex justify-between items-start border-b-2 border-black/10 pb-6">
                    <div className="flex flex-col items-center w-1/3">
                        <p className="font-bold text-sm text-gray-600">State of Palestine</p>
                        <p className="font-bold text-sm text-gray-600">Abasan Alkabera Municipality</p>
                        <p className="font-bold text-sm text-gray-600">Engineering Department</p>
                    </div>

                    <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="w-24 h-24 relative">
                            {/* Placeholder for Logo if not available */}
                            <div className="w-full h-full flex items-center justify-center rounded-full border-2 border-gray-200">
                                <span className="text-xs text-gray-400">Logo</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-1/3" dir="rtl">
                        <p className="font-bold text-sm text-gray-600">دولة فلسطين</p>
                        <p className="font-bold text-sm text-gray-600">بلدية عبسان الكبيرة</p>
                        <p className="font-bold text-sm text-gray-600">الدائرة الهندسية</p>
                    </div>
                </header>

                {/* Title */}
                <div className="text-center py-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wider border-2 border-black inline-block px-8 py-2 rounded-lg">
                        {request.type === 'BUILDING_PERMIT' ? 'Building Permit' : 'Official Permit'}
                    </h1>
                    <h2 className="text-xl font-bold mt-2 font-arabic text-gray-700">
                        {request.type === 'BUILDING_PERMIT' ? 'رخصة بناء' : 'تصريح رسمي'}
                    </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    {/* Left Column (LTR) */}
                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">Permit Number</span>
                            <span className="font-mono font-bold text-lg">{request.requestNo}</span>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">Applicant Name</span>
                            <span className="font-bold text-lg">{request.user.nameEn || request.user.name}</span>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">National ID</span>
                            <span className="font-bold text-lg">{request.user.nationalId || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Right Column (RTL) */}
                    <div className="space-y-6 text-right" dir="rtl">
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">تاريخ الإصدار</span>
                            <span className="font-bold text-lg">
                                {request.completedAt ? new Date(request.completedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                            </span>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">اسم مقدم الطلب</span>
                            <span className="font-bold text-lg">{request.user.name}</span>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-gray-500 uppercase text-xs block mb-1">العنوان / الموقع</span>
                            <span className="font-bold text-lg">{request.propertyAddress}</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Info */}
                <div className="mt-4 border-2 border-gray-100 rounded-lg p-6 bg-gray-50/50">
                    <h3 className="font-bold text-center mb-4 uppercase text-gray-500 text-xs tracking-widest">Property Details / تفاصيل العقار</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p><span className="font-semibold text-gray-600 w-24 inline-block">Plot No:</span> {request.plotNumber || '-'}</p>
                            <p><span className="font-semibold text-gray-600 w-24 inline-block">Basin No:</span> {request.basinNumber || '-'}</p>
                        </div>
                        <div className="text-right" dir="rtl">
                            <p><span className="font-semibold text-gray-600 ml-2">رقم القطعة:</span> {request.plotNumber || '-'}</p>
                            <p><span className="font-semibold text-gray-600 ml-2">رقم الحوض:</span> {request.basinNumber || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {request.description && (
                    <div className="mt-2">
                        <h3 className="font-bold mb-2">Description / الوصف:</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded text-justify leading-relaxed">
                            {request.description}
                        </p>
                    </div>
                )}

                {/* Footer Section */}
                <div className="mt-auto pt-12">
                    <div className="flex justify-between items-end pb-8">
                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                            <PermitQRCode value={qrValue} />
                            <span className="text-[10px] text-gray-400 mt-1 font-mono">SCAN TO VERIFY</span>
                        </div>

                        {/* Signature */}
                        <div className="flex flex-col items-center w-64">
                            <div className="h-24 w-full border-b border-gray-300 mb-2 relative">
                                {/* Stamp Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-12 pointer-events-none">
                                    <div className="border-4 border-blue-900 rounded-full w-24 h-24 flex items-center justify-center">
                                        <span className="font-bold text-blue-900 text-xs">OFFICIAL STAMP</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-bold text-sm uppercase">Municipality Mayor</span>
                            <span className="text-xs text-gray-500">رئيس البلدية</span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-400 text-center uppercase tracking-wider">
                        This document is official and generated by Abasan Alkabera Digital Platform.
                        <br />
                        Any alteration invalidates this document.
                    </div>
                </div>
            </div>

            {/* Print Script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        function printPage() {
                            window.print();
                        }
                    `
                }}
            />
            {/* Auto-bind button to print if needed, but onClick is cleaner in Client Component. 
                Wait, onClick doesn't work in Server Component buttons unless they are client components.
                The Button component from generic UI is likely a client component or generic.
                If Button is shadcn Button, it passes props. 
                Wait, 'onClick="window.print()"' won't work in RSC directly as prop.
                I need to make the button a client component or use a wrapper.
                I'll allow the user to use browser print shortcut or fix the button.
                Actually, I'll update the button to be a client interaction in just a second.
            */ }
        </div>
    );
}

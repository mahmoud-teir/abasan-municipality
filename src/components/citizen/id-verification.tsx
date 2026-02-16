'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader2, ScanFace, Camera, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { verifyUser } from '@/actions/user.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDashboardLink } from '@/lib/role-utils';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function IdVerification() {
    const { data: session, refetch } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('verification');

    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState('');
    const [worker, setWorker] = useState<Tesseract.Worker | null>(null);
    const [workerLoading, setWorkerLoading] = useState(false);

    const userNationalId = (session?.user as any)?.nationalId as string | undefined;

    // Initialize worker on mount
    useEffect(() => {
        const initWorker = async () => {
            setWorkerLoading(true);
            try {
                const w = await createWorker(['eng', 'ara'], 1, {
                    workerPath: '/tesseract/worker.min.js',
                    corePath: '/tesseract/tesseract-core-simd.wasm.js',
                    langPath: '/tesseract/lang-data',
                    gzip: true,
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            // Progress updates are handled during recognition
                        }
                    }
                });
                setWorker(w);
            } catch (err) {
                console.error('Failed to initialize OCR worker:', err);
                toast.error(t('initializingError') || 'Failed to initialize OCR engine');
            } finally {
                setWorkerLoading(false);
            }
        };

        if (!worker && !workerLoading) {
            initWorker();
        }

        return () => {
            // Cleanup worker on unmount
            if (worker) {
                worker.terminate();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCapturedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setCapturedImage(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-scan when file is captured and worker is ready
    useEffect(() => {
        if (capturedFile && userNationalId && !scanning && worker) {
            handleScan();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capturedFile, worker]);

    /**
     * Preprocess image: grayscale + contrast boost + sharpen for better OCR results
     */
    const preprocessImage = (file: File, scale = 1): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(URL.createObjectURL(file));
                    return;
                }

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Grayscale + high contrast for ID card text
                const contrastFactor = 1.5;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                    const newColor = Math.min(255, Math.max(0, ((avg - 128) * contrastFactor) + 128));

                    data[i] = newColor;     // red
                    data[i + 1] = newColor; // green
                    data[i + 2] = newColor; // blue
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.src = URL.createObjectURL(file);
        });
    };

    /**
     * Try to find the national ID number in the OCR text.
     * Cleans both strings to digits-only and checks for inclusion.
     */
    const findNationalIdInText = (ocrText: string, targetId: string): boolean => {
        const cleanDigits = (str: string) => str.replace(/[^0-9]/g, '');
        const cleanTarget = cleanDigits(targetId);
        const cleanOcr = cleanDigits(ocrText);

        if (!cleanTarget) return false;
        return cleanOcr.includes(cleanTarget);
    };

    const handleScan = async () => {
        if (!capturedFile || !worker) return;

        if (!userNationalId) {
            toast.error(t('missingNationalIdTitle'));
            return;
        }

        setScanning(true);
        setScanProgress(t('processing'));

        try {
            let found = false;

            // Strategy 1: Try original image
            setScanProgress(t('scanningOriginal'));
            let ret = await worker.recognize(capturedFile);
            found = findNationalIdInText(ret.data.text, userNationalId);

            // Strategy 2: Try preprocessed image (grayscale + contrast)
            if (!found) {
                setScanProgress(t('enhancing'));
                const preprocessedUrl = await preprocessImage(capturedFile);
                ret = await worker.recognize(preprocessedUrl);
                found = findNationalIdInText(ret.data.text, userNationalId);
            }

            // Strategy 3: Try with 2x scaled image for small text
            if (!found) {
                setScanProgress(t('enlarging'));
                const scaledUrl = await preprocessImage(capturedFile, 2);
                ret = await worker.recognize(scaledUrl);
                found = findNationalIdInText(ret.data.text, userNationalId);
            }

            if (found) {
                toast.success(t('success'));
                if (!session?.user?.id) return;

                setScanProgress(t('updating'));
                const result = await verifyUser(session.user.id, true);

                if (result.success) {
                    await refetch();
                    router.refresh();
                    setTimeout(() => {
                        if (session?.user) {
                            router.push(`/${locale}${getDashboardLink((session.user as any).role)}`);
                        }
                    }, 2000);
                } else {
                    toast.error(result.error || t('failed'));
                }
            } else {
                toast.error(
                    t('failed'),
                    { duration: 6000 }
                );
            }

        } catch (error) {
            console.error('OCR Error:', error);
            toast.error(`${t('failed')} ${(error as any)?.message || ''}`);
        } finally {
            setScanning(false);
            setScanProgress('');
        }
    };

    // Already verified state
    if (session?.user?.emailVerified) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700">
                    {t('verified')}
                </h2>
                <p className="text-muted-foreground">
                    {t('verifiedDescription')}
                </p>
                <Button onClick={() => session?.user && router.push(`/${locale}${getDashboardLink((session.user as any).role)}`)}>
                    {t('goToDashboard')}
                </Button>
            </div>
        );
    }

    // Missing National ID state — user needs to set their nationalId in profile first
    if (!userNationalId) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                        {t('missingNationalIdTitle')}
                    </CardTitle>
                    <CardDescription>
                        {t('missingNationalIdDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={`/${locale}/citizen/settings`}>
                        <Button className="w-full">
                            {t('goToSettings')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScanFace className="w-6 h-6 text-primary" />
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}{' '}
                    ({userNationalId}).
                    <strong> {t('ensureVisible')}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 aspect-video flex flex-col items-center justify-center group hover:bg-slate-50 transition-colors">
                        {capturedImage ? (
                            <>
                                <Image src={capturedImage} alt="Captured ID" fill className="object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium">
                                        {t('clickToRetake')}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center p-8 text-center text-muted-foreground">
                                <Loader2 className={`w-12 h-12 mb-4 ${workerLoading ? 'animate-spin text-primary' : 'opacity-50'}`} />
                                {workerLoading ? (
                                    <p>{t('initializing')}</p>
                                ) : (
                                    <>
                                        <p>{t('clickToOpen')}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Native File Input covering the area */}
                        <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                            disabled={workerLoading || scanning}
                        />
                    </div>

                    <div className="flex justify-center">
                        <p className="text-xs text-muted-foreground text-center">
                            {t('tapHint')}
                        </p>
                    </div>
                </div>

                {capturedImage && (
                    <div className="space-y-2">
                        <Button
                            className="w-full"
                            onClick={handleScan}
                            disabled={scanning || !worker}
                            size="lg"
                        >
                            {scanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                    {scanProgress || t('processing')}
                                </>
                            ) : (
                                t('scanAgain')
                            )}
                        </Button>
                        {scanning && (
                            <p className="text-xs text-muted-foreground text-center animate-pulse">
                                {t('scanningHint')}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

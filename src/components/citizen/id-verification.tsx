'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader2, ScanFace, CheckCircle2, AlertTriangle, Camera } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { verifyUser } from '@/actions/user.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDashboardLink } from '@/lib/role-utils';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

/** Maximum image dimension before OCR — larger images are resized down */
const MAX_IMAGE_DIMENSION = 1500;

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

    // Initialize worker on mount — only load 'eng' for digit recognition (faster)
    useEffect(() => {
        const initWorker = async () => {
            setWorkerLoading(true);
            try {
                const w = await createWorker('eng', 1, {
                    workerPath: '/tesseract/worker.min.js',
                    corePath: '/tesseract/tesseract-core-simd.wasm.js',
                    langPath: '/tesseract/lang-data',
                    gzip: true,
                });

                // Set PSM_SINGLE_BLOCK (6) — faster for card-style documents
                await w.setParameters({
                    tessedit_pageseg_mode: 6 as any,
                    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
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
     * Resize image to max dimension and optionally apply preprocessing.
     * This prevents Tesseract from processing huge phone camera images (4000px+).
     */
    const processImage = (file: File, preprocess: boolean): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(URL.createObjectURL(file));
                    return;
                }

                // Resize to max dimension while keeping aspect ratio
                let { width, height } = img;
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                if (preprocess) {
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const data = imageData.data;

                    // Grayscale + high contrast + adaptive threshold for ID card text
                    const contrastFactor = 1.8;
                    for (let i = 0; i < data.length; i += 4) {
                        // Convert to grayscale
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        // Apply contrast boost
                        let val = ((gray - 128) * contrastFactor) + 128;
                        // Clamp to valid range
                        val = Math.min(255, Math.max(0, val));
                        // Apply adaptive threshold to sharpen text
                        val = val > 140 ? 255 : val < 80 ? 0 : val;

                        data[i] = val;
                        data[i + 1] = val;
                        data[i + 2] = val;
                    }

                    ctx.putImageData(imageData, 0, 0);
                }

                resolve(canvas.toDataURL('image/jpeg', 0.92));
            };
            img.src = URL.createObjectURL(file);
        });
    };

    /**
     * Try to find the national ID number in the OCR text.
     * Cleans both strings to digits-only and checks for inclusion.
     * Also tries partial matching (at least 7 consecutive digits match).
     */
    const findNationalIdInText = (ocrText: string, targetId: string): boolean => {
        const cleanDigits = (str: string) => str.replace(/[^0-9]/g, '');
        const cleanTarget = cleanDigits(targetId);
        const cleanOcr = cleanDigits(ocrText);

        if (!cleanTarget) return false;

        // Exact match
        if (cleanOcr.includes(cleanTarget)) return true;

        // Partial match: try matching at least 7 consecutive digits
        // This handles cases where OCR misreads 1-2 digits
        if (cleanTarget.length >= 9) {
            for (let len = cleanTarget.length; len >= Math.max(7, cleanTarget.length - 2); len--) {
                for (let start = 0; start <= cleanTarget.length - len; start++) {
                    const partial = cleanTarget.substring(start, start + len);
                    if (cleanOcr.includes(partial)) return true;
                }
            }
        }

        return false;
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

            // Pass 1: Preprocessed image (grayscale + contrast + threshold) — best for most IDs
            setScanProgress(t('enhancing'));
            const preprocessedUrl = await processImage(capturedFile, true);
            let ret = await worker.recognize(preprocessedUrl);
            found = findNationalIdInText(ret.data.text, userNationalId);

            // Pass 2: Original image resized only (fallback if preprocessing damaged text)
            if (!found) {
                setScanProgress(t('scanningOriginal'));
                const resizedUrl = await processImage(capturedFile, false);
                ret = await worker.recognize(resizedUrl);
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

    // Missing National ID state
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
                                {workerLoading ? (
                                    <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                                ) : (
                                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                                )}
                                {workerLoading ? (
                                    <p>{t('initializing')}</p>
                                ) : (
                                    <p>{t('clickToOpen')}</p>
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

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader2, ScanFace, Camera, CheckCircle2, Upload } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { verifyUser } from '@/actions/user.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDashboardLink } from '@/lib/role-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function IdVerification() {
    const { data: session, refetch } = useSession();
    const router = useRouter();

    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [scanning, setScanning] = useState(false);

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

    const handleScan = async () => {
        if (!capturedFile || !(session?.user as any)?.nationalId) {
            toast.error('Please capture an ID image first.');
            return;
        }

        setScanning(true);

        try {
            const worker = await createWorker('eng');

            const ret = await worker.recognize(capturedFile);
            const text = ret.data.text;

            console.log('Recognized text:', text);
            await worker.terminate();

            const nationalId = (session?.user as any)?.nationalId;
            const cleanText = text.replace(/\s+/g, '');

            if (cleanText.includes(nationalId)) {
                toast.success('Identity Verified Successfully!');
                if (!session?.user?.id) return;
                const result = await verifyUser(session.user.id, true);

                if (result.success) {
                    await refetch();
                    router.refresh();
                    setTimeout(() => {
                        if (session?.user) {
                            router.push(getDashboardLink((session.user as any).role));
                        }
                    }, 2000);
                } else {
                    toast.error('Failed to update status on server.');
                }
            } else {
                toast.error('Verification Failed. Could not find your National ID number in the image. Please try again with better lighting.');
            }

        } catch (error) {
            console.error(error);
            toast.error('Error processing image. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    if (session?.user?.emailVerified) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700">Account Verified</h2>
                <p className="text-muted-foreground">Your identity has been verified successfully.</p>
                <Button onClick={() => session?.user && router.push(getDashboardLink((session.user as any).role))}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScanFace className="w-6 h-6 text-primary" />
                    Identity Verification
                </CardTitle>
                <CardDescription>
                    Please use your camera to take a clear photo of your National ID ({(session?.user as any)?.nationalId}).
                    <strong> Ensure the ID number is clearly visible.</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 aspect-video flex flex-col items-center justify-center group hover:bg-slate-50 transition-colors">
                        {capturedImage ? (
                            <>
                                <Image src={capturedImage} alt="Captured ID" fill className="object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium">Click to retake</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center p-8 text-center text-muted-foreground">
                                <Camera className="w-12 h-12 mb-4 opacity-50" />
                                <p>Click to open Camera</p>
                            </div>
                        )}

                        {/* Native File Input covering the area */}
                        <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex justify-center">
                        <p className="text-xs text-muted-foreground text-center">
                            Tap the box above to open your camera. Make sure your National ID is legible.
                        </p>
                    </div>
                </div>

                {capturedImage && (
                    <Button
                        className="w-full"
                        onClick={handleScan}
                        disabled={scanning}
                        size="lg"
                    >
                        {scanning ? (
                            <>
                                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                Processing ID...
                            </>
                        ) : (
                            'Submit Verification'
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

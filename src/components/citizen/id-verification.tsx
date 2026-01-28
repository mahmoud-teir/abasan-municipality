'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader2, ScanFace, Camera, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { verifyUser } from '@/actions/user.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDashboardLink } from '@/lib/role-utils';

export function IdVerification() {
    const { data: session, refetch } = useSession();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scanning, setScanning] = useState(false);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            setCapturedImage(null);
            setCapturedFile(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
        } catch (error) {
            console.error(error);
            toast.error('Could not access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);

                // Convert to File object for Tesseract
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "id-capture.png", { type: "image/png" });
                        setCapturedFile(file);
                    }
                }, 'image/png');

                stopCamera();
            }
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
                    Identity Verification (Camera Only)
                </CardTitle>
                <CardDescription>
                    Please use your camera to take a clear photo of your National ID ({(session?.user as any)?.nationalId}).
                    <strong> Use good lighting.</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative rounded-lg overflow-hidden bg-black/10 aspect-video flex items-center justify-center border-2 border-dashed">

                    {!cameraActive && !capturedImage && (
                        <div className="flex flex-col items-center p-8 text-center text-muted-foreground">
                            <Camera className="w-12 h-12 mb-4 opacity-50" />
                            <p>Camera permission required</p>
                        </div>
                    )}

                    {/* Live Video Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                    />

                    {/* Captured Image Preview */}
                    {capturedImage && !cameraActive && (
                        <div className="absolute inset-0 w-full h-full bg-background">
                            <Image src={capturedImage} alt="Captured ID" fill className="object-contain" />
                        </div>
                    )}

                    {/* Hidden Canvas for capture processing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-4">
                    {!cameraActive && !capturedImage && (
                        <Button className="w-full" onClick={startCamera}>
                            <Camera className="mr-2 h-4 w-4" /> Start Camera
                        </Button>
                    )}

                    {cameraActive && (
                        <Button className="w-full" variant="destructive" onClick={capturePhoto}>
                            <ScanFace className="mr-2 h-4 w-4" /> Capture Photo
                        </Button>
                    )}

                    {capturedImage && !scanning && (
                        <Button className="w-full" variant="outline" onClick={startCamera}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                    )}
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

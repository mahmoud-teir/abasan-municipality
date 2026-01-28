'use client';

import { UploadButton } from "@/lib/uploadthing";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string[];
    onChange: (value: string[]) => void;
    onRemove: (value: string) => void;
    endpoint?: "newsImageUploader" | "documentUploader";
    onUploadComplete?: (res: any[]) => void;
}

export function ImageUpload({
    value = [],
    onChange,
    onRemove,
    endpoint = "newsImageUploader",
    onUploadComplete
}: ImageUploadProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {value.map((url) => (
                    <div key={url} className="group relative aspect-square rounded-xl overflow-hidden border bg-slate-100 shadow-sm">
                        <Image
                            fill
                            src={url}
                            alt="Uploaded Image"
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                                title="Remove Image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="aspect-square relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-colors group overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow mb-2">
                            <Upload className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 group-hover:text-primary transition-colors">Upload</span>
                    </div>

                    <UploadButton
                        endpoint={endpoint}
                        onClientUploadComplete={(res) => {
                            if (res) {
                                const urls = res.map((r) => r.url);
                                onChange([...value, ...urls]);
                                if (onUploadComplete) onUploadComplete(res);
                                toast.success("Image uploaded successfully");
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                            button: "w-full h-full bg-transparent border-none opacity-0 absolute inset-0 z-20 cursor-pointer",
                            allowedContent: "hidden",
                            container: "w-full h-full"
                        }}
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WEBP.
            </p>
        </div>
    );
}

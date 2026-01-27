'use client';

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string[];
    onChange: (value: string[]) => void;
    onRemove: (value: string) => void;
    endpoint?: "newsImageUploader" | "documentUploader";
}

export function ImageUpload({
    value = [],
    onChange,
    onRemove,
    endpoint = "newsImageUploader"
}: ImageUploadProps) {
    return (
        <div className="space-y-4">
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {value.map((url) => (
                        <div key={url} className="relative aspect-video rounded-md overflow-hidden border">
                            <div className="absolute top-2 right-2 z-10">
                                <button
                                    type="button"
                                    onClick={() => onRemove(url)}
                                    className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <Image
                                fill
                                src={url}
                                alt="Image"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
            <UploadDropzone
                endpoint={endpoint}
                onClientUploadComplete={(res) => {
                    const urls = res.map((r) => r.url);
                    onChange([...value, ...urls]);
                    toast.success("Image uploaded successfully");
                }}
                onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                }}
                className="ut-label:text-primary ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
            />
        </div>
    );
}

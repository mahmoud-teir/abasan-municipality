'use client';

import { useState, useTransition, useEffect } from "react";
import { MediaFile } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileIcon, ImageIcon, Download, Copy, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { deleteMedia, listMedia } from "@/actions/media.actions";
import { format } from "date-fns";

type Props = {
    initialFiles: MediaFile[];
    initialPagination: { total: number; pages: number; current: number };
};

export function MediaLibrary({ initialFiles, initialPagination }: Props) {
    const [files, setFiles] = useState(initialFiles);
    const [pagination, setPagination] = useState(initialPagination);
    const [isLoading, startTransition] = useTransition();

    const loadPage = async (page: number) => {
        startTransition(async () => {
            const res = await listMedia(page);
            if (res.success && res.data) {
                setFiles(res.data);
                setPagination(res.pagination!);
            }
        });
    };

    const handleDelete = async (id: string, key: string) => {
        if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;

        const deletePromise = deleteMedia(id, key);

        toast.promise(deletePromise, {
            loading: 'Deleting file...',
            success: (data) => {
                if (data.success) {
                    setFiles(files.filter(f => f.id !== id));
                    return 'File deleted successfully';
                }
                throw new Error(data.error);
            },
            error: 'Failed to delete file',
        });
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage your uploaded files and assets.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No files found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="group relative border rounded-lg overflow-hidden bg-slate-50 hover:shadow-md transition-shadow">
                                <div className="aspect-square relative flex items-center justify-center bg-slate-100">
                                    {file.type.toLowerCase().includes('image') ? (
                                        <Image
                                            src={file.url}
                                            alt={file.filename}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <FileIcon className="w-12 h-12 text-slate-300" />
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(file.url)} title="Copy URL">
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(file.id, file.key)} title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" title="Open">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="font-medium text-sm truncate" title={file.filename}>{file.filename}</p>
                                    <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                                        <span>{(file.size / 1024).toFixed(0)} KB</span>
                                        <span>{format(new Date(file.createdAt), 'MMM d')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current === 1}
                            onClick={() => loadPage(pagination.current - 1)}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm px-2">
                            Page {pagination.current} of {pagination.pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current === pagination.pages}
                            onClick={() => loadPage(pagination.current + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

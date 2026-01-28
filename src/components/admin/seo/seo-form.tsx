'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updatePageSeo } from "@/actions/seo.actions";
import { SeoPage } from "@prisma/client";

type Props = {
    initialData: SeoPage | null;
    routeKey: string;
};

export function SeoForm({ initialData, routeKey }: Props) {
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        titleAr: initialData?.titleAr || "",
        titleEn: initialData?.titleEn || "",
        descriptionAr: initialData?.descriptionAr || "",
        descriptionEn: initialData?.descriptionEn || "",
        keywordsAr: initialData?.keywordsAr || "",
        keywordsEn: initialData?.keywordsEn || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await updatePageSeo(routeKey, formData);
            if (res.success) {
                toast.success("SEO settings updated");
            } else {
                toast.error("Failed to update settings");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>SEO Meta Tags</CardTitle>
                    <CardDescription>
                        Configure how this page appears in search engines and social media.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Arabic Data</h3>
                            <div className="space-y-2">
                                <Label>Title (Arabic)</Label>
                                <Input
                                    value={formData.titleAr}
                                    onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                                    placeholder="Page Title in Arabic"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Arabic)</Label>
                                <Textarea
                                    value={formData.descriptionAr}
                                    onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                                    placeholder="Meta Description in Arabic"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keywords (Arabic)</Label>
                                <Input
                                    value={formData.keywordsAr}
                                    onChange={e => setFormData({ ...formData, keywordsAr: e.target.value })}
                                    placeholder="Comma separated keywords"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">English Data</h3>
                            <div className="space-y-2">
                                <Label>Title (English)</Label>
                                <Input
                                    value={formData.titleEn}
                                    onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                                    placeholder="Page Title in English"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (English)</Label>
                                <Textarea
                                    value={formData.descriptionEn}
                                    onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    placeholder="Meta Description in English"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keywords (English)</Label>
                                <Input
                                    value={formData.keywordsEn}
                                    onChange={e => setFormData({ ...formData, keywordsEn: e.target.value })}
                                    placeholder="Comma separated keywords"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

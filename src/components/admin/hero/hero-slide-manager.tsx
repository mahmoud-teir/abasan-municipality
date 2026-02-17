'use client';

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { HeroSlide } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { toast } from "sonner";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/actions/hero.actions";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton } from "@uploadthing/react";

export const UploadBtn = generateUploadButton<OurFileRouter>();

type Props = {
    initialSlides: HeroSlide[];
};

export function HeroSlideManager({ initialSlides }: Props) {
    const t = useTranslations("admin.hero");
    const [slides, setSlides] = useState(initialSlides);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [imageUrl, setImageUrl] = useState("");
    const [titleAr, setTitleAr] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [subtitleAr, setSubtitleAr] = useState("");
    const [subtitleEn, setSubtitleEn] = useState("");

    const openCreateSheet = () => {
        setEditingSlide(null);
        resetForm();
        setIsSheetOpen(true);
    };

    const openEditSheet = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setImageUrl(slide.imageUrl);
        setTitleAr(slide.titleAr);
        setTitleEn(slide.titleEn);
        setSubtitleAr(slide.subtitleAr || "");
        setSubtitleEn(slide.subtitleEn || "");
        setIsSheetOpen(true);
    };

    const resetForm = () => {
        setImageUrl("");
        setTitleAr("");
        setTitleEn("");
        setSubtitleAr("");
        setSubtitleEn("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl) {
            toast.error(t('imageRequired'));
            return;
        }

        startTransition(async () => {
            if (editingSlide) {
                const res = await updateHeroSlide(editingSlide.id, {
                    titleAr,
                    titleEn,
                    subtitleAr,
                    subtitleEn,
                    imageUrl,
                });
                if (res.success) {
                    toast.success(t('updateSuccess'));
                    setSlides(slides.map(s => s.id === editingSlide.id ? res.data : s) as HeroSlide[]);
                    setIsSheetOpen(false);
                } else {
                    toast.error(t('updateError'));
                }
            } else {
                const res = await createHeroSlide({
                    titleAr,
                    titleEn,
                    subtitleAr,
                    subtitleEn,
                    imageUrl,
                    order: slides.length,
                });
                if (res.success) {
                    toast.success(t('createSuccess'));
                    setSlides([...slides, res.data] as HeroSlide[]);
                    setIsSheetOpen(false);
                } else {
                    toast.error(t('createError'));
                }
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        startTransition(async () => {
            const res = await deleteHeroSlide(id);
            if (res.success) {
                toast.success(t('deleteSuccess'));
                setSlides(slides.filter(s => s.id !== id));
            } else {
                toast.error(t('deleteError'));
            }
        });
    };

    const handleToggleActive = async (slide: HeroSlide) => {
        startTransition(async () => {
            const res = await updateHeroSlide(slide.id, { isActive: !slide.isActive });
            if (res.success) {
                setSlides(slides.map(s => s.id === slide.id ? res.data : s) as HeroSlide[]);
            }
        });
    };

    const isVideo = (url: string) => /\.(mp4|webm|kw)$/i.test(url);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('activeSlides')} ({slides.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Slide Card */}
                <div
                    onClick={openCreateSheet}
                    className="group border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 h-full min-h-[300px] cursor-pointer hover:border-primary hover:bg-slate-50 transition-all"
                >
                    <div className="p-4 bg-slate-100 rounded-full group-hover:bg-white group-hover:shadow-md transition-all mb-4">
                        <Plus className="w-8 h-8 text-slate-500 group-hover:text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 group-hover:text-primary">{t('addNew')}</h3>
                    <p className="text-sm text-slate-400 text-center mt-2">{t('uploadText')}</p>
                </div>

                {slides.map((slide) => (
                    <Card key={slide.id} className={`overflow-hidden transition-all ${!slide.isActive ? 'opacity-60 grayscale' : ''}`}>
                        <div className="relative aspect-video w-full bg-slate-100">
                            {isVideo(slide.imageUrl) ? (
                                <video
                                    src={slide.imageUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.titleEn}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur" onClick={() => openEditSheet(slide)}>
                                    <Pencil className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(slide.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold truncate">{slide.titleEn}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{slide.titleAr}</p>
                                </div>
                                <Switch
                                    checked={slide.isActive}
                                    onCheckedChange={() => handleToggleActive(slide)}
                                />
                            </div>
                            <div className="text-xs text-slate-500">
                                {slide.subtitleEn && <p className="truncate">{slide.subtitleEn}</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingSlide ? t('editSlide') : t('createSlide')}</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-6">
                        {/* Image/Video Upload */}
                        <div className="space-y-2">
                            <Label>{t('slideMedia')}</Label>
                            <div className="relative border-2 border-dashed rounded-xl aspect-video flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-colors group overflow-hidden">
                                {imageUrl ? (
                                    <>
                                        {isVideo(imageUrl) ? (
                                            <video
                                                src={imageUrl}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                        ) : (
                                            <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                                onClick={() => setImageUrl("")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center gap-4 pointer-events-none z-10 transition-transform group-hover:scale-105 duration-300">
                                            <div className="p-5 bg-white rounded-full shadow-lg group-hover:shadow-xl ring-1 ring-slate-100 transition-all">
                                                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">{t('clickDrag')}</p>
                                                <p className="text-xs text-slate-400">{t('supported')}</p>
                                            </div>
                                        </div>
                                        <UploadBtn
                                            endpoint="heroMediaUploader"
                                            onClientUploadComplete={(res) => {
                                                if (res?.[0]) setImageUrl(res[0].url);
                                            }}
                                            appearance={{
                                                button: "w-full h-full opacity-0 cursor-pointer", // Completely invisible
                                                allowedContent: "hidden",
                                                container: "absolute inset-0 z-20 w-full h-full"
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('titleAr')}</Label>
                                <Input value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder={t('titleAr')} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('titleEn')}</Label>
                                <Input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder={t('titleEn')} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('subtitleAr')}</Label>
                                <Input value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} placeholder={t('subtitleAr')} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('subtitleEn')}</Label>
                                <Input value={subtitleEn} onChange={e => setSubtitleEn(e.target.value)} placeholder={t('subtitleEn')} />
                            </div>
                        </div>

                        <SheetFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>{t('cancel')}</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? t('saving') : t('save')}</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}

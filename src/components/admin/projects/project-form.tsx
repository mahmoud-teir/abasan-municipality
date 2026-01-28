'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createProject, updateProject } from '@/actions/project.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';
import { deleteMediaByKeys } from '@/actions/media.actions';

const projectSchema = z.object({
    titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
    titleEn: z.string().min(1, 'English title is required'),
    descriptionAr: z.string().min(1, 'الوصف العربي مطلوب'),
    descriptionEn: z.string().min(1, 'English description is required'),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
    budget: z.string().optional(),
    contractor: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    images: z.array(z.string()).optional(),
    completionPercentage: z.string().optional(),
    location: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type Props = {
    locale: string;
    project?: any;
};

export function ProjectForm({ locale, project }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(project?.images || []);
    const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
    const isAr = locale === 'ar';

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            titleAr: project?.titleAr || '',
            titleEn: project?.titleEn || '',
            descriptionAr: project?.descriptionAr || '',
            descriptionEn: project?.descriptionEn || '',
            status: project?.status || 'PLANNED',
            budget: project?.budget ? String(project.budget) : '',
            contractor: project?.contractor || '',
            startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            images: project?.images || [],
            completionPercentage: project?.completionPercentage ? String(project.completionPercentage) : '0',
            location: project?.location || '',
        },
    });

    async function onSubmit(data: ProjectFormValues) {
        setLoading(true);
        try {
            const payload = {
                ...data,
                images,
                budget: data.budget ? parseFloat(data.budget) : null,
                completionPercentage: parseInt(data.completionPercentage || '0'),
            };

            const res = project
                ? await updateProject(project.id, payload)
                : await createProject(payload);

            if (res.success) {
                toast.success(project ? (isAr ? 'تم تحديث المشروع' : 'Project updated') : (isAr ? 'تم إنشاء المشروع' : 'Project created'));
                router.push(`/${locale}/admin/projects`);
                router.refresh();
            } else {
                toast.error(res.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (error) {
            toast.error(isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border">

                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="titleAr"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>اسم المشروع (عربي)</FormLabel>
                                <FormControl>
                                    <Input {...field} dir="rtl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="titleEn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Title (English)</FormLabel>
                                <FormControl>
                                    <Input {...field} dir="ltr" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="descriptionAr"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>وصف المشروع (عربي)</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="rtl" className="h-32" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="descriptionEn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Description (English)</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="ltr" className="h-32" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'حالة المشروع' : 'Status'}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PLANNED">{isAr ? 'مخطط له' : 'Planned'}</SelectItem>
                                        <SelectItem value="IN_PROGRESS">{isAr ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                                        <SelectItem value="COMPLETED">{isAr ? 'مكتمل' : 'Completed'}</SelectItem>
                                        <SelectItem value="ON_HOLD">{isAr ? 'معلق' : 'On Hold'}</SelectItem>
                                        <SelectItem value="CANCELLED">{isAr ? 'ملغي' : 'Cancelled'}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'الميزانية (شيكل)' : 'Budget (ILS)'}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="completionPercentage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'نسبة الإنجاز %' : 'Completion %'}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" min="0" max="100" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'تاريخ البدء' : 'Start Date'}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="contractor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'المقاول المنفذ' : 'Contractor'}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'الموقع' : 'Location'}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                    <FormLabel className="block text-base font-semibold">{isAr ? 'صور المشروع' : 'Project Images'}</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border bg-slate-100 shadow-sm">
                                <Image
                                    src={img}
                                    alt={`Project Image ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                                        title={isAr ? "حذف الصورة" : "Remove Image"}
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
                                <span className="text-xs font-medium text-slate-500 group-hover:text-primary transition-colors">{isAr ? 'رفع صورة' : 'Upload'}</span>
                            </div>

                            <UploadButton
                                endpoint="newsImageUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]) {
                                        const newKeys = res.map(r => r.key);
                                        setUploadedKeys(prev => [...prev, ...newKeys]);
                                        setImages(prev => [...prev, res[0].url]);
                                        toast.success(isAr ? "تم رفع الصورة" : "Image uploaded");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Error: ${error.message}`);
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
                        {isAr
                            ? 'يمكنك رفع صور متعددة. الصيغ المدعومة: JPG، PNG، WEBP.'
                            : 'You can upload multiple images. Supported formats: JPG، PNG، WEBP.'}
                    </p>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                            if (uploadedKeys.length > 0) {
                                toast.loading(isAr ? 'جاري التنظيف...' : 'Cleaning up...');
                                await deleteMediaByKeys(uploadedKeys);
                                toast.dismiss();
                            }
                            router.back();
                        }}
                        className="me-4"
                    >
                        {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {project ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء المشاريع' : 'Create Project')}
                    </Button>
                </div>
            </form>
        </Form >
    );
}

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
import { createProject, updateProject } from '@/actions/project.actions'; // Assuming this exists or will exist
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';

const projectSchema = z.object({
    titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
    titleEn: z.string().min(1, 'English title is required'),
    descriptionAr: z.string().min(1, 'الوصف العربي مطلوب'),
    descriptionEn: z.string().min(1, 'English description is required'),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
    budget: z.string().optional(), // Input as string, convert to number in action
    contractor: z.string().optional(),
    startDate: z.string().optional(), // Date input returns string "YYYY-MM-DD"
    endDate: z.string().optional(),
    images: z.array(z.string()).optional(),
    completionPercentage: z.string().optional(), // Input range/number returns string sometimes
    location: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type Props = {
    locale: string;
    project?: any; // Replace with Project type
};

export function ProjectForm({ locale, project }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(project?.images || []);

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
                    <FormLabel className="block">{isAr ? 'صور المشروع' : 'Project Images'}</FormLabel>
                    <div className="flex flex-wrap gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                <Image src={img} alt="Project" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]) {
                                        setImages(prev => [...prev, res[0].url]);
                                        toast.success("Image uploaded");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Error: ${error.message}`);
                                }}
                                appearance={{
                                    button: "bg-transparent text-slate-500 hover:text-slate-700 w-full h-full",
                                    allowedContent: "hidden"
                                }}
                                content={{
                                    button: <div className="flex flex-col items-center"><Upload className="w-6 h-6 mb-2" /><span className="text-xs">Upload</span></div>
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="me-4">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {project ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء المشاريع' : 'Create Project')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

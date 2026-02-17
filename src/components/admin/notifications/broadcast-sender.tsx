'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Megaphone, Send, Users, History, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { sendBroadcastToUsers } from "@/actions/notification.actions"; // Import server action
import { useTranslations, useLocale } from "next-intl";

type Props = {
    userId: string;
};

export function BroadcastSender({ userId }: Props) {
    const t = useTranslations('admin.notifications');
    const locale = useLocale();
    // const sendBroadcast = useMutation(api.broadcasts.send); // Replaced by Server Action
    const deleteBroadcast = useMutation(api.broadcasts.deleteBroadcast);
    const recentBroadcasts = useQuery(api.broadcasts.list, { limit: 10 });

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("info");
    const [audience, setAudience] = useState("all");
    const [isSending, setIsSending] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            // Use Server Action instead of direct mutation to ensure distribution
            const result = await sendBroadcastToUsers({
                title,
                message,
                type,
                audience,
                sentBy: userId,
            });

            if (result.success) {
                toast.success(t('toast.sendSuccess', { count: result.count ?? 0 }));
                setTitle("");
                setMessage("");
            } else {
                toast.error(result.error || t('toast.sendError'));
            }
        } catch (error) {
            toast.error(t('toast.error'));
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('recent.deleteConfirm'))) return;
        setDeletingId(id);
        try {
            await deleteBroadcast({ id: id as any }); // Cast id if needed by TS
            toast.success(t('recent.deleteSuccess'));
        } catch (error) {
            toast.error(t('recent.deleteError'));
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-primary" />
                        {t('sendNew')}
                    </CardTitle>
                    <CardDescription>{t('sendDescription')}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSend}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('form.title')}</Label>
                            <Input
                                placeholder={t('form.titlePlaceholder')}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('form.message')}</Label>
                            <Textarea
                                placeholder={t('form.messagePlaceholder')}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('form.type')}</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">{t('form.types.info')}</SelectItem>
                                        <SelectItem value="warning">{t('form.types.warning')}</SelectItem>
                                        <SelectItem value="success">{t('form.types.success')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('form.audience')}</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('form.audiences.all')}</SelectItem>
                                        <SelectItem value="employees">{t('form.audiences.employees')}</SelectItem>
                                        <SelectItem value="citizens">{t('form.audiences.citizens')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSending} className="w-full">
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('form.sending')}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    {t('form.sendButton')}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t('recent.title')}
                    </CardTitle>
                    <CardDescription>{t('recent.description')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[500px]">
                    <div className="space-y-4">
                        {!recentBroadcasts ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentBroadcasts.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">{t('recent.noBroadcasts')}</p>
                        ) : (
                            recentBroadcasts.map((item) => (
                                <div key={item._id} className="border rounded-lg p-3 space-y-2 group relative hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-sm pr-6">{item.title}</h4>
                                        <Badge variant={item.type === 'warning' ? 'destructive' : 'secondary'} className="text-[10px]">
                                            {item.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {t(`form.audiences.${item.audience}` as any)}
                                        </span>
                                        <span>
                                            {format(new Date(item.timestamp), "MMM d, HH:mm", { locale: locale === 'ar' ? ar : enUS })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(item._id)}
                                        disabled={deletingId === item._id}
                                    >
                                        {deletingId === item._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

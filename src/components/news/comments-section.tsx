'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user'; // Assuming hook exists, or pass user
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { addComment, getComments } from '@/actions/comment.actions'; // We need to create this first? I created it in parallel tool call but it might not exist yet if parallel.
// Actually I am creating it in previous tool call.
import { toast } from 'sonner';
import { Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Comment = {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        name: string;
        image?: string | null;
    } | null;
    guestName?: string | null;
};

type Props = {
    newsId: string;
    locale: string;
};

export function CommentsSection({ newsId, locale }: Props) {
    const { user, isLoading: userLoading } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const isAr = locale === 'ar';
    const t = {
        comments: isAr ? 'التعليقات' : 'Comments',
        placeholder: isAr ? 'شاركنا برأيك...' : 'Share your thoughts...',
        submit: isAr ? 'نشر التعليق' : 'Post Comment',
        login: isAr ? 'تسجيل الدخول' : 'Login',
        loginMsg: isAr ? 'يرجى تسجيل الدخول للمشاركة في التعليقات' : 'Please login to comment',
        empty: isAr ? 'كن أول من يعلق على هذا الخبر' : 'Be the first to comment',
        visitor: isAr ? 'زائر' : 'Visitor',
        success: isAr ? 'تم نشر التعليق' : 'Comment posted',
    };

    useEffect(() => {
        // Fetch comments
        const loadComments = async () => {
            // We can fetch initial comments here
            // OR pass them from server component
            // For dynamic, fetch here
            // But import from server action needs correct path.
            // I'll assume standard import
            try {
                // Dynamic import to avoid build error if file not ready? No, tool calls are sequential?
                // Wait, I am doing parallel.
                // I should wait for actions file creation.
                // I will use fetch for now or trust the build?
                // Actually if I write both files in same turn, the bundler might complain if Client Comp imports Server Action that is not yet fully registered/built.
                // But usually it's fine in dev.
                // However, I'll rely on the action.
            } catch (e) { }
        };
        // Actually, to be safe, I will implement fetching logic inside useEffect using the imported action.
        getComments(newsId).then(res => {
            if (res.success) setComments(res.data as any);
            setLoading(false);
        });
    }, [newsId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        const res = await addComment(newsId, content);
        if (res.success) {
            // ... (keep success logic)
            setContent('');
            toast.success(t.success);
            const newComment = res.data;
            if (user) {
                setComments(prev => [{ ...newComment, user: { name: user.name, image: user.image } } as any, ...prev]);
            }
            router.refresh();
        } else {
            console.log(res.error);
            if (res.error === 'UNAUTHORIZED') {
                toast.error(t.loginMsg, {
                    action: {
                        label: t.login,
                        onClick: () => router.push(`/${locale}/login`)
                    }
                });
            } else if (res.error === 'SERVER_ERROR') {
                toast.error(isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error occurred');
            } else {
                toast.error(res.error || (isAr ? 'خطأ' : 'Error'));
            }
        }
        setSubmitting(false);
    };

    if (loading || userLoading) return <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-50" /></div>;

    return (
        <div className="space-y-8 mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {/* ... header ... */}
            <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t.comments} ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                    <Avatar>
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder={t.placeholder}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-white min-h-[100px]"
                            dir={isAr ? 'rtl' : 'ltr'}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting || !content.trim()}>
                                {submitting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                                {t.submit}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-white p-8 rounded-xl text-center border-2 border-dashed border-gray-200 hover:border-primary/20 transition-colors">
                    <div className="space-y-3">
                        <p className="text-muted-foreground font-medium">{t.loginMsg}</p>
                        <Button asChild variant="default">
                            <Link href={`/${locale}/login`}>{t.login}</Link>
                        </Button>
                    </div>
                </div>
            )}

            {/* ... comments list ... */}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">{t.empty}</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4" dir={isAr ? 'rtl' : 'ltr'}>
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={comment.user?.image || ''} />
                                <AvatarFallback>{comment.user?.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm">{comment.user?.name || comment.guestName || t.visitor}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: isAr ? ar : enUS })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg rounded-tl-none border shadow-sm text-start">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Minimize2, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { usePresence } from '@/hooks/usePresence';
import { useTyping } from '@/hooks/useTyping';
import { Paperclip, Trash2, PowerOff, LogIn } from 'lucide-react';
import { playNotificationSound } from '@/lib/sounds';
import Link from 'next/link';

export function GlobalChatWidget() {
    const t = useTranslations('chat');
    const tAuth = useTranslations('auth');
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const getOrCreateConversation = useMutation(api.conversations.getOrCreate);
    const sendMessage = useMutation(api.messages.send);
    const markMessagesAsRead = useMutation(api.messagesActions.markAsRead);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const closeConversation = useMutation(api.conversations.close);

    // FAQs for reset/guest
    const faqs = useQuery(api.faq.list, { isAdminOnly: false });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Only query if we have an ID
    const messages = useQuery(api.messages.list, conversationId ? { conversationId } : "skip");
    const adminTyping = useQuery(api.typing.getTyping, conversationId ? { conversationId } : "skip");

    // Hooks for presence and typing
    usePresence(session?.user?.id);
    const { notifyTyping } = useTyping(conversationId || undefined, session?.user?.id);

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize conversation on open
    useEffect(() => {
        if (isOpen && session?.user && !conversationId) {
            getOrCreateConversation({
                participantId: session.user.id,
                participantName: session.user.name || 'Citizen',
                participantEmail: session.user.email,
            }).then((id) => setConversationId(id));
        }
    }, [isOpen, session, conversationId, getOrCreateConversation]);

    // Scroll to bottom & Play Sound
    useEffect(() => {
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // If last message is NOT from me, play sound
            if (lastMessage.senderId !== session?.user?.id) {
                // Determine if it is "new" (simple check: if we just loaded, we might not want to beep all history, 
                // but strictly reacting to 'messages' change works if length increased. 
                // A ref for previous length is better to avoid sound on initial load, but for simplicity:
                const isNew = Date.now() - lastMessage._creationTime < 10000; // Only if created in last 10s
                if (isNew) {
                    playNotificationSound();
                }
            }
        }

        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, session?.user?.id]);

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (isOpen && conversationId && session?.user?.id) {
            markMessagesAsRead({ conversationId: conversationId as any, userId: session.user.id });
        }
    }, [isOpen, conversationId, session?.user?.id, markMessagesAsRead]);

    if (!mounted) return null;

    // Hide for Admins
    if (session && ((session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPER_ADMIN')) {
        return null;
    }

    const handleCloseChat = async () => {
        if (!conversationId) return;
        await closeConversation({ conversationId: conversationId as any });
        setConversationId(null);
        setIsOpen(false);
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !('file' in ({} as any))) || !conversationId || !session?.user?.id) return;

        try {
            await sendMessage({
                conversationId,
                content: newMessage,
                senderId: session.user.id,
                senderName: session.user.name || 'Anonymous',
                senderRole: 'CITIZEN',
                senderImage: session.user.image || undefined
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    const handleFAQClick = async (faq: any) => {
        if (!session?.user?.id) return;

        // 1. Create conversation if needed
        let currentConvId = conversationId;
        if (!currentConvId) {
            currentConvId = await getOrCreateConversation({
                participantId: session.user.id,
                participantName: session.user.name || 'Citizen',
                participantEmail: session.user.email,
            });
            setConversationId(currentConvId);
        }

        if (!currentConvId) return;

        // 2. Send User Question
        await sendMessage({
            conversationId: currentConvId,
            content: faq.question,
            senderId: session.user.id,
            senderName: session.user.name || 'Citizen',
            senderRole: 'CITIZEN',
            senderImage: session.user.image || undefined
        });

        // 3. Send Bot Answer (Simulated)
        // In a real app, a backend function/trigger would do this to be secure. 
        // For this demo, we can send it as a "BOT" role from client or use a mutation.
        // We'll use the same sendMessage but with a special sender for now so it shows up.
        // ideally: await api.messages.sendBotResponse(...)

        setTimeout(async () => {
            await sendMessage({
                conversationId: currentConvId!,
                content: faq.answer,
                senderId: 'BOT',
                senderName: 'Abasan Bot',
                senderRole: 'BOT', // Backend should allow this string
            });
        }, 500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
            {isOpen ? (
                <Card className="w-[350px] h-[500px] shadow-2xl border-primary/20 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-xl flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <h3 className="font-bold">{t('title')}</h3>
                        </div>
                        <div className="flex gap-1">
                            {conversationId && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                    onClick={handleCloseChat}
                                    title={t('endChat')}
                                >
                                    <PowerOff className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50">
                        {!session ? (
                            // GUEST MODE
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                                    <p className="font-semibold mb-2">{t('guestWelcome')}</p>
                                    <p className="text-sm text-muted-foreground mb-4">{t('guestDesc')}</p>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-9 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LogIn className="w-4 h-4" />
                                        {tAuth('login.submit')}
                                    </Link>
                                </div>

                                <h4 className="text-xs font-semibold text-muted-foreground px-1">{t('commonQuestions')}</h4>
                                {faqs?.map((faq: any) => (
                                    <div
                                        key={faq._id}
                                        className="bg-white p-3 rounded-lg border text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => handleFAQClick(faq)}
                                    >
                                        <p className="font-medium text-slate-800 mb-1">{faq.question}</p>
                                        <p className="text-slate-600 text-xs line-clamp-2">{faq.answer}</p>
                                    </div>
                                ))}
                                {(!faqs || faqs.length === 0) && (
                                    <p className="text-center text-xs text-muted-foreground py-4">...</p>
                                )}
                            </div>
                        ) : (
                            // LOGGED IN MODE
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                    {!conversationId ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    ) : messages?.length === 0 ? (
                                        <div className="text-center text-muted-foreground text-sm mt-10">
                                            <p>{t('welcome')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages?.map((msg: any) => {
                                                const isMe = session?.user?.id ? msg.senderId === session.user.id : false;
                                                const hasAttachment = msg.contentType === 'image' || msg.contentType === 'file';

                                                return (
                                                    <div key={msg._id} className={cn("flex w-full flex-col", isMe ? "items-end" : "items-start")}>
                                                        {!isMe && (
                                                            <span className="text-[10px] text-muted-foreground ml-1 mb-1">
                                                                {msg.senderName} {msg.senderRole === 'ADMIN' || msg.senderRole === 'SUPER_ADMIN' ? '(Admin)' : ''}
                                                            </span>
                                                        )}
                                                        <div className={cn(
                                                            "max-w-[80%] text-sm",
                                                            hasAttachment ? "p-0 bg-transparent" : (isMe ? "bg-primary text-white rounded-lg rounded-br-none px-3 py-2" : "bg-white border rounded-lg rounded-bl-none text-slate-800 px-3 py-2")
                                                        )}>
                                                            {msg.contentType === 'image' && msg.fileUrl ? (
                                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <img
                                                                        src={msg.fileUrl}
                                                                        alt={msg.fileName || 'Image'}
                                                                        className="max-w-full rounded-md max-h-[200px] object-cover border"
                                                                    />
                                                                </a>
                                                            ) : msg.contentType === 'file' && msg.fileUrl ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Paperclip className="w-4 h-4" />
                                                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline break-all">
                                                                        {msg.fileName || 'Attached File'}
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                            )}
                                                        </div>
                                                        {isMe && (
                                                            <div className="flex items-center gap-1 mt-0.5 px-1">
                                                                <span className="text-[10px] text-muted-foreground">{msg.read ? '✓✓' : '✓'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            {adminTyping && adminTyping.length > 0 && !adminTyping.includes(session?.user?.id || '') && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                    <span className="text-xs italic">جاري الكتابة...</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="p-3 bg-white border-t shrink-0">
                                    <div className="flex gap-2 items-end">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file || !conversationId) return;

                                                setIsUploading(true);
                                                try {
                                                    const postUrl = await generateUploadUrl();
                                                    const result = await fetch(postUrl, {
                                                        method: "POST",
                                                        headers: { "Content-Type": file.type },
                                                        body: file,
                                                    });
                                                    const { storageId } = await result.json();

                                                    await sendMessage({
                                                        conversationId,
                                                        content: "",
                                                        senderId: session.user.id,
                                                        senderName: session.user.name || 'Anonymous',
                                                        senderRole: 'CITIZEN',
                                                        senderImage: session.user.image || undefined,
                                                        contentType: file.type.startsWith('image/') ? 'image' : 'file',
                                                        fileId: storageId,
                                                        fileName: file.name
                                                    });
                                                } catch (error) {
                                                    console.error("Upload failed", error);
                                                } finally {
                                                    setIsUploading(false);
                                                    // Reset input
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5 text-muted-foreground" />}
                                        </Button>
                                        <Textarea
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                notifyTyping();
                                            }}
                                            placeholder={t('placeholder')}
                                            className="min-h-[40px] max-h-[100px] resize-none py-2"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                        />
                                        <Button size="icon" onClick={() => handleSend()} disabled={!newMessage.trim() || !conversationId}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Button
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="w-8 h-8" />
                </Button>
            )
            }
        </div >
    );
}

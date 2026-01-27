'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { usePresence } from '@/hooks/usePresence';
import { useTyping } from '@/hooks/useTyping';
import { Paperclip, Loader2 } from 'lucide-react';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { playNotificationSound } from '@/lib/sounds';

export default function AdminMessagesPage() {
    const t = useTranslations();
    const { data: session } = useSession();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const conversations = useQuery(api.conversations.list);
    const messages = useQuery(api.messages.list, selectedConversationId ? { conversationId: selectedConversationId } : "skip");
    const citizenTyping = useQuery(api.typing.getTyping, selectedConversationId ? { conversationId: selectedConversationId } : "skip");
    const onlineUsers = useQuery(api.presence.getOnline,
        conversations ? { userIds: conversations.map((c: any) => c.participantId) } : "skip"
    );

    const sendMessage = useMutation(api.messages.send);
    const markRead = useMutation(api.conversations.markAsRead);
    const markMessagesAsRead = useMutation(api.messagesActions.markAsRead);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const closeConversation = useMutation(api.conversations.close);
    const deleteConversation = useMutation(api.conversations.deleteConversation);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Presence and typing hooks
    usePresence(session?.user?.id);
    const { notifyTyping } = useTyping(selectedConversationId || undefined, session?.user?.id);

    // Play sound on new messages
    useEffect(() => {
        if (messages && messages.length > 0 && session?.user?.id) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId !== session.user.id) {
                const isNew = Date.now() - lastMessage._creationTime < 10000;
                if (isNew) {
                    playNotificationSound();
                }
            }
        }
    }, [messages, session?.user?.id]);

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        markRead({ conversationId: id as any });
        if (session?.user?.id) {
            markMessagesAsRead({ conversationId: id as any, userId: session.user.id });
        }
    };

    const handleSend = async () => {
        if ((!reply.trim() && !('file' in ({} as any))) || !selectedConversationId || !session?.user) return;

        await sendMessage({
            conversationId: selectedConversationId,
            content: reply,
            senderId: session.user.id,
            senderName: session.user.name || 'Support Agent',
            senderRole: (session.user as any).role || 'ADMIN',
            senderImage: session.user.image || undefined
        });
        setReply('');
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex gap-6">
            {/* Sidebar List */}
            <Card className="w-80 flex flex-col h-full">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {t('admin.messagesPage.title')}
                    </CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                        <Input
                            type="search"
                            placeholder={t('admin.messagesPage.search')}
                            className="w-full bg-background pl-8 rtl:pr-8 rtl:pl-4"
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                    {!conversations ? (
                        <div className="p-4 text-center text-sm">{t('common.loading')}</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">{t('admin.messagesPage.noConversations')}</div>
                    ) : (
                        conversations.map((conv: any) => (
                            <div
                                key={conv._id}
                                onClick={() => handleSelectConversation(conv._id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-100",
                                    selectedConversationId === conv._id ? "bg-slate-100 border-l-4 border-l-primary" : ""
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback>{conv.participantName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {onlineUsers?.includes(conv.participantId) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold truncate text-sm">{conv.participantName}</span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {conv.lastMessagePreview || 'New conversation'}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {conv.unreadCount}
                                    </Badge>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col h-full overflow-hidden">
                {!selectedConversationId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>{t('admin.messagesPage.selectConversation')}</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                            {(() => {
                                const activeConv = conversations?.find((c: any) => c._id === selectedConversationId);
                                return (
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{activeConv?.participantName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold">{activeConv?.participantName}</h3>
                                            <p className="text-xs text-muted-foreground">{activeConv?.participantEmail || 'No email'}</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                            {!messages ? (
                                <div>Loading messages...</div>
                            ) : (
                                <>
                                    {messages.map((msg: any) => {
                                        const isMe = msg.senderRole === 'ADMIN' || msg.senderRole === 'SUPER_ADMIN';
                                        return (
                                            <div key={msg._id} className={cn("flex w-full flex-col", isMe ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                                                    isMe ? "bg-primary text-white rounded-br-none" : "bg-white border rounded-bl-none"
                                                )}>
                                                    {msg.contentType === 'image' && msg.fileUrl ? (
                                                        <div className="mb-2">
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <Image
                                                                    src={msg.fileUrl}
                                                                    alt={msg.fileName || 'Image'}
                                                                    width={200}
                                                                    height={200}
                                                                    className="rounded-md object-cover max-h-[200px] w-auto bg-slate-100"
                                                                />
                                                            </a>
                                                        </div>
                                                    ) : msg.contentType === 'file' && msg.fileUrl ? (
                                                        <div className="mb-2">
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                                                                <Paperclip className="w-4 h-4" />
                                                                {msg.fileName || 'Attachment'}
                                                            </a>
                                                        </div>
                                                    ) : null}
                                                    <p>{msg.content}</p>
                                                    <span className={cn("text-[10px] block mt-1 opacity-70", isMe ? "text-start" : "text-end")}>
                                                        {formatDistanceToNow(new Date(msg._creationTime))}
                                                    </span>
                                                </div>
                                                {isMe && (
                                                    <div className="flex items-center gap-1 mt-0.5 px-1">
                                                        <span className="text-[10px] text-muted-foreground">{msg.read ? '✓✓' : '✓'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {citizenTyping && citizenTyping.length > 0 && !citizenTyping.includes(session?.user?.id || '') && (
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

                        {/* Input */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2 items-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file || !selectedConversationId) return;

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
                                                conversationId: selectedConversationId,
                                                content: "",
                                                senderId: session.user.id,
                                                senderName: session.user.name || 'Support Agent',
                                                senderRole: (session.user as any).role || 'ADMIN',
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
                                    value={reply}
                                    onChange={(e) => {
                                        setReply(e.target.value);
                                        notifyTyping();
                                    }}
                                    placeholder={t('admin.messagesPage.typeReply')}
                                    className="min-h-[50px] max-h-[150px] resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <Button onClick={handleSend} disabled={!reply.trim() || !selectedConversationId} size="icon" className="h-auto w-12 self-end">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}

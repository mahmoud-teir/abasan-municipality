'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface RequestChatProps {
    requestId: string;
}

export function RequestChat({ requestId }: RequestChatProps) {
    const { data: session } = useSession();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Real-time query
    const messages = useQuery(api.messages.list, { requestId });
    const sendMessage = useMutation(api.messages.send);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !session?.user?.id) return;

        try {
            await sendMessage({
                requestId,
                content: newMessage,
                senderId: session.user.id,
                senderName: session.user.name || 'Anonymous',
                senderRole: (session.user as any).role || 'UNKNOWN',
                senderImage: session.user.image || undefined
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (!session) return null;

    // While loading
    if (messages === undefined) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-[500px] border rounded-lg bg-slate-50/50">
            <div className="p-4 border-b bg-white rounded-t-lg">
                <h3 className="font-semibold flex items-center gap-2">
                    Message History
                    <span className="text-xs font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                        {messages.length}
                    </span>
                </h3>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <User className="w-12 h-12 mb-2" />
                        <p>No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = msg.senderId === session.user.id;
                        return (
                            <div
                                key={msg._id}
                                className={cn(
                                    "flex w-full items-end gap-2",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                                        {msg.senderImage ? (
                                            <Image
                                                src={msg.senderImage}
                                                alt={msg.senderName}
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                                                {msg.senderName?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                    isMe
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-white border rounded-bl-none"
                                )}>
                                    {!isMe && (
                                        <p className="text-[10px] text-slate-500 mb-1 font-semibold opacity-75">
                                            {msg.senderName} • {msg.senderRole}
                                        </p>
                                    )}
                                    <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    <p className={cn(
                                        "text-[10px] mt-1 text-end opacity-70",
                                        isMe ? "text-white" : "text-slate-400"
                                    )}>
                                        {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 bg-white border-t rounded-b-lg">
                <div className="flex gap-2">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="min-h-[50px] max-h-[150px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className="h-auto w-12 self-end shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

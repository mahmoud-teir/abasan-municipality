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
import { Badge } from "@/components/ui/badge";
import { sendBroadcastToUsers } from "@/actions/notification.actions"; // Import server action

type Props = {
    userId: string;
};

export function BroadcastSender({ userId }: Props) {
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
                toast.success(`Broadcast sent to ${result.count} users!`);
                setTitle("");
                setMessage("");
            } else {
                toast.error(result.error || "Failed to send broadcast");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this broadcast record?")) return;
        setDeletingId(id);
        try {
            await deleteBroadcast({ id: id as any }); // Cast id if needed by TS
            toast.success("Broadcast deleted");
        } catch (error) {
            toast.error("Failed to delete broadcast");
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
                        Send New Broadcast
                    </CardTitle>
                    <CardDescription>Send announcements to platform users.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSend}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="Announcement Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                placeholder="What would you like to say?"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Information</SelectItem>
                                        <SelectItem value="warning">Warning/Alert</SelectItem>
                                        <SelectItem value="success">Success/Event</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="employees">Employees Only</SelectItem>
                                        <SelectItem value="citizens">Citizens Only</SelectItem>
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
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Notification
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
                        Recent Broadcasts
                    </CardTitle>
                    <CardDescription>Recently sent announcements.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[500px]">
                    <div className="space-y-4">
                        {!recentBroadcasts ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentBroadcasts.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">No broadcasts sent yet.</p>
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
                                            {item.audience}
                                        </span>
                                        <span>
                                            {format(new Date(item.timestamp), "MMM d, HH:mm")}
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

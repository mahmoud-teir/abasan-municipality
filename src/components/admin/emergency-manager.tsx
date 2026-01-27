'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { toast } from 'sonner';

export function EmergencyManager() {
    const { data: session } = useSession();
    const createAlert = useMutation(api.emergency.create);
    const resolveAlert = useMutation(api.emergency.resolve);
    const activeAlert = useQuery(api.emergency.getActive);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [level, setLevel] = useState('critical');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!title || !message || !session?.user?.id) return;

        setIsSubmitting(true);
        try {
            await createAlert({
                title,
                message,
                level,
                createdBy: session.user.id,
            });
            toast.success('Emergency alert activated');
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to activate alert');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async () => {
        if (!activeAlert) return;
        try {
            await resolveAlert({ id: activeAlert._id });
            toast.success('Alert resolved');
        } catch (error) {
            toast.error('Failed to resolve alert');
        }
    };

    return (
        <Card className="border-red-200 shadow-sm relative overflow-hidden">
            {activeAlert && (
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
            )}
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                    <CardTitle>Emergency Center</CardTitle>
                </div>
                <CardDescription>
                    Manage high-priority alerts broadcasted to all citizens.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeAlert ? (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-bold text-red-700">{activeAlert.title}</h4>
                                <p className="text-sm text-red-600 mt-1">{activeAlert.message}</p>
                                <div className="mt-2 text-xs text-red-400 font-mono">
                                    Level: {activeAlert.level.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="default"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleResolve}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve Active Alert
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Alert Title</Label>
                            <Input
                                placeholder="e.g. Severe Weather Warning"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                placeholder="Detailed instructions for citizens..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Severity Level</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info (Blue)</SelectItem>
                                    <SelectItem value="warning">Warning (Orange)</SelectItem>
                                    <SelectItem value="critical">Critical (Red)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleCreate}
                            disabled={!title || !message || isSubmitting}
                        >
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Broadcast Alert
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

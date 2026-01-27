'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Trash2, PlusCircle, MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth/auth-client';

export default function FAQSettingsPage() {
    const { data: session } = useSession();
    const faqs = useQuery(api.faq.list, {});
    const createFAQ = useMutation(api.faq.create);
    const deleteFAQ = useMutation(api.faq.deleteFAQ);

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAdminOnly, setIsAdminOnly] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!question || !answer) return;
        setIsSubmitting(true);
        try {
            await createFAQ({
                question,
                answer,
                isAdminOnly,
                createdBy: session?.user?.id,
            });
            toast.success('FAQ added');
            setQuestion('');
            setAnswer('');
        } catch (error) {
            toast.error('Failed to add FAQ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: any) => {
        try {
            await deleteFAQ({ id });
            toast.success('FAQ deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chat Responses</h1>
                    <p className="text-muted-foreground">Manage auto-reply questions for the chat widget.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" />
                            Add Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Question / Trigger</Label>
                            <Input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g. key working hours?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Answer</Label>
                            <Textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="e.g. We are open from 8am to 2pm."
                                className="min-h-[100px]"
                            />
                        </div>
                        {/* 
                        <div className="flex items-center gap-2 space-x-2">
                            <Switch checked={isAdminOnly} onCheckedChange={setIsAdminOnly} id="admin-only" />
                            <Label htmlFor="admin-only">Admin Only?</Label>
                        </div> 
                        */}
                        <Button className="w-full" onClick={handleCreate} disabled={!question || !answer || isSubmitting}>
                            Add to Chat
                        </Button>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageCircleQuestion className="w-5 h-5" />
                            Existing Responses
                        </CardTitle>
                        <CardDescription>
                            These will appear as clickable suggestions in the chat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Answer</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faqs === undefined ? (
                                    <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                                ) : faqs.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No responses added yet.</TableCell></TableRow>
                                ) : (
                                    faqs.map((faq: any) => (
                                        <TableRow key={faq._id}>
                                            <TableCell className="font-medium">{faq.question}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate" title={faq.answer}>
                                                {faq.answer}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(faq._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

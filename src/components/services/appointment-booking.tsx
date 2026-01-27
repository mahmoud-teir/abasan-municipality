'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AppointmentBooking() {
    const { data: session } = useSession();
    const bookAppointment = useMutation(api.appointments.book);

    const [date, setDate] = useState<Date>();
    const [department, setDepartment] = useState('');
    const [reason, setReason] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !department || !reason || !name) return;

        setIsSubmitting(true);
        try {
            await bookAppointment({
                citizenId: session?.user?.id, // Optional
                citizenName: name,
                citizenEmail: session?.user?.email || '',
                citizenPhone: phone,
                department,
                reason,
                date: date.getTime(),
            });
            setIsSuccess(true);
            toast.success('Appointment request submitted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="max-w-md mx-auto mt-8 border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-green-800">Request Received</h3>
                        <p className="text-green-700 mt-2">
                            Your appointment request has been submitted successfully. We will review it and contact you soon.
                        </p>
                    </div>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="bg-white">
                        Book Another
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                    Schedule a meeting with municipal departments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                required
                                defaultValue={session?.user?.name || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="059xxxxxxx"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={department} onValueChange={setDepartment} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mayor">Mayor's Office</SelectItem>
                                <SelectItem value="engineering">Engineering & Planning</SelectItem>
                                <SelectItem value="licensing">Licensing & Permits</SelectItem>
                                <SelectItem value="sanitation">Health & Sanitation</SelectItem>
                                <SelectItem value="public_relations">Public Relations</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason for Visit</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly describe why you want to meet..."
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || !date || !department}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

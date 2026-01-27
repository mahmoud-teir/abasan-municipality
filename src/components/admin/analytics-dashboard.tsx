'use client';

import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    ResponsiveContainer,
    XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { useTranslations } from 'next-intl';

interface AnalyticsDashboardProps {
    requestsByType: { name: string; value: number }[];
    complaintsByCategory: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function AnalyticsDashboard({ requestsByType, complaintsByCategory }: AnalyticsDashboardProps) {
    const t = useTranslations('admin');

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Requests by Type */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-4 text-slate-800">{t('analytics.requestsByType') || 'Requests by Type'}</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={requestsByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {requestsByType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Complaints by Category */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-4 text-slate-800">{t('analytics.complaintsByCategory') || 'Complaints by Category'}</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={complaintsByCategory}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

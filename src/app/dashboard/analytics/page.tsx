"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    Shield,
    Skull,
    AlertTriangle,
    Zap,
    Target,
    Clock
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { calculateAttendancePercentage, calculatePassProbability } from "@/lib/calculations";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>({
        subjectData: [],
        riskDistribution: [],
        overallSurvival: 0,
        atRiskCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: subjects } = await supabase
                    .from("subjects")
                    .select("*, subject_data(*)")
                    .eq("user_id", user.id);

                if (subjects) {
                    const subjectData = subjects.map(s => {
                        const d = s.subject_data?.[0] || {
                            classes_held: 0,
                            classes_attended: 0,
                            attendance_required: 75,
                            internal_marks: 0,
                            max_internal_marks: 100,
                            passing_marks: 40,
                            exam_weightage: 60,
                            weekly_study_hours: 0
                        };

                        const attendance = calculateAttendancePercentage(d.classes_held, d.classes_attended);
                        const probability = calculatePassProbability(d);

                        return {
                            name: s.name,
                            attendance: Math.round(attendance),
                            probability,
                            required: d.attendance_required || 75
                        };
                    });

                    const atRisk = subjectData.filter(s => s.attendance < s.required).length;
                    const overallSurvival = subjectData.length > 0
                        ? Math.round(subjectData.reduce((acc, s) => acc + s.probability, 0) / subjectData.length)
                        : 0;

                    const totalHours = subjectData.length > 0
                        ? subjects.reduce((acc, s) => acc + (s.subject_data?.[0]?.weekly_study_hours || 0), 0)
                        : 0;

                    const riskDistribution = [
                        { name: "Safe", value: subjectData.length - atRisk, color: "#10b981" },
                        { name: "At Risk", value: atRisk, color: "#ef4444" }
                    ].filter(d => d.value > 0);

                    setStats({
                        subjectData,
                        riskDistribution,
                        overallSurvival,
                        atRiskCount: atRisk,
                        totalHours
                    });
                }
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="space-y-10">
            <div className="h-10 w-64 bg-slate-800 animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass animate-pulse rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80 glass animate-pulse rounded-3xl" />
                <div className="h-80 glass animate-pulse rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black font-outfit mb-2">Risk Analytics</h1>
                <p className="text-slate-400">Deep intelligence on your academic survival probability.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Survival Probability", value: `${stats.overallSurvival}%`, icon: Target, color: "text-primary" },
                    { label: "Critical Subjects", value: stats.atRiskCount, icon: Skull, color: "text-danger" },
                    { label: "Attendance Health", value: stats.atRiskCount === 0 ? "Optimal" : "Compromised", icon: Shield, color: stats.atRiskCount === 0 ? "text-success" : "text-danger" },
                    { label: "Weekly Study Effort", value: `${stats.totalHours} hrs`, icon: Clock, color: "text-secondary" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-8 rounded-3xl border border-white/5 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold font-outfit">Attendance per Subject</h3>
                        <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.subjectData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    unit="%"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                                    {stats.subjectData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.attendance < entry.required ? '#ef4444' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Risk Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-3xl border border-white/5 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold font-outfit">Risk Distribution</h3>
                        <Skull className="w-5 h-5 text-danger" />
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        {stats.riskDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.riskDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-2">
                                <AlertTriangle className="w-10 h-10 text-slate-700 mx-auto" />
                                <p className="text-slate-500 text-sm">No data to distribute</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-6">
                        {stats.riskDistribution.map((d: any) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-xs text-slate-400 font-medium">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-8 rounded-3xl border border-white/5"
            >
                <h3 className="text-xl font-bold font-outfit mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" />
                    Survival Strategies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.atRiskCount > 0 ? (
                        <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex gap-4">
                            <Skull className="w-6 h-6 text-danger shrink-0" />
                            <div>
                                <h4 className="font-bold text-danger text-sm">CRITICAL: Attendance Warning</h4>
                                <p className="text-xs text-danger/80 leading-relaxed mt-1">
                                    You have {stats.atRiskCount} subjects below the required attendance.
                                    Prioritize these classes immediately to avoid condonation issues.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-success/10 border border-success/20 p-4 rounded-2xl flex gap-4">
                            <Shield className="w-6 h-6 text-success shrink-0" />
                            <div>
                                <h4 className="font-bold text-success text-sm">Safe Zone Secured</h4>
                                <p className="text-xs text-success/80 leading-relaxed mt-1">
                                    All subjects are within safe attendance limits. Maintain this momentum.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex gap-4">
                        <TrendingUp className="w-6 h-6 text-secondary shrink-0" />
                        <div>
                            <h4 className="font-bold text-secondary text-sm">Internal Marks Insight</h4>
                            <p className="text-xs text-secondary/80 leading-relaxed mt-1">
                                Your average survival probability is {stats.overallSurvival}%.
                                Focus on internal assignments to boost your safety buffer.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    RotateCcw,
    Skull,
    Plus,
    Shield,
    Zap,
    BookOpen
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    calculateAttendancePercentage,
    calculatePassProbability,
    calculateBunkPredictor
} from "@/lib/calculations";

export default function DashboardOverview() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: subjectsData } = await supabase
                    .from("subjects")
                    .select(`
                        id, 
                        name, 
                        subject_data (*)
                    `)
                    .eq("user_id", user.id);

                setSubjects(subjectsData || []);
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    // Dynamic Stats Calculation
    const processedSubjects = subjects.map(s => {
        const data = s.subject_data?.[0] || {
            classes_held: 0,
            classes_attended: 0,
            attendance_required: 75,
            internal_marks: 0,
            max_internal_marks: 100,
            passing_marks: 40,
            exam_weightage: 60,
            weekly_study_hours: 0
        };
        const attendance = calculateAttendancePercentage(data.classes_held, data.classes_attended);
        const probability = calculatePassProbability(data);
        const bunkInfo = calculateBunkPredictor(data.classes_held, data.classes_attended, data.attendance_required, 0);

        return {
            ...s,
            attendance,
            probability,
            bunksLeft: bunkInfo.maxFutureBunks,
            isAtRisk: attendance < data.attendance_required
        };
    });

    const averageSurvival = subjects.length > 0
        ? Math.round(processedSubjects.reduce((acc, s) => acc + s.probability, 0) / subjects.length)
        : 0;

    const riskCount = processedSubjects.filter(s => s.isAtRisk).length;

    const totalStudyHours = subjects.reduce((acc, s) => acc + (s.subject_data?.[0]?.weekly_study_hours || 0), 0);
    const momentum = totalStudyHours > 20 ? "Elite" : totalStudyHours > 10 ? "Stable" : "Low";

    const stats = [
        { label: "Survival Score", value: `${averageSurvival}%`, color: "text-primary", icon: Shield },
        { label: "Attendance Risk", value: `${riskCount} Subjects`, color: riskCount > 0 ? "text-danger" : "text-success", icon: Skull },
        { label: "Study Momentum", value: momentum, color: totalStudyHours > 10 ? "text-success" : "text-warning", icon: Zap },
    ];

    if (loading) return (
        <div className="flex flex-col gap-8">
            <div className="h-20 w-1/3 bg-slate-800 animate-pulse rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 glass animate-pulse rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black font-outfit mb-2">Dashboard</h1>
                    <p className="text-slate-400">Your academic trajectory at a glance.</p>
                </div>
                <Link
                    href="/dashboard/subjects/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Subject</span>
                </Link>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl bg-white/5 ${stat.color}`}>
                            {/* @ts-ignore */}
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Subject List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-outfit flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Subjects Status
                </h2>

                {processedSubjects.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
                        <Skull className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No data yet?</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            survival requires information. Add your first subject to start the analytics engine.
                        </p>
                        <Link
                            href="/dashboard/subjects/new"
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Initialize Subject
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processedSubjects.map((subject, idx) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold font-outfit truncate">{subject.name}</h3>
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${subject.isAtRisk ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                                        }`}>
                                        {subject.isAtRisk ? "Critical" : "Safe"}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium text-slate-500">
                                            <span>Attendance</span>
                                            <span>{Math.round(subject.attendance)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${subject.isAtRisk ? "bg-danger" : "bg-primary"}`}
                                                style={{ width: `${Math.min(100, subject.attendance)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-dark p-3 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Prob.</p>
                                            <p className="text-lg font-bold text-gradient">{subject.probability}%</p>
                                        </div>
                                        <div className="glass-dark p-3 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Bunks</p>
                                            <p className="text-lg font-bold">{subject.bunksLeft} Left</p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/subjects/${subject.id}`}
                                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                                >
                                    Detail Intel <TrendingUp className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

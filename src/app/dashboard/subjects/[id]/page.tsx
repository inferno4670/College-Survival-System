"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    calculateAttendancePercentage,
    calculatePassProbability,
    calculateBunkPredictor,
    calculateRequiredFinalsScore
} from "@/lib/calculations";
import {
    ArrowLeft,
    Edit3,
    TrendingUp,
    Shield,
    Zap,
    Skull,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Clock,
    Target
} from "lucide-react";
import Link from "next/link";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

export default function SubjectDetailPage() {
    const { id } = useParams();
    const [subject, setSubject] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFullIntell = async () => {
            const { data: s } = await supabase.from("subjects").select("*").eq("id", id).single();
            const { data: d } = await supabase.from("subject_data").select("*").eq("subject_id", id).single();
            setSubject(s);
            setData(d);
            setLoading(false);
        };
        fetchFullIntell();
    }, [id]);

    if (loading) return <div className="p-10 animate-pulse bg-slate-800 rounded-3xl h-[600px]" />;
    if (!subject || !data) return <div>Subject not found.</div>;

    const attendancePct = calculateAttendancePercentage(data.classes_held, data.classes_attended);
    const passProb = calculatePassProbability(data);
    const bunkIntel = calculateBunkPredictor(data.classes_held, data.classes_attended, data.attendance_required, 0);
    const finalsIntel = calculateRequiredFinalsScore(data);

    const pieData = [
        { name: "Probability", value: passProb },
        { name: "Risk", value: 100 - passProb },
    ];

    const COLORS = ["#3b82f6", "#1e293b"];

    const riskLevel = passProb >= 80 ? "Safe" : passProb >= 60 ? "Warning" : "High Risk";
    const riskColor = passProb >= 80 ? "text-success" : passProb >= 60 ? "text-warning" : "text-danger";

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Fleet
                </Link>
                <Link
                    href={`/dashboard/subjects/${id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                    <Edit3 className="w-4 h-4" />
                    Update Intel
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-5xl font-black font-outfit truncate max-w-xl">{subject.name}</h1>
                    <p className="text-slate-400 mt-2">Intelligence report for current semester trajectory.</p>
                </div>
                <div className={`px-6 py-2 rounded-2xl glass font-black uppercase tracking-widest border ${riskColor.replace('text', 'border')}/20 ${riskColor}`}>
                    {riskLevel}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {/* Pass Probability Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl col-span-1 flex flex-col items-center justify-center text-center space-y-4"
                >
                    <h3 className="text-lg font-bold font-outfit uppercase text-slate-500">Pass Probability</h3>
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black font-outfit">{passProb}%</span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Combined calculation of attendance, internals, and effort.</p>
                </motion.div>

                {/* Analytics Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Target className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold">Attendance Safety</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-4xl font-black">{Math.round(attendancePct)}%</span>
                                <span className="text-slate-500 text-xs font-bold uppercase mb-1">Target: {data.attendance_required}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${attendancePct >= data.attendance_required ? 'bg-success' : 'bg-danger'}`}
                                    style={{ width: `${Math.min(100, attendancePct)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Held: {data.classes_held}</span>
                                <span className="text-slate-400">Attended: {data.classes_attended}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold">Bunk Predictor</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="text-center p-4 glass-dark rounded-2xl border border-white/5">
                                <p className="text-4xl font-black text-gradient">{bunkIntel.maxFutureBunks}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1">Safe Bunks Left</p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                *Calculation assumes no future classes are held beyond what you've missing. Use for tactical planning.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass p-6 rounded-3xl col-span-1 sm:col-span-2"
                    >
                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold">Survival Requirement</h4>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">
                                    Based on your internal score of <span className="text-white font-bold">{data.internal_marks}/{data.max_internal_marks}</span>
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-accent">{finalsIntel.requiredPercentage}%</span>
                                    <span className="text-slate-500 text-sm">required in finals ({data.exam_weightage} marks weight)</span>
                                </div>
                            </div>

                            <div className="glass-dark p-6 rounded-2xl flex flex-col justify-center text-center min-w-[150px]">
                                <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-2xl font-black">{data.weekly_study_hours}</p>
                                <p className="text-[10px] font-black uppercase text-slate-500">Hrs/Week Effort</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

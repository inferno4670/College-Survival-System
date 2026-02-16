"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Loader2,
    Target,
    Users,
    Award,
    Clock,
    FileText
} from "lucide-react";
import Link from "next/link";

export default function EditSubjectPage() {
    const { id } = useParams();
    const [subject, setSubject] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSubjectData = async () => {
            const { data: s } = await supabase.from("subjects").select("*").eq("id", id).single();
            const { data: d } = await supabase.from("subject_data").select("*").eq("subject_id", id).single();

            setSubject(s);
            setData(d);
            setLoading(false);
        };

        fetchSubjectData();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from("subject_data")
            .update({
                classes_held: parseInt(data.classes_held),
                classes_attended: parseInt(data.classes_attended),
                attendance_required: parseInt(data.attendance_required),
                internal_marks: parseFloat(data.internal_marks),
                max_internal_marks: parseFloat(data.max_internal_marks),
                passing_marks: parseFloat(data.passing_marks),
                exam_weightage: parseFloat(data.exam_weightage),
                weekly_study_hours: parseFloat(data.weekly_study_hours),
                assignment_completion: parseFloat(data.assignment_completion),
            })
            .eq("subject_id", id);

        if (!error) {
            router.push("/dashboard");
        }
        setSaving(false);
    };

    const handleChange = (field: string, value: any) => {
        setData({ ...data, [field]: value });
    };

    if (loading) return <div className="p-10 animate-pulse bg-slate-800 rounded-3xl h-96" />;

    const sections = [
        {
            title: "Attendance Intel",
            icon: Users,
            color: "text-blue-400",
            fields: [
                { label: "Classes Held", key: "classes_held", type: "number", icon: Target },
                { label: "Classes Attended", key: "classes_attended", type: "number", icon: CheckCircle2 },
                { label: "Min. Required (%)", key: "attendance_required", type: "number", icon: AlertTriangle },
            ]
        },
        {
            title: "Academic Firepower",
            icon: Award,
            color: "text-purple-400",
            fields: [
                { label: "Internal Marks", key: "internal_marks", type: "number", icon: Star },
                { label: "Max Internal", key: "max_internal_marks", type: "number", icon: Maximize },
                { label: "Passing Threshold", key: "passing_marks", type: "number", icon: Flag },
                { label: "Exam Weightage (%)", key: "exam_weightage", type: "number", icon: Percent },
            ]
        },
        {
            title: "Mission Effort",
            icon: Clock,
            color: "text-emerald-400",
            fields: [
                { label: "Study Hours / Week", key: "weekly_study_hours", type: "number", icon: Timer },
                { label: "Assignment %", key: "assignment_completion", type: "number", icon: FileCheck },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Abort Mission
                </Link>
                <h1 className="text-2xl font-black font-outfit uppercase tracking-wider text-slate-500">
                    Intel Entry: <span className="text-white">{subject?.name}</span>
                </h1>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, sIdx) => (
                        <motion.div
                            key={sIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sIdx * 0.1 }}
                            className={`glass p-6 rounded-3xl border border-white/5 space-y-6 ${sIdx === 1 ? 'md:row-span-2' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <section.icon className={`w-6 h-6 ${section.color}`} />
                                <h2 className="text-xl font-bold font-outfit">{section.title}</h2>
                            </div>

                            <div className="space-y-4">
                                {section.fields.map((field, fIdx) => (
                                    <div key={fIdx} className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 ml-1">
                                            {field.label}
                                        </label>
                                        <div className="relative">
                                            {/* @ts-ignore */}
                                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type={field.type}
                                                step="0.01"
                                                required
                                                value={data?.[field.key] ?? ""}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-12 py-3.5 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end pt-6"
                >
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {saving ? "Deploying Data..." : "Finalize & Analyze"}
                    </button>
                </motion.div>
            </form>
        </div>
    );
}

// Missing icons for mapping
import {
    CheckCircle2,
    AlertTriangle,
    Star,
    Maximize,
    Flag,
    Percent,
    Timer,
    FileCheck
} from "lucide-react";

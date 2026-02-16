"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Calculator,
    ArrowRight,
    Zap,
    Target,
    AlertCircle,
    CheckCircle2,
    RotateCcw,
    Skull
} from "lucide-react";
import { calculateRequiredFinalsScore } from "@/lib/calculations";

export default function CalculatorPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Calculator States
    const [internalMarks, setInternalMarks] = useState(0);
    const [maxInternal, setMaxInternal] = useState(40);
    const [targetMarks, setTargetMarks] = useState(40);
    const [examWeight, setExamWeight] = useState(60);

    useEffect(() => {
        const fetchSubjects = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("subjects")
                    .select("*, subject_data(*)")
                    .eq("user_id", user.id);
                setSubjects(data || []);
            }
            setLoading(false);
        };
        fetchSubjects();
    }, []);

    const handleSubjectSelect = (subject: any) => {
        setSelectedSubject(subject);
        const data = subject.subject_data?.[0];
        if (data) {
            setInternalMarks(data.internal_marks || 0);
            setMaxInternal(data.max_internal_marks || 40);
            setTargetMarks(data.passing_marks || 40);
            setExamWeight(data.exam_weightage || 60);
        }
    };

    const result = calculateRequiredFinalsScore({
        internal_marks: internalMarks,
        passing_marks: targetMarks,
        exam_weightage: examWeight,
        // Other fields not used by this specific calculation but required by interface
        classes_held: 0,
        classes_attended: 0,
        attendance_required: 0,
        max_internal_marks: maxInternal,
        weekly_study_hours: 0,
        assignment_completion: 0
    });

    const isImpossible = result.requiredPercentage > 100;
    const isAlreadyPassed = result.requiredMarks === 0;

    if (loading) return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg" />
            <div className="h-64 glass animate-pulse rounded-3xl" />
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black font-outfit mb-2">Effort Calculator</h1>
                <p className="text-slate-400">Calculate exactly how much effort you need to survive your finals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Inputs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl border border-white/5 space-y-8"
                >
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preset From Subject</label>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSubjectSelect(s)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSubject?.id === s.id
                                        ? "bg-primary text-white"
                                        : "bg-white/5 hover:bg-white/10 text-slate-400"
                                        }`}
                                >
                                    {s.name}
                                </button>
                            ))}
                            {subjects.length === 0 && <p className="text-xs text-slate-500 italic">No subjects found to preset</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-slate-300">Internal Marks Obtained</label>
                                <span className="text-primary font-bold">{internalMarks} / {maxInternal}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={maxInternal}
                                value={internalMarks}
                                onChange={(e) => setInternalMarks(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-slate-300">Target Passing Marks (Total)</label>
                                <span className="text-secondary font-bold">{targetMarks}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={targetMarks}
                                onChange={(e) => setTargetMarks(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-slate-300">Semester Exam Weightage</label>
                                <span className="text-slate-300 font-bold">{examWeight}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={examWeight}
                                onChange={(e) => setExamWeight(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedSubject(null);
                            setInternalMarks(0);
                            setTargetMarks(40);
                            setExamWeight(60);
                        }}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset Calculator
                    </button>
                </motion.div>

                {/* Results */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-6"
                >
                    <div className={`p-8 rounded-3xl border ${isImpossible ? "bg-danger/10 border-danger/20" :
                        isAlreadyPassed ? "bg-success/10 border-success/20" :
                            "glass border-white/5"
                        } flex-1 flex flex-col items-center justify-center text-center space-y-6`}>
                        <div className={`p-4 rounded-2xl ${isImpossible ? "bg-danger/20 text-danger" :
                            isAlreadyPassed ? "bg-success/20 text-success" :
                                "bg-primary/20 text-primary"
                            }`}>
                            {isImpossible ? <Skull className="w-12 h-12" /> :
                                isAlreadyPassed ? <CheckCircle2 className="w-12 h-12" /> :
                                    <Target className="w-12 h-12" />}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">
                                {isImpossible ? "Mission Impossible" :
                                    isAlreadyPassed ? "Mission Accomplished" :
                                        "Required Marks"}
                            </h2>
                            <p className="text-slate-400 text-sm max-w-xs">
                                {isImpossible ? "Even with a perfect score in finals, the target marks are mathematically unreachable." :
                                    isAlreadyPassed ? "You have already secured enough marks to pass this subject." :
                                        "Minimum marks needed in the upcoming semester examination."}
                            </p>
                        </div>

                        {!isImpossible && !isAlreadyPassed && (
                            <div className="space-y-1">
                                <span className="text-6xl font-black text-gradient font-outfit">{result.requiredMarks}</span>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Marks to Survive</p>
                            </div>
                        )}

                        {isImpossible && (
                            <div className="flex items-center gap-2 text-danger font-bold bg-danger/10 px-4 py-2 rounded-full border border-danger/20">
                                <AlertCircle className="w-4 h-4" />
                                <span>Academic Risk Level: Fatal</span>
                            </div>
                        )}

                        {isAlreadyPassed && (
                            <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-4 py-2 rounded-full border border-success/20">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Survival Status: Guaranteed</span>
                            </div>
                        )}
                    </div>

                    {!isImpossible && !isAlreadyPassed && (
                        <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-secondary/20 text-secondary">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Required Intensity</p>
                                    <h4 className="text-lg font-bold">{result.requiredPercentage}% of Final Exam</h4>
                                </div>
                            </div>
                            <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-secondary rounded-full"
                                    style={{ width: `${Math.min(100, result.requiredPercentage)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="glass p-6 rounded-2xl border border-white/5 flex gap-4">
                        <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                            Calculations are based on the standard weighting model where: (Finals Mark / 100) * Weightage + Internals = Total Mark.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

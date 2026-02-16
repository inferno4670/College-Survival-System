"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    TrendingUp,
    Shield,
    Skull
} from "lucide-react";
import Link from "next/link";
import { calculateAttendancePercentage } from "@/lib/calculations";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this subject? All associated data will be lost.")) {
            const { error } = await supabase.from("subjects").delete().eq("id", id);
            if (!error) {
                setSubjects(subjects.filter(s => s.id !== id));
            }
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 glass animate-pulse rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black font-outfit mb-2">My Subjects</h1>
                    <p className="text-slate-400">Manage your academic load and tracking metrics.</p>
                </div>
                <Link
                    href="/dashboard/subjects/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all text-center justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Subject</span>
                </Link>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                </div>
                <button className="p-3 glass rounded-xl border border-white/5 hover:bg-white/5 text-slate-400">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {filteredSubjects.length === 0 ? (
                <div className="glass p-20 rounded-3xl text-center border-dashed border-2 border-white/10">
                    <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No subjects found</h3>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                        {searchQuery ? `No matches for "${searchQuery}"` : "You haven't added any subjects yet. Start your survival tracker now."}
                    </p>
                    <Link
                        href="/dashboard/subjects/new"
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                    >
                        Add First Subject
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((subject, idx) => {
                        const data = subject.subject_data?.[0];
                        const attendance = data ? calculateAttendancePercentage(data.classes_held, data.classes_attended) : 0;
                        const isAtRisk = attendance < (data?.attendance_required || 75);

                        return (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass rounded-2xl border border-white/5 hover:border-primary/20 transition-all flex flex-col group overflow-hidden"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 overflow-hidden">
                                            <h3 className="text-xl font-bold font-outfit truncate">{subject.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Mission ID: {subject.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/dashboard/subjects/${subject.id}/edit`}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-danger transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-dark p-3 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Attendance</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-lg font-bold ${isAtRisk ? 'text-danger' : 'text-success'}`}>
                                                    {Math.round(attendance)}%
                                                </p>
                                                {isAtRisk ? <Skull className="w-3 h-3 text-danger" /> : <Shield className="w-3 h-3 text-success" />}
                                            </div>
                                        </div>
                                        <div className="glass-dark p-3 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Required</p>
                                            <p className="text-lg font-bold text-slate-300">
                                                {data?.attendance_required || 75}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isAtRisk ? 'bg-danger' : 'bg-primary'}`}
                                                style={{ width: `${Math.min(100, attendance)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/subjects/${subject.id}`}
                                    className="mt-auto p-4 bg-white/5 hover:bg-white/10 text-sm font-bold border-t border-white/5 flex items-center justify-center gap-2 transition-all"
                                >
                                    View Full Intel <TrendingUp className="w-4 h-4 text-primary" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

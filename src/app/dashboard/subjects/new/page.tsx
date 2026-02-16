"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewSubjectPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: subject, error: sError } = await supabase
                .from("subjects")
                .insert({ name, user_id: user.id })
                .select()
                .single();

            if (!sError && subject) {
                // Initialize subject_data with defaults
                await supabase
                    .from("subject_data")
                    .insert({ subject_id: subject.id });

                router.push(`/dashboard/subjects/${subject.id}/edit`);
            }
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-3xl border border-white/5 space-y-8"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-black font-outfit">Initialize Subject</h1>
                    <p className="text-slate-400">Give your mission a name. Example: "Engineering Mathematics-IV"</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Subject Name</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-lg font-medium"
                                placeholder="e.g. Data Structures & Algorithms"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {loading ? "Initializing..." : "Proceed to Intel Entry"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

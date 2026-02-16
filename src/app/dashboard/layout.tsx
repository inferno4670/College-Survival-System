"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Calculator,
    Settings,
    LogOut,
    User as UserIcon,
    Menu,
    X
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
        { name: "Risk Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Effort Calc", href: "/dashboard/calculator", icon: Calculator },
    ];

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-72 glass-dark border-r border-white/5 p-6 fixed h-full z-50">
                <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                    <div className="relative w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary font-bold text-xl text-white">
                        <img
                            src="/assets/branding/logo.png"
                            alt="Logo"
                            className="absolute inset-0 w-full h-full object-cover z-20"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                            }}
                            onLoad={(e) => {
                                (e.target as HTMLImageElement).style.display = 'block';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'none';
                            }}
                        />
                        <span className="relative z-10" style={{ display: 'none' }}>C</span>
                    </div>
                    <span className="text-2xl font-black font-outfit tracking-tight">CSIS</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            <UserIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{user?.user_metadata?.full_name || "Student"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="md:hidden fixed top-0 w-full glass z-[100] p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 overflow-hidden rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-secondary font-bold text-lg text-white">
                        <img
                            src="/assets/branding/logo.png"
                            alt="Logo"
                            className="absolute inset-0 w-full h-full object-cover z-20"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                            }}
                            onLoad={(e) => {
                                (e.target as HTMLImageElement).style.display = 'block';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'none';
                            }}
                        />
                        <span className="relative z-10" style={{ display: 'none' }}>C</span>
                    </div>
                    <span className="text-xl font-bold font-outfit">CSIS</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 glass rounded-lg">
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="md:hidden fixed inset-0 z-[90] glass-dark p-6 pt-24"
                    >
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center gap-4 px-6 py-4 rounded-2xl glass text-xl font-medium"
                                >
                                    <item.icon className="w-6 h-6 text-primary" />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl glass text-xl font-medium text-danger"
                            >
                                <LogOut className="w-6 h-6" />
                                Sign Out
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 pt-20 md:pt-0 p-6 md:p-10 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

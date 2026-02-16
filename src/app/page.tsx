"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-semibold mb-4">
          <Shield className="w-4 h-4" />
          <span>Academic Intelligence Redefined</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black font-outfit tracking-tight mb-6">
          Master Your <br />
          <span className="text-gradient">Academic Survival</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
          The ultimate dashboard for college students. Track attendance, predict pass probabilities,
          and calculate your next move with surgical precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/signup"
            className="group relative px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <span className="relative flex items-center gap-2">
              Join the Survival Squad <Zap className="w-5 h-5 fill-current" />
            </span>
          </Link>

          <Link
            href="/login"
            className="px-10 py-5 glass hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all border border-white/10"
          >
            Access Dashboard
          </Link>
        </div>

        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { title: "Risk Analytics", desc: "Real-time probability of passing based on attendance and internal marks.", icon: TrendingUp },
            { title: "Bunk Predictor", desc: "Know exactly how many classes you can miss while staying safe.", icon: Shield },
            { title: "Effort Calculator", desc: "Calculate the exact score needed in finals to survive the semester.", icon: Zap }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="glass p-6 rounded-2xl text-left border border-white/5 hover:border-white/20 transition-all group"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 font-outfit">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

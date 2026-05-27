"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, BarChart3, Bot } from "lucide-react";

export default function AuthPage() {
  // Mock sign-in — will be replaced with Firebase Auth
  const handleGoogleSignIn = () => {
    window.location.href = "/dashboard";
  };

  const features = [
    { icon: BookOpen, label: "3,000+ GMAT questions", desc: "Organized by chapter & topic" },
    { icon: BarChart3, label: "Deep analytics", desc: "Track every minute of study" },
    { icon: Bot, label: "AI Tutor", desc: "Get instant explanations" },
  ];

  return (
    <main className="min-h-dvh bg-app flex items-center justify-center p-0 md:p-6 overflow-x-hidden relative">

      {/* Premium ambient glows for desktop backing */}
      <div className="hidden md:block absolute w-[450px] h-[450px] rounded-full bg-accent/8 blur-[100px] pointer-events-none z-0 -translate-x-[200px]" />
      <div className="hidden md:block absolute w-[400px] h-[400px] rounded-full bg-accent-cyan/4 blur-[90px] pointer-events-none z-0 translate-x-[220px] -translate-y-[100px]" />

      {/* Main High-Fidelity Mobile Viewport Frame Container */}
      <div
        className="w-full max-w-[430px] h-dvh md:h-[880px] md:max-h-[90vh] bg-surface md:rounded-[40px] md:border md:border-app relative flex flex-col justify-between p-8 shadow-2xl overflow-y-auto z-10"
        style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-surface))" }}
      >
        {/* Top Spacer / logo */}
        <div className="flex flex-col items-center flex-1 justify-center py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3.5 mb-10"
          >
            <div className="w-12 h-12 rounded-[16px] gradient-accent flex items-center justify-center shadow-lg">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-app tracking-tight">GMAT Focus</h1>
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Premium Prep</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-extrabold text-app mb-3 leading-tight tracking-tight">
              The smarter way to<br />
              <span className="gradient-text">ace the GMAT.</span>
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-[280px] mx-auto">
              AI-powered, adaptive GMAT Focus preparation designed for ambitious MBA candidates.
            </p>
          </motion.div>

          {/* Feature pills with comfortable spacing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="w-full space-y-3 mb-8"
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl border border-app transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: "rgb(var(--bg-elevated))",
                  borderColor: "rgb(var(--border))",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(var(--accent), 0.12)" }}
                >
                  <Icon size={18} style={{ color: "rgb(var(--accent))" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-app">{label}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="w-full mt-auto pt-4"
        >
          <motion.button
            id="google-sign-in-btn"
            onClick={handleGoogleSignIn}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all duration-200 border cursor-pointer shadow-md"
            style={{
              background: "rgb(var(--bg-surface))",
              borderColor: "rgb(var(--border))",
              color: "rgb(var(--text-primary))",
            }}
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
            <ArrowRight size={16} className="ml-0.5" style={{ color: "rgb(var(--accent))" }} />
          </motion.button>

          <p className="text-center text-[10px] text-muted mt-5 leading-normal">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

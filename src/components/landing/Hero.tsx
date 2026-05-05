'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bot, Cpu, Gauge, Shield, Terminal, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full animate-pulse-slow" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-300">AI-Powered Robotics Assistant</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-semibold tracking-[-0.04em] mb-8 leading-tight">
            Botcasso <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-600">
              Toolbox.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light tracking-tight">
            The ultimate AI assistant for the Elegoo Smart Robot Car V4.0. <br className="hidden md:block" />
            Precisión de ingeniería y código optimizado en una interfaz perfecta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black hover:bg-zinc-100 rounded-full font-medium transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                Start Chatting
              </motion.button>
            </Link>
            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/40 text-white rounded-full font-medium transition-all backdrop-blur-md"
              >
                Documentation
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 md:mt-48">
          {[
            { icon: <Cpu strokeWidth={1.5} size={28} />, title: "Hardware Logic", desc: "Expert guidance on wiring sensors, motors, and the Arduino Uno shield." },
            { icon: <Terminal strokeWidth={1.5} size={28} />, title: "Code Generation", desc: "Generate optimized C++ code for obstacle avoidance, line tracking, and more." },
            { icon: <Gauge strokeWidth={1.5} size={28} />, title: "Real-time Debugging", desc: "Paste your errors and get instant fixes with detailed technical explanations." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-[32px] bg-[#111111]/40 backdrop-blur-2xl border border-white/5 hover:bg-[#1A1A1A]/60 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center text-blue-400 mb-8 group-hover:scale-105 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

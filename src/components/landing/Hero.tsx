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
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0071E3]/20 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow" />

      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between mt-20 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-left flex-1"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-300">AI-Powered Robotics</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-semibold tracking-[-0.04em] mb-8 leading-[1.1]">
            Botcasso <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 via-[#0071E3] to-indigo-600">
              Toolbox.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#86868B] max-w-xl mb-12 leading-relaxed font-light tracking-tight">
            The ultimate AI engineering assistant for the Elegoo Smart Robot Car V4.0. <br className="hidden md:block" />
            Code, debug, and build with unprecedented precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#F5F5F7] text-black hover:bg-white rounded-full font-medium transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] w-full sm:w-auto"
              >
                Start Chatting
              </motion.button>
            </Link>
            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/40 text-[#F5F5F7] rounded-full font-medium transition-all backdrop-blur-md w-full sm:w-auto"
              >
                Read Documentation
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px] hidden md:flex items-center justify-center perspective-1000"
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotateX: [0, 2, 0],
              rotateY: [0, -2, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-full h-full max-w-[600px] max-h-[600px] z-20"
          >
            <img 
              src="/bot/hero-robot.png" 
              alt="Botcasso AI Robot" 
              className="object-contain w-full h-full drop-shadow-[0_20px_50px_rgba(0,113,227,0.3)]"
            />
          </motion.div>
          {/* Floor Reflection / Shadow */}
          <motion.div 
            animate={{ 
              scale: [1, 0.9, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 w-3/4 h-8 bg-[#0071E3] rounded-full blur-[40px] z-10"
          />
        </motion.div>
      </div>

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

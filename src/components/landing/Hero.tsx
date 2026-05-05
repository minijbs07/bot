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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium tracking-wider uppercase text-zinc-400">AI-Powered Robotics Assistant</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
            Elegoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">AI Assistant</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Programa, depura y construye proyectos para tu Smart Robot Car V4.0 usando IA especializada. Precisión de ingeniería con el poder de la IA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Start Chatting
              </motion.button>
            </Link>
            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold transition-all backdrop-blur-sm"
              >
                Documentation
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          {[
            { icon: <Cpu size={24} />, title: "Hardware Logic", desc: "Expert guidance on wiring sensors, motors, and the Arduino Uno shield." },
            { icon: <Terminal size={24} />, title: "Code Generation", desc: "Generate optimized C++ code for obstacle avoidance, line tracking, and more." },
            { icon: <Gauge size={24} />, title: "Real-time Debugging", desc: "Paste your errors and get instant fixes with detailed technical explanations." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="glass p-8 rounded-3xl hover:border-white/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

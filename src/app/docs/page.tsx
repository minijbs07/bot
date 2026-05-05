'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Cpu,
  Eye,
  Rss,
  Activity,
  Layers,
  Terminal,
  Zap,
  Shield,
  Smartphone,
  Navigation,
  Bot
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface DocItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  details?: string[];
  pins?: Record<string, string>;
}

const TECHNICAL_SPECS: { category: string; items: DocItem[] }[] = [
  {
    category: 'Chapter 01-02: Preparation & Move',
    items: [
      {
        id: 'controller',
        title: 'Arduino Uno R3 Shield',
        icon: <Cpu strokeWidth={1.5} />,
        content: 'The customized Elegoo shield that sits on top of the Arduino Uno, providing centralized connections for all V4.0 components.',
        details: [
          'Microcontroller: ATmega328P',
          'Operating Voltage: 5V',
          'Integrated Motor Driver: TB6612',
          'Power: 2x 18650 Li-ion Batteries'
        ]
      },
      {
        id: 'motor-driver',
        title: 'TB6612 Dual Motor Driver',
        icon: <Zap strokeWidth={1.5} />,
        content: 'Replaces the older L298N module. Highly efficient H-Bridge driver for controlling all four DC motors in 4WD configuration.',
        pins: {
          'PWMA (Left Speed)': 'Pin 5',
          'PWMB (Right Speed)': 'Pin 6',
          'AIN1 (Left Dir)': 'Pin 7',
          'BIN1 (Right Dir)': 'Pin 8',
          'STBY': 'Pin 3 (Standby)'
        }
      },
    ]
  },
  {
    category: 'Chapter 03 & 06: Line Tracking & Following',
    items: [
      {
        id: 'line-tracking',
        title: 'ITR20001 3-Channel IR Array',
        icon: <Rss strokeWidth={1.5} />,
        content: 'Located underneath the chassis. Uses three infrared sensors to detect black lines on white surfaces for autonomous navigation.',
        pins: {
          'Left Sensor (L)': 'Pin A2',
          'Middle Sensor (M)': 'Pin A1',
          'Right Sensor (R)': 'Pin A0'
        }
      },
      {
        id: 'follow',
        title: 'Follow Mode Logic',
        icon: <Navigation strokeWidth={1.5} />,
        content: 'Combines ultrasonic distance sensing and IR reflectivity to follow a moving object (like a hand or a box) at a fixed distance.',
      },
    ]
  },
  {
    category: 'Chapter 04-05: Servo & Obstacle Avoidance',
    items: [
      {
        id: 'ultrasonic',
        title: 'HC-SR04 Ultrasonic Sensor',
        icon: <Eye strokeWidth={1.5} />,
        content: 'The "eyes" of the robot. Sends a 40kHz acoustic pulse to measure distance to obstacles up to 400cm.',
        pins: {
          'TRIG (Output pulse)': 'Pin 13',
          'ECHO (Input pulse)': 'Pin 12'
        }
      },
      {
        id: 'servo',
        title: 'SG90 Pan-Tilt Servo',
        icon: <Activity strokeWidth={1.5} />,
        content: 'Mounted on the front chassis to sweep the ultrasonic sensor horizontally and vertically for a 3D obstacle map.',
        pins: {
          'Servo Z (Horizontal / Pan)': 'Pin 10',
          'Servo Y (Vertical / Tilt)': 'Pin 11'
        }
      },
    ]
  },
  {
    category: 'Chapter 07-08: Extras & Bluetooth App',
    items: [
      {
        id: 'bluetooth',
        title: 'Bluetooth 4.0 BLE Module',
        icon: <Smartphone strokeWidth={1.5} />,
        content: 'Enables wireless remote control and DIY programming via the official Elegoo BLE App on iOS and Android.',
        pins: {
          'RX': 'TX on Arduino',
          'TX': 'RX on Arduino'
        }
      },
      {
        id: 'others',
        title: 'RGB & IR Peripherals',
        icon: <Layers strokeWidth={1.5} />,
        content: 'Additional modules for status indicators (WS2812B RGB) and remote control via IR.',
        pins: {
          'RGB LED Strip': 'Pin 4',
          'IR Receiver': 'Pin 9',
          'Voltage Sensor': 'Pin A3'
        }
      },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setMounted(true);
      }
    };
    checkUser();
  }, [router]);

  const filteredSpecs = TECHNICAL_SPECS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      cat.category.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] font-sans pb-32">
      {/* Apple-like Header */}
      <header className="border-b border-white/10 bg-[#1D1D1F]/80 backdrop-blur-2xl sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-[#86868B] hover:text-[#F5F5F7] transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </Link>
          </div>
          <div className="relative max-w-sm w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" size={14} />
            <input
              type="text"
              placeholder="Search components or pins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2C2C2E]/50 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:bg-[#2C2C2E] focus:border-[#0071E3]/50 transition-all text-[#F5F5F7] placeholder:text-[#86868B]"
            />
          </div>
          <Link href="/chat">
            <button className="flex items-center gap-2 px-4 py-1.5 bg-[#F5F5F7] hover:bg-white text-black text-xs font-semibold rounded-full transition-all shadow-sm">
              <Bot size={14} />
              <span>Ask AI</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 text-center flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#1D1D1F] backdrop-blur-md mb-8"
          >
            <Shield size={12} className="text-[#0071E3]" />
            <span className="text-[10px] font-semibold tracking-[0.15em] text-[#0071E3] uppercase">Official Manual V4.0</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.04em] mb-6 leading-tight">
            Engineering <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Documentation.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#86868B] max-w-2xl leading-relaxed font-light tracking-tight">
            Complete technical breakdown, pin mappings, and module logic extracted directly from the Elegoo Smart Robot Car V4.0 tutorials.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-20"
        >
          {filteredSpecs.map((category, idx) => (
            <motion.section key={idx} variants={itemVariants}>
              <h2 className="text-sm font-semibold text-[#F5F5F7] uppercase tracking-[0.2em] mb-8 pb-4 border-b border-white/10">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-8 rounded-[32px] bg-[#1D1D1F] border border-white/5 hover:bg-[#2C2C2E] transition-all duration-500 group relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute -top-10 -right-10 text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-500">
                      <div className="transform scale-[4] rotate-12">
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#F5F5F7] group-hover:scale-110 group-hover:bg-[#0071E3] transition-all duration-500 shadow-sm">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-medium tracking-tight text-[#F5F5F7]">{item.title}</h3>
                    </div>

                    <p className="text-[#86868B] text-sm leading-relaxed mb-8 flex-1 relative z-10 font-light">
                      {item.content}
                    </p>

                    {item.details && (
                      <div className="space-y-3 mb-6 relative z-10">
                        <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-widest">Specifications</p>
                        <div className="flex flex-col gap-2">
                          {item.details.map((detail, i) => (
                            <div key={i} className="text-xs text-[#F5F5F7] flex items-center gap-3">
                              <div className="w-1 h-1 rounded-full bg-[#0071E3]" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.pins && (
                      <div className="space-y-3 relative z-10 mt-auto pt-6 border-t border-white/5">
                        <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-widest">Pin Mapping</p>
                        <div className="grid grid-cols-1 gap-1">
                          {Object.entries(item.pins).map(([key, val], i) => (
                            <div key={i} className="flex justify-between items-center py-1.5">
                              <span className="text-xs text-[#86868B] font-light">{key}</span>
                              <span className="text-xs font-mono font-medium text-[#F5F5F7] bg-white/5 px-2 py-0.5 rounded">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Quick Reference Table Apple-style */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-32 pt-20 border-t border-white/10"
        >
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#F5F5F7] mb-6">
              <Terminal strokeWidth={1.5} size={20} />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Programming Quick Start</h2>
            <p className="text-[#86868B] mt-3 font-light">Essential code logic snippets at a glance.</p>
          </div>
          
          <div className="overflow-hidden rounded-[32px] bg-[#1D1D1F] border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#2C2C2E]/50 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-semibold text-[#86868B] uppercase tracking-widest text-[10px]">Functionality</th>
                  <th className="px-8 py-5 font-semibold text-[#86868B] uppercase tracking-widest text-[10px]">Implementation Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light">
                <tr className="hover:bg-[#2C2C2E]/30 transition-colors">
                  <td className="px-8 py-5 text-[#F5F5F7]">Forward Movement</td>
                  <td className="px-8 py-5 font-mono text-[#86868B] text-xs">AIN1:HIGH, BIN1:HIGH, PWMA:Speed, PWMB:Speed</td>
                </tr>
                <tr className="hover:bg-[#2C2C2E]/30 transition-colors">
                  <td className="px-8 py-5 text-[#F5F5F7]">Obstacle Detection</td>
                  <td className="px-8 py-5 font-mono text-[#86868B] text-xs">PULSEIN(ECHO, HIGH) * 0.0173</td>
                </tr>
                <tr className="hover:bg-[#2C2C2E]/30 transition-colors">
                  <td className="px-8 py-5 text-[#F5F5F7]">Line Tracking (Black)</td>
                  <td className="px-8 py-5 font-mono text-[#86868B] text-xs">analogRead(PIN) {">"} THRESHOLD</td>
                </tr>
                <tr className="hover:bg-[#2C2C2E]/30 transition-colors">
                  <td className="px-8 py-5 text-[#F5F5F7]">Bluetooth Data Rx</td>
                  <td className="px-8 py-5 font-mono text-[#86868B] text-xs">Serial.read() == 'f' (Forward)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

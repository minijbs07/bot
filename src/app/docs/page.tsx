'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronRight, 
  Cpu, 
  Gamepad, 
  Eye, 
  Rss, 
  Layers,
  ArrowLeft,
  Terminal,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    category: 'Hardware Core',
    items: [
      { 
        id: 'controller', 
        title: 'Arduino Uno R3', 
        icon: <Cpu />, 
        content: 'The central processing unit of the robot. Responsible for executing the main loop and handling all sensor data.',
        details: [
          'Microcontroller: ATmega328P',
          'Operating Voltage: 5V',
          'Flash Memory: 32 KB',
          'SRAM: 2 KB',
          'EEPROM: 1 KB',
          'Clock Speed: 16 MHz'
        ]
      },
      { 
        id: 'motor-driver', 
        title: 'TB6612 Motor Driver', 
        icon: <Zap />, 
        content: 'Dual H-Bridge driver used to control the speed and direction of DC motors with high efficiency.',
        pins: {
          'PWMA': 'Pin 5',
          'PWMB': 'Pin 6',
          'AIN1': 'Pin 7',
          'BIN1': 'Pin 8',
          'STBY': 'Pin 3 (Standby)'
        }
      },
    ]
  },
  {
    category: 'Sensing & Input',
    items: [
      { 
        id: 'ultrasonic', 
        title: 'HC-SR04 Ultrasonic', 
        icon: <Eye />, 
        content: 'Measures distances from 2cm to 400cm by emitting ultrasonic waves and measuring the echo time.',
        pins: {
          'TRIG': 'Pin 13',
          'ECHO': 'Pin 12'
        }
      },
      { 
        id: 'line-tracking', 
        title: 'ITR20001 IR Array', 
        icon: <Rss />, 
        content: 'A 3-channel infrared sensor array for following lines based on surface reflectivity.',
        pins: {
          'Left (L)': 'Pin A2',
          'Middle (M)': 'Pin A1',
          'Right (R)': 'Pin A0'
        }
      },
    ]
  },
  {
    category: 'Actuators & Extras',
    items: [
      { 
        id: 'servo', 
        title: 'SG90 Servo', 
        icon: <Activity />, 
        content: 'Used to rotate the ultrasonic sensor for obstacle scanning and detection.',
        pins: {
          'Servo Z (Horizontal)': 'Pin 10',
          'Servo Y (Vertical)': 'Pin 11'
        }
      },
      { 
        id: 'others', 
        title: 'Peripherals', 
        icon: <Layers />, 
        content: 'Additional modules for interaction and status monitoring.',
        pins: {
          'RGB LED (WS2812B)': 'Pin 4',
          'IR Receiver': 'Pin 9',
          'Onboard Key': 'Pin 2',
          'Voltage Detection': 'Pin A3'
        }
      },
    ]
  }
];

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
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
      item.content.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-zinc-400" />
            </Link>
            <Link href="/">
              <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-white/10 shadow-sm ml-2 hover:scale-[1.02] transition-transform active:scale-100 cursor-pointer">
                <div className="relative w-6 h-6 overflow-hidden shrink-0">
                  <img src="/bot/logo.png" alt="Logo" className="object-contain w-full h-full brightness-0" />
                </div>
                <span className="font-black text-[10px] tracking-[0.1em] text-black whitespace-nowrap">BOTCASSO TOOLBOX</span>
              </div>
            </Link>
          </div>
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search pins, modules, specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <Link href="/chat">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Start Chat
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
            <Shield size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Official Specification V4.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Elegoo Smart Robot Car Kit V4.0</h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Technical breakdown of the hardware components, pin mappings, and functional logic extracted from the official documentation.
          </p>
        </motion.div>

        <div className="grid gap-16">
          {filteredSpecs.map((category, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-10 border-l-2 border-blue-600 pl-4">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item) => (
                  <div 
                    key={item.id}
                    className="glass-dark border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity text-[120px]">
                      {item.icon}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">{item.content}</p>
                    
                    {item.details && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Specifications</p>
                        <div className="grid grid-cols-2 gap-2">
                          {item.details.map((detail, i) => (
                            <div key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-blue-500" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.pins && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Pin Mapping</p>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(item.pins).map(([key, val], i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                              <span className="text-xs font-mono text-zinc-400">{key}</span>
                              <span className="text-xs font-bold text-blue-400">{val}</span>
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
        </div>

        {/* Quick Reference Table */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-20 border-t border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <Terminal size={24} className="text-blue-500" />
            <h2 className="text-2xl font-bold">Programming Quick Start</h2>
          </div>
          <div className="glass overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Function</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Pins / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-6 py-4 font-medium">Forward Movement</td>
                  <td className="px-6 py-4 font-mono text-zinc-400 text-xs">AIN1:HIGH, BIN1:HIGH, PWMA:Speed, PWMB:Speed</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Obstacle Detection</td>
                  <td className="px-6 py-4 font-mono text-zinc-400 text-xs">TRIG:13, ECHO:12 | Servo:10 (180°)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Line Tracking</td>
                  <td className="px-6 py-4 font-mono text-zinc-400 text-xs">L:A2, M:A1, R:A0 (Analog Reads)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">RGB Status</td>
                  <td className="px-6 py-4 font-mono text-zinc-400 text-xs">Pin 4 (NeoPixel/FastLED)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

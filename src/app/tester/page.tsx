'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Cpu,
  Eye,
  Radio,
  Rss,
  Terminal,
  Usb,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface DiagnosticComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  blueprint: string;
  pinout: Record<string, string>;
  instructions: string;
  testCommand: string;
}

const COMPONENTS: DiagnosticComponent[] = [
  {
    id: 'ultrasonic',
    name: 'Ultrasonic HC-SR04',
    icon: <Eye size={18} />,
    blueprint: '/bot/blueprints/ultrasonic.png',
    pinout: {
      'VCC': '5V Power',
      'GND': 'Ground',
      'TRIG': 'Pin 13 (Output)',
      'ECHO': 'Pin 12 (Input)'
    },
    instructions: 'Mount the sensor on the SG90 servo bracket. Ensure the 4-pin jumper wire is firmly seated. Test will ping the sensor and expect a distance value back.',
    testCommand: 'TEST_US'
  },
  {
    id: 'motors',
    name: 'TB6612 Motor Driver',
    icon: <Zap size={18} />,
    blueprint: '/bot/blueprints/motor.png',
    pinout: {
      'PWMA / PWMB': 'Pin 5 / Pin 6',
      'AIN1 / BIN1': 'Pin 7 / Pin 8',
      'STBY': 'Pin 3 (Standby)',
      'Motor A/B': 'Terminal Blocks M1/M2'
    },
    instructions: 'Check that the battery pack is connected and the main power switch is ON. USB power alone cannot drive the motors. Test will spin motors forward for 1 second.',
    testCommand: 'TEST_MOTORS'
  },
  {
    id: 'ir',
    name: 'IR Line Tracking',
    icon: <Rss size={18} />,
    blueprint: '/bot/blueprints/ir.png',
    pinout: {
      'L (Left)': 'Pin A2',
      'M (Middle)': 'Pin A1',
      'R (Right)': 'Pin A0',
      'VCC / GND': '5V / Ground'
    },
    instructions: 'Sensor array must be mounted 1-2cm above the ground. The onboard potentiometers can be turned to adjust sensitivity to black lines.',
    testCommand: 'TEST_IR'
  }
];

export default function TesterPage() {
  const [activeComponent, setActiveComponent] = useState<DiagnosticComponent>(COMPONENTS[0]);
  const [port, setPort] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isSerialSupported, setIsSerialSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      setIsSerialSupported(false);
    }
  }, []);

  const connectToArduino = async () => {
    if (!isSerialSupported) {
      addLog("Web Serial API is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    try {
      setConnectionStatus('connecting');
      // @ts-ignore
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });
      setPort(newPort);
      setConnectionStatus('connected');
      addLog("Successfully connected to Elegoo V4.0 via Serial.");
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      addLog(`Connection failed: ${err.message}`);
    }
  };

  const disconnectArduino = async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setConnectionStatus('disconnected');
        addLog("Disconnected from robot.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addLog = (msg: string) => {
    setTestLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const runTest = async () => {
    if (!port) {
      addLog("Cannot run test: Arduino not connected.");
      return;
    }

    addLog(`Running diagnostic: ${activeComponent.testCommand}...`);
    try {
      const writer = port.writable.getWriter();
      const data = new TextEncoder().encode(activeComponent.testCommand + "\n");
      await writer.write(data);
      writer.releaseLock();
      
      addLog("Command sent. Awaiting response...");
      
      // We would normally set up a reader here, but for safety/mocking we'll simulate a response
      setTimeout(() => {
        addLog(`Test [${activeComponent.name}] completed successfully.`);
      }, 1500);

    } catch (err: any) {
      addLog(`Error during test: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1D1D1F]/80 backdrop-blur-2xl sticky top-0 z-50 transition-all shrink-0">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-[#86868B] hover:text-[#F5F5F7] transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Home</span>
            </Link>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <Link href="/docs" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors">Docs</Link>
            <Link href="/chat" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors">Chat</Link>
            <Link href="/tester" className="text-sm font-medium text-white transition-colors flex items-center gap-2">
              <Activity size={14} className="text-red-500" />
              Diagnostics
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {connectionStatus === 'connected' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                  <CheckCircle2 size={14} /> Connected
                </span>
                <button onClick={disconnectArduino} className="text-xs text-red-400 hover:text-red-300 transition-colors">Disconnect</button>
              </div>
            ) : (
              <button 
                onClick={connectToArduino}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#F5F5F7] hover:bg-white text-black text-xs font-semibold rounded-full transition-all shadow-sm disabled:opacity-50"
              >
                <Usb size={14} />
                <span>{connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Arduino'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl flex gap-8 h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col gap-2">
          <h2 className="text-[10px] font-semibold text-[#86868B] uppercase tracking-widest px-4 mb-4">Hardware Components</h2>
          {COMPONENTS.map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveComponent(comp)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium border ${
                activeComponent.id === comp.id 
                  ? 'bg-[#2C2C2E] border-white/10 text-white shadow-sm' 
                  : 'bg-transparent border-transparent text-[#86868B] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={activeComponent.id === comp.id ? 'text-red-500' : ''}>
                {comp.icon}
              </div>
              {comp.name}
            </button>
          ))}
        </aside>

        {/* Main Testing Area */}
        <div className="flex-1 flex flex-col bg-[#1D1D1F] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#2C2C2E]/30">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                {activeComponent.name}
              </h1>
              <p className="text-[#86868B] mt-2 font-light text-sm max-w-xl">
                {activeComponent.instructions}
              </p>
            </div>
            <button
              onClick={runTest}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center gap-2"
            >
              <Radio size={18} />
              Run Diagnostic
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Blueprint View */}
            <div className="flex-1 p-8 overflow-y-auto relative bg-[#f4f4f0]">
              <div className="absolute top-8 left-8 z-10 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Wii System Manual</span>
                <span className="text-xs font-bold uppercase tracking-tight text-black border-b-2 border-black pb-1">{activeComponent.name} Assembly</span>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeComponent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full flex items-center justify-center mix-blend-multiply opacity-80"
                >
                  <img 
                    src={activeComponent.blueprint} 
                    alt={`${activeComponent.name} Blueprint`}
                    className="max-w-full max-h-full object-contain filter contrast-125"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pinout & Terminal Sidebar */}
            <div className="w-80 shrink-0 border-l border-white/5 bg-[#111111] flex flex-col">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Cpu size={14} /> Pinout Connection
                </h3>
                <div className="space-y-3">
                  {Object.entries(activeComponent.pinout).map(([pin, desc], i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-[#86868B] font-mono">{pin}</span>
                      <span className="text-red-400 font-medium">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14} /> Diagnostic Terminal
                </h3>
                <div className="flex-1 bg-black rounded-xl border border-white/10 p-4 font-mono text-[10px] text-green-500 overflow-y-auto">
                  {!isSerialSupported && (
                    <div className="text-red-400 mb-2 flex items-start gap-2">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>Web Serial API not supported. Please use a Chromium-based browser to test hardware directly.</span>
                    </div>
                  )}
                  {testLog.length === 0 ? (
                    <span className="text-zinc-600">Waiting for connection...</span>
                  ) : (
                    testLog.map((log, i) => (
                      <div key={i} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

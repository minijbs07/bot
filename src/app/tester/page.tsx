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
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  RotateCw
} from 'lucide-react';
import Link from 'next/link';

interface Pin {
  id: string;
  pin: string;
  desc: string;
  detail: string;
}

interface DiagnosticComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  blueprint: string;
  pins: Pin[];
  instructions: string;
  testCommand: string;
}

const COMPONENTS: DiagnosticComponent[] = [
  {
    id: 'ultrasonic',
    name: 'Ultrasonic HC-SR04',
    icon: <Eye size={18} />,
    blueprint: '/bot/blueprints/ultrasonic.png',
    pins: [
      { id: 'vcc', pin: 'VCC', desc: '5V Power', detail: 'Supplies 5V power to the sensor. Do not use 3.3V as it will not function correctly.' },
      { id: 'gnd', pin: 'GND', desc: 'Ground', detail: 'Completes the power circuit. Connect to any GND pin on the Arduino.' },
      { id: 'trig', pin: 'TRIG', desc: 'Pin 13 (Output)', detail: 'Sends a 10-microsecond high pulse to trigger the ultrasonic burst.' },
      { id: 'echo', pin: 'ECHO', desc: 'Pin 12 (Input)', detail: 'Goes high while waiting for the echo to return. Time high = distance.' }
    ],
    instructions: 'Mount the sensor on the SG90 servo bracket. Ensure the 4-pin jumper wire is firmly seated. Test will ping the sensor and expect a distance value back.',
    testCommand: 'TEST_US'
  },
  {
    id: 'motors',
    name: 'TB6612 Motor Driver',
    icon: <Zap size={18} />,
    blueprint: '/bot/blueprints/motor.png',
    pins: [
      { id: 'pwma', pin: 'PWMA/B', desc: 'Pins 5/6', detail: 'Pulse Width Modulation (PWM) pins to control the speed of Motor A and B.' },
      { id: 'ain', pin: 'AIN/BIN', desc: 'Pins 7/8', detail: 'Logic pins to control the direction of the motors (Forward/Reverse).' },
      { id: 'stby', pin: 'STBY', desc: 'Pin 3', detail: 'Standby pin. Must be pulled HIGH to enable the motor driver.' },
      { id: 'out', pin: 'Motor A/B', desc: 'M1/M2', detail: 'Screw terminals connecting directly to the DC motors.' }
    ],
    instructions: 'Check that the battery pack is connected and the main power switch is ON. USB power alone cannot drive the motors. Test will spin motors forward for 1 second.',
    testCommand: 'TEST_MOTORS'
  },
  {
    id: 'ir',
    name: 'IR Line Tracking',
    icon: <Rss size={18} />,
    blueprint: '/bot/blueprints/ir.png',
    pins: [
      { id: 'l', pin: 'L (Left)', desc: 'Pin A2', detail: 'Reads the analog value from the left IR sensor.' },
      { id: 'm', pin: 'M (Mid)', desc: 'Pin A1', detail: 'Reads the analog value from the center IR sensor.' },
      { id: 'r', pin: 'R (Right)', desc: 'Pin A0', detail: 'Reads the analog value from the right IR sensor.' },
      { id: 'pwr', pin: 'VCC/GND', desc: '5V/Ground', detail: 'Power delivery to the IR emitters and receivers.' }
    ],
    instructions: 'Sensor array must be mounted 1-2cm above the ground. The onboard potentiometers can be turned to adjust sensitivity to black lines.',
    testCommand: 'TEST_IR'
  },
  {
    id: 'servo',
    name: 'SG90 Micro Servo',
    icon: <RotateCw size={18} />,
    blueprint: '/bot/blueprints/servo.png',
    pins: [
      { id: 'pwm', pin: 'PWM (Orange)', desc: 'Pin 10 (Z/Pan) / Pin 11 (Y/Tilt)', detail: 'Pulse Width Modulation signal used to dictate the angle of the servo horn.' },
      { id: 'vcc', pin: 'VCC (Red)', desc: '5V Power', detail: 'Supplies logic and motor power to the servo. Powered by the external battery.' },
      { id: 'gnd', pin: 'GND (Brown)', desc: 'Ground', detail: 'Completes the power circuit for the servo motor.' }
    ],
    instructions: 'Servos are used to pan and tilt the ultrasonic sensor. The diagnostic will sweep the servo from 0 to 180 degrees and back to center (90).',
    testCommand: 'TEST_SERVO'
  }
];

export default function TesterPage() {
  const [activeComponent, setActiveComponent] = useState<DiagnosticComponent>(COMPONENTS[0]);
  const [activePinIndex, setActivePinIndex] = useState<number | null>(null);
  const [port, setPort] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isSerialSupported, setIsSerialSupported] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      setIsSerialSupported(false);
    }
  }, []);

  // Reset pin selection when component changes
  useEffect(() => {
    setActivePinIndex(null);
  }, [activeComponent.id]);

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
      const data = new TextEncoder().encode(activeComponent.testCommand + "\\n");
      await writer.write(data);
      writer.releaseLock();
      
      addLog("Command sent. Awaiting real response...");
      
      const reader = port.readable.getReader();
      const decoder = new TextDecoder();
      
      try {
        const readPromise = (async () => {
          let responseText = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            responseText += decoder.decode(value);
            if (responseText.includes('\\n')) {
              return responseText.trim();
            }
          }
          return responseText;
        })();
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
        
        const result = await Promise.race([readPromise, timeoutPromise]);
        
        if (typeof result === 'string') {
          addLog(`Arduino: ${result}`);
          if (result.includes('OK') || result.includes('SUCCESS') || result.includes('1')) {
            addLog(`Test [${activeComponent.name}] passed!`);
          } else {
            addLog(`Test [${activeComponent.name}] status: ${result}`);
          }
        }
      } catch (err: any) {
        if (err.message === 'timeout') {
          addLog(`Test [${activeComponent.name}] timed out. Is diagnostic firmware loaded?`);
        } else {
          throw err;
        }
      } finally {
        reader.releaseLock();
      }

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
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
            <Link href="/docs" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors hidden sm:block">Docs</Link>
            <Link href="/chat" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors hidden sm:block">Chat</Link>
            <Link href="/tester" className="text-sm font-medium text-white transition-colors flex items-center gap-2">
              <Activity size={14} className="text-red-500" />
              Diagnostics
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {connectionStatus === 'connected' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 hidden sm:flex">
                  <CheckCircle2 size={14} /> Connected
                </span>
                <button onClick={disconnectArduino} className="text-xs text-red-400 hover:text-red-300 transition-colors">Disconnect</button>
              </div>
            ) : (
              <button 
                onClick={connectToArduino}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#F5F5F7] hover:bg-white text-black text-xs font-semibold rounded-full transition-all shadow-sm disabled:opacity-50"
              >
                <Usb size={14} />
                <span className="hidden sm:inline">{connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Arduino'}</span>
                <span className="sm:hidden">{connectionStatus === 'connecting' ? '...' : 'Connect'}</span>
              </button>
            )}
            <button 
              className="sm:hidden p-2 text-zinc-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden bg-[#1D1D1F] border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link href="/docs" className="text-sm font-medium text-zinc-300" onClick={() => setMobileMenuOpen(false)}>Documentation</Link>
              <Link href="/chat" className="text-sm font-medium text-zinc-300" onClick={() => setMobileMenuOpen(false)}>AI Chat</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8 max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-8 lg:h-[calc(100vh-88px)] min-h-0">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          <h2 className="text-[10px] font-semibold text-[#86868B] uppercase tracking-widest px-4 mb-2 lg:mb-4 hidden lg:block">Hardware Components</h2>
          {COMPONENTS.map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveComponent(comp)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium border whitespace-nowrap lg:whitespace-normal shrink-0 ${
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
        <div className="flex-1 flex flex-col bg-[#1D1D1F] rounded-[24px] sm:rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative min-h-[600px] lg:min-h-0">
          <div className="p-4 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#2C2C2E]/30 shrink-0">
            <div>
              <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                {activeComponent.name}
              </h1>
              <p className="text-[#86868B] mt-2 font-light text-xs sm:text-sm max-w-xl">
                {activeComponent.instructions}
              </p>
            </div>
            <button
              onClick={runTest}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2 shrink-0"
            >
              <Radio size={18} />
              Run Diagnostic
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Blueprint View */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto relative bg-[#f4f4f0] min-h-[300px]">
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex flex-col gap-1">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-black">Hardware Schematic</span>
                <span className="text-xs font-bold uppercase tracking-tight text-black border-b-2 border-black pb-1">{activeComponent.name}</span>
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

            {/* Interactive Pinout & Terminal */}
            <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#111111] flex flex-col h-auto lg:h-full">
              <div className="p-4 sm:p-6 border-b border-white/5 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Cpu size={14} /> Assembly Steps
                  </h3>
                  <span className="bg-white/10 text-white font-bold px-2 py-1 rounded text-[10px]">
                    {activePinIndex !== null ? `STEP ${activePinIndex + 1} OF ${activeComponent.pins.length}` : 'GUIDE'}
                  </span>
                </div>

                <div className="relative overflow-hidden min-h-[160px] flex items-center">
                  <AnimatePresence mode="wait">
                    {activePinIndex !== null && (
                      <motion.div
                        key={activePinIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 shadow-lg">
                          <h4 className="text-lg font-bold text-white mb-1">{activeComponent.pins[activePinIndex].pin}</h4>
                          <div className="text-red-400 font-mono text-xs mb-3">Connect to: {activeComponent.pins[activePinIndex].desc}</div>
                          <p className="text-zinc-400 text-xs leading-relaxed">
                            {activeComponent.pins[activePinIndex].detail}
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {activePinIndex === null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full text-center text-zinc-500 text-sm flex flex-col items-center gap-3"
                      >
                        <Cpu size={24} className="opacity-20" />
                        <span>Click 'Start Assembly' to view step-by-step LEGO style instructions.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={() => setActivePinIndex(prev => prev !== null && prev > 0 ? prev - 1 : null)}
                    disabled={activePinIndex === null}
                    className="px-3 py-1.5 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors text-xs font-medium"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setActivePinIndex(prev => prev === null ? 0 : Math.min(prev + 1, activeComponent.pins.length - 1))}
                    disabled={activePinIndex === activeComponent.pins.length - 1}
                    className="px-3 py-1.5 bg-blue-600 rounded-lg disabled:opacity-30 hover:bg-blue-500 transition-colors text-white text-xs font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    {activePinIndex === null ? 'Start Assembly' : 'Next Step'}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-[200px]">
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

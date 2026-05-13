'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, Message } from '@/store/useChatStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Terminal,
  Cpu,
  Navigation,
  Radio,
  Activity,
  Menu,
  X,
  LogOut,
  Bot,
  Paperclip,
  FileText,
  ArrowLeft,
  Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/ui/CodeBlock';

const TEMPLATES = [
  { id: 'avoid', title: 'Obstacle Avoidance', icon: <Cpu size={16} />, prompt: 'Generate code for basic obstacle avoidance using the ultrasonic sensor.' },
  { id: 'line', title: 'Line Follower', icon: <Activity size={16} />, prompt: 'Create a line tracking algorithm for the 3-channel IR sensor module.' },
  { id: 'bluetooth', title: 'Bluetooth Control', icon: <Radio size={16} />, prompt: 'How do I set up and program the Bluetooth module for remote control?' },
  { id: 'servo', title: 'Servo Scanner', icon: <Navigation size={16} />, prompt: 'Code to scan 180 degrees with the servo and find the furthest path.' },
];

export default function ChatPage() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    setCurrentSession,
    addMessage,
    deleteSession,
    updateSessionTitle
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [attachedFiles, setAttachedFiles] = useState<{name: string, content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('user_cancelled');
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleCreateNewSession = () => {
    if (isGenerating) cancelGeneration();
    const id = createNewSession(user.id);
    setCurrentSession(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const supabase = (await import('@/lib/supabase')).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setMounted(true);
      }
    };
    checkUser();
  }, [router]);

  // Filter sessions for current user
  const userSessions = sessions.filter(s => s.userId === user?.id);
  const currentSession = userSessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    if (mounted && user) {
      if (!currentSessionId && userSessions.length === 0) {
        createNewSession(user.id);
      } else if (!currentSessionId && userSessions.length > 0) {
        setCurrentSession(userSessions[0].id);
      }
    }
  }, [currentSessionId, userSessions, createNewSession, setCurrentSession, mounted, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && attachedFiles.length === 0) || isGenerating || !currentSessionId || !user) return;

    const filesText = attachedFiles.map(f => `\n\nFile attached: ${f.name}\n\`\`\`${f.name.split('.').pop() || ''}\n${f.content}\n\`\`\`\n`).join('');
    const finalText = text + filesText;

    const userMsg: Message = {
      role: 'user',
      content: finalText,
      timestamp: Date.now()
    };

    addMessage(currentSessionId, userMsg);
    setInput('');
    setAttachedFiles([]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('timeout');
      }
    }, 60000); // 60 seconds strict timeout

    try {
      const supabase = (await import('@/lib/supabase')).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("No active session");

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: currentSession?.messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || '';
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now()
      };

      addMessage(currentSessionId, assistantMsg);

    } catch (error: any) {
      console.error("Chat generation error:", error);

      if (error.name === 'AbortError' || error === 'timeout') {
        addMessage(currentSessionId, {
          role: 'assistant',
          content: '⚠️ **Generation Timeout / Aborted:** The connection took too long to respond or was stopped. OpenRouter providers may be experiencing high load. Please try again.',
          timestamp: Date.now()
        });
      } else {
        addMessage(currentSessionId, {
          role: 'assistant',
          content: `⚠️ **System Error:** ${error.message || 'Unknown error occurred'}`,
          timestamp: Date.now()
        });
      }

      if (currentSession?.messages.length === 0) {
        updateSessionTitle(currentSessionId, text.slice(0, 30) + (text.length > 30 ? '...' : ''));
      }
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setAttachedFiles(prev => [...prev, { name: file.name, content }]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!mounted || !user) return (
    <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
        <Terminal className="text-blue-500 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-[#1D1D1F]/80 backdrop-blur-2xl flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors md:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-[#86868B] hover:text-[#F5F5F7] transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
          <Link href="/docs" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors hidden sm:block">Docs</Link>
          <Link href="/chat" className="text-sm font-medium text-white transition-colors hidden sm:block">Chat</Link>
          <Link href="/tester" className="text-sm font-medium text-[#86868B] hover:text-white transition-colors hidden sm:flex items-center gap-2">
            <Activity size={14} className="text-red-500" />
            Diagnostics
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
            {currentSession?.title || 'New Thread'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="border-r border-white/5 bg-[#0D0D0D] flex flex-col absolute md:relative z-50 h-full overflow-hidden shrink-0"
      >
        <div className="p-4 flex flex-col h-full w-[300px]">
          <div className="mb-8 px-1">
            <Link href="/">
              <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-xl border border-white/10 shadow-lg hover:scale-[1.02] transition-transform active:scale-100 cursor-pointer">
                <div className="relative w-7 h-7 overflow-hidden shrink-0">
                  <img src="/bot/logo.png" alt="Logo" className="object-contain w-full h-full brightness-0" />
                </div>
                <span className="font-black text-xs tracking-[0.1em] text-black whitespace-nowrap">BOTCASSO TOOLBOX</span>
              </div>
            </Link>
          </div>

          <button
            onClick={handleCreateNewSession}
            className="flex items-center gap-2 w-full p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium mb-6 group"
          >
            <Plus size={16} className="text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
            New Thread
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2 mb-2">History</p>
            {userSessions.filter(s => s.messages.length > 0 || s.id === currentSessionId).map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={`flex items-center justify-between group px-3 py-2.5 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-white/5 text-zinc-400 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-400' : 'text-zinc-500'} />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">Templates</p>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSend(t.prompt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-zinc-400 transition-all text-left group"
              >
                <div className="text-zinc-500 group-hover:text-blue-400 transition-colors">{t.icon}</div>
                <span className="text-xs font-medium">{t.title}</span>
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-white/5 space-y-2">
            <Link href="/tester">
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all text-left group cursor-pointer mb-2">
                <Activity size={16} className="text-red-500" />
                <span className="text-xs font-medium">Hardware Diagnostics</span>
              </div>
            </Link>
            <button
              onClick={async () => {
                const supabase = (await import('@/lib/supabase')).createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all text-left group"
            >
              <LogOut size={16} />
              <span className="text-xs font-medium">Secure Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full">

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
        >
          {currentSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-6"
              >
                <Terminal size={32} />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">System Initialized</h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Ready to assist with your ELEGOO Smart Robot Car V4.0. <br /> Ask me to generate code, explain hardware, or debug your project.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {TEMPLATES.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSend(t.prompt)}
                    className="p-4 glass rounded-2xl text-left hover:border-white/20 transition-all group"
                  >
                    <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                    <div className="font-bold text-sm mb-1">{t.title}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{t.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentSession?.messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] rounded-[24px] px-6 py-4 ${msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/5 text-zinc-200 shadow-sm'
                  }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                      <Bot size={12} /> Assistant
                    </div>
                  )}
                  <div className={`prose prose-invert max-w-none text-sm md:text-[15px] leading-relaxed ${msg.role === 'user' ? 'prose-p:text-white' : 'text-zinc-200'
                    }`}>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                              {...props}
                            />
                          ) : (
                            <code className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {isGenerating && i === currentSession.messages.length - 1 && msg.role === 'assistant' && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 ml-1 bg-blue-500 align-middle"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="glass-dark border border-white/5 rounded-3xl p-6 flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-3xl group-focus-within:bg-blue-600/20 transition-all opacity-0 group-focus-within:opacity-100" />
            
            <div className="relative glass rounded-2xl border border-white/10 flex flex-col p-2 transition-all focus-within:border-blue-500/50">
              
              {/* Attached Files Visuals */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border-b border-white/5 mb-2">
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium">
                      <FileText size={12} />
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <button 
                        onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt,.ino,.cpp,.c,.h,.swift,.js,.ts,.py,.json,.md"
                />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all m-1 flex-shrink-0"
                title="Attach code file"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything or attach code..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 p-3 resize-none min-h-[56px] max-h-[200px]"
                rows={1}
              />
              {isGenerating ? (
                <button
                  onClick={cancelGeneration}
                  className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all m-1 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse"
                  title="Stop generation"
                >
                  <Square size={20} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && attachedFiles.length === 0)}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-xl transition-all m-1"
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              )}
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-medium">
            Next.js 15 • DeepSeek-R1 • AI Robotics Engineering
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}

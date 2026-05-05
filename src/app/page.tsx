import Hero from '@/components/landing/Hero';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Hero />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-white/10 shadow-sm">
            <div className="relative w-6 h-6 overflow-hidden shrink-0">
              <img src="/bot/logo.png" alt="Logo" className="object-contain w-full h-full brightness-0" />
            </div>
            <span className="font-black text-[10px] tracking-[0.1em] text-black whitespace-nowrap uppercase">Botcasso Toolbox</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white cursor-pointer transition-colors">Terms</Link>
            <a href="https://github.com/minijbs07/bot" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">Github</a>
          </div>
          <p className="text-zinc-600 text-xs mt-8 md:mt-0 font-medium tracking-wide uppercase">
            © 2025 Botcasso Toolbox • Engineering Excellence
          </p>
        </div>
      </footer>
    </main>
  );
}

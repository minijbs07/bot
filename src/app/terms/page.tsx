import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-zinc-100 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm font-medium text-blue-400 hover:text-blue-300 mb-12 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">Last updated: May 2025</p>

        <div className="space-y-12 text-zinc-300 leading-relaxed font-light">
          <section>
            <h2 className="text-2xl font-medium text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing Botcasso Toolbox, you agree to be bound by these Terms of Service. This platform is provided as an educational engineering tool designed specifically for the Elegoo Smart Robot Car Kit V4.0.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-4">2. University Access</h2>
            <p>
              Access to the AI generation features is restricted to authorized academic domains. You agree not to attempt bypassing these restrictions or sharing authorized accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-4">3. Code Reliability</h2>
            <p>
              While the AI assistant is optimized for the Elegoo V4.0 kit, code generation is provided "as is". You are responsible for verifying code logic before executing it on physical hardware to prevent damage to the servos, motors, or the Arduino shield.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

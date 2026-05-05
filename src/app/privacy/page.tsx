import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-zinc-100 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm font-medium text-blue-400 hover:text-blue-300 mb-12 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">Last updated: May 2025</p>

        <div className="space-y-12 text-zinc-300 leading-relaxed font-light">
          <section>
            <h2 className="text-2xl font-medium text-white mb-4">1. Information Collection</h2>
            <p>
              Botcasso Toolbox exclusively uses authentication to provide secure access to our AI tools. We only collect the email address provided during your university-scoped registration (e.g., @alumnos.unican.es) for identification purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-4">2. Chat History</h2>
            <p>
              Your conversations are securely stored within our Supabase database and associated strictly with your account ID. We do not use your private project queries to train models. Our AI backend relies on standard API proxies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-4">3. Third-Party Services</h2>
            <p>
              We utilize Supabase for secure authentication and database persistence. Chat generation relies on external AI providers (OpenRouter) where queries are securely proxied. We do not share your email with marketing or third-party tracking services.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

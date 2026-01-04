'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-800/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <span className="text-4xl">💪</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Dietas & Treinos
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Acompanhe sua evolução física com controle total sobre nutrição, treinos e medidas corporais.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            Acessar Sistema
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-2xl">🥗</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nutrição</h3>
              <p className="text-slate-400 text-sm">
                Controle macros e micros com precisão
              </p>
            </div>
            
            <div className="group p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-2xl">🏋️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Treinos</h3>
              <p className="text-slate-400 text-sm">
                Monte fichas e registre sessões
              </p>
            </div>
            
            <div className="group p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Evolução</h3>
              <p className="text-slate-400 text-sm">
                Acompanhe seu progresso visual
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-xl shadow-red-600/20">
            <span className="text-3xl">🔒</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white">
          Acesso Restrito
        </h2>
        
        <p className="text-gray-400 max-w-sm mx-auto">
          A criação de novas contas é exclusiva para administradores. 
          Se você precisa de acesso, entre em contato com o administrador do sistema.
        </p>

        <div className="pt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300"
          >
            Fazer Login
          </Link>
        </div>

        <div className="pt-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-gray-300 transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

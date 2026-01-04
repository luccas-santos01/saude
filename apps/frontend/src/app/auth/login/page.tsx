'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      login(response.data.user, response.data.accessToken);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card bg-slate-800 border border-slate-700">
          <div className="card-body p-8">
            {/* Logo/Título */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <span className="text-3xl">💪</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                Entre na sua conta
              </h2>
              <p className="mt-2 text-slate-400">
                Acesse o sistema para gerenciar suas dietas e treinos
              </p>
            </div>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="seu@email.com"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres',
                    },
                  })}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Link voltar */}
            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                ← Voltar para a página inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

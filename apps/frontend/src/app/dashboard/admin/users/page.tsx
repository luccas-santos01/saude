'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<Array<{name: string, email: string}>>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  // Verificar se é admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/dashboard');
      toast.error('Acesso negado. Apenas administradores.');
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Usuário criado com sucesso!');
      setCreatedUsers([...createdUsers, { name: data.name, email: data.email }]);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Criar Novo Usuário</h1>
        <p className="text-gray-400 mt-1">
          Adicione novos usuários ao sistema
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Nome do usuário"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="email@exemplo.com"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <input
                id="password"
                type="password"
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
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) =>
                    value === password || 'As senhas não coincidem',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3"
            >
              {isLoading ? 'Criando usuário...' : 'Criar Usuário'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista de usuários criados na sessão */}
      {createdUsers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Usuários Criados</h2>
          <div className="space-y-2">
            {createdUsers.map((u, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

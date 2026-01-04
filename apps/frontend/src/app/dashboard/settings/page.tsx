'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { usersApi, authApi } from '@/lib/api';
import {
  UserCircleIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmitProfile = async (data: ProfileForm) => {
    try {
      const response = await usersApi.updateProfile(data);
      updateUser(response.data);
      toast.success('Perfil atualizado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    try {
      await usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Senha alterada!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.'
    );

    if (!confirmed) return;

    const doubleConfirmed = confirm(
      'Esta é sua última chance. Deseja realmente excluir sua conta?'
    );

    if (!doubleConfirmed) return;

    try {
      await usersApi.deleteAccount();
      toast.success('Conta excluída');
      logout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir conta');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'password', name: 'Senha', icon: KeyIcon },
    { id: 'danger', name: 'Zona de Perigo', icon: TrashIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie sua conta e preferências</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item w-full flex items-center gap-3 ${
                  activeTab === tab.id ? 'nav-item-active' : ''
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Informações do Perfil
                </h2>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="form-group">
                    <label className="label">Nome</label>
                    <input
                      className={`input ${profileErrors.name ? 'input-error' : ''}`}
                      {...registerProfile('name', { required: 'Nome é obrigatório' })}
                    />
                    {profileErrors.name && (
                      <p className="error-message">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">E-mail</label>
                    <input
                      type="email"
                      className={`input ${profileErrors.email ? 'input-error' : ''}`}
                      {...registerProfile('email', {
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'E-mail inválido',
                        },
                      })}
                    />
                    {profileErrors.email && (
                      <p className="error-message">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="btn-primary"
                    >
                      {isSubmittingProfile ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Alterar Senha
                </h2>
                <form
                  onSubmit={handleSubmitPassword(onSubmitPassword)}
                  className="space-y-4"
                >
                  <div className="form-group">
                    <label className="label">Senha atual</label>
                    <input
                      type="password"
                      className={`input ${
                        passwordErrors.currentPassword ? 'input-error' : ''
                      }`}
                      {...registerPassword('currentPassword', {
                        required: 'Senha atual é obrigatória',
                      })}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="error-message">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Nova senha</label>
                    <input
                      type="password"
                      className={`input ${
                        passwordErrors.newPassword ? 'input-error' : ''
                      }`}
                      {...registerPassword('newPassword', {
                        required: 'Nova senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'A senha deve ter pelo menos 6 caracteres',
                        },
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="error-message">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Confirmar nova senha</label>
                    <input
                      type="password"
                      className={`input ${
                        passwordErrors.confirmPassword ? 'input-error' : ''
                      }`}
                      {...registerPassword('confirmPassword', {
                        required: 'Confirmação é obrigatória',
                        validate: (value) =>
                          value === newPassword || 'As senhas não coincidem',
                      })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="error-message">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="btn-primary"
                    >
                      {isSubmittingPassword ? 'Alterando...' : 'Alterar senha'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="card border-red-900/50">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-red-400 mb-4">
                  Zona de Perigo
                </h2>
                <p className="text-slate-400 mb-4">
                  Uma vez que você excluir sua conta, não há como voltar atrás. Por
                  favor, tenha certeza.
                </p>
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-red-400 mb-2">
                    Ao excluir sua conta:
                  </h3>
                  <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
                    <li>Todos os seus alimentos cadastrados serão excluídos</li>
                    <li>Todas as suas refeições serão excluídas</li>
                    <li>Todas as suas dietas serão excluídas</li>
                    <li>Todos os seus exercícios serão excluídos</li>
                    <li>Todos os seus treinos serão excluídos</li>
                    <li>Todas as suas medidas corporais serão excluídas</li>
                    <li>Todas as suas fotos de progresso serão excluídas</li>
                  </ul>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                >
                  Excluir minha conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

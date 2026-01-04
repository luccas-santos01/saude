'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  HomeIcon,
  BeakerIcon,
  FireIcon,
  ChartBarIcon,
  CameraIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Alimentos', href: '/dashboard/foods', icon: BeakerIcon },
  { name: 'Refeições', href: '/dashboard/meals', icon: BeakerIcon },
  { name: 'Dietas', href: '/dashboard/diets', icon: BeakerIcon },
  { name: 'Exercícios', href: '/dashboard/exercises', icon: FireIcon },
  { name: 'Treinos', href: '/dashboard/trainings', icon: FireIcon },
  { name: 'Medidas', href: '/dashboard/measurements', icon: ChartBarIcon },
  { name: 'Progresso', href: '/dashboard/progress', icon: CameraIcon },
  { name: 'Configurações', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const adminNavigation = [
  { name: 'Criar Usuário', href: '/dashboard/admin/users', icon: UserPlusIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const allNavigation = user?.isAdmin 
    ? [...navigation, ...adminNavigation]
    : navigation;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-900 shadow-xl border-r border-slate-700">
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
            <span className="text-xl font-bold text-indigo-400">Dieta App</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-icon"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'nav-item',
                  pathname === item.href && 'nav-item-active'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-900 border-r border-slate-700">
          <div className="flex h-16 items-center px-6 border-b border-slate-700">
            <span className="text-xl font-bold text-indigo-400">Dieta App</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'nav-item',
                  pathname === item.href && 'nav-item-active'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Sair"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-700 bg-slate-900 px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold text-indigo-400">Dieta App</span>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

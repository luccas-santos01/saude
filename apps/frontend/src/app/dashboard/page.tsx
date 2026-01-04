'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  bodyMeasurementsApi,
  dietsApi,
  trainingsApi,
  foodsApi,
} from '@/lib/api';
import {
  ScaleIcon,
  FireIcon,
  BeakerIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Stats {
  foodsCount: number;
  dietsCount: number;
  trainingsCount: number;
  sessionsCount: number;
}

interface LatestMeasurement {
  weight?: number;
  bodyFat?: number;
  date: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    foodsCount: 0,
    dietsCount: 0,
    trainingsCount: 0,
    sessionsCount: 0,
  });
  const [latestMeasurement, setLatestMeasurement] = useState<LatestMeasurement | null>(null);
  const [weightProgress, setWeightProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [foods, diets, trainings, sessions, latest, progress] = await Promise.all([
        foodsApi.getAll(),
        dietsApi.getAll(),
        trainingsApi.getAll(),
        trainingsApi.getSessions(10),
        bodyMeasurementsApi.getLatest().catch(() => null),
        bodyMeasurementsApi.getProgress('weight', 30).catch(() => []),
      ]);

      setStats({
        foodsCount: foods.data.length,
        dietsCount: diets.data.length,
        trainingsCount: trainings.data.length,
        sessionsCount: sessions.data.length,
      });

      if (latest?.data) {
        setLatestMeasurement(latest.data);
      }

      if (progress?.data) {
        setWeightProgress(
          progress.data
            .filter((p: any) => p.value !== null)
            .map((p: any) => ({
              date: format(new Date(p.date), 'dd/MM', { locale: ptBR }),
              peso: p.value,
            }))
        );
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="page-subtitle">
          Aqui está um resumo do seu progresso.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <BeakerIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Alimentos</p>
              <p className="stat-value">{stats.foodsCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500/20">
              <BeakerIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Dietas</p>
              <p className="stat-value">{stats.dietsCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <FireIcon className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Treinos</p>
              <p className="stat-value">{stats.trainingsCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <CalendarIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Sessões</p>
              <p className="stat-value">{stats.sessionsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Última Medida */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center">
              <ScaleIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Última Medida
            </h2>
          </div>
          <div className="card-body">
            {latestMeasurement ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-500">
                    {latestMeasurement.weight || '-'}
                    <span className="text-lg font-normal text-slate-400">kg</span>
                  </p>
                  <p className="text-sm text-slate-400">Peso</p>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-500">
                    {latestMeasurement.bodyFat || '-'}
                    <span className="text-lg font-normal text-slate-400">%</span>
                  </p>
                  <p className="text-sm text-slate-400">Gordura</p>
                </div>
                <div className="col-span-2 text-center text-sm text-slate-500">
                  Registrado em{' '}
                  {format(new Date(latestMeasurement.date), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Nenhuma medida registrada ainda.
              </p>
            )}
          </div>
        </div>

        {/* Gráfico de Peso */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-100">
              Evolução do Peso
            </h2>
          </div>
          <div className="card-body">
            {weightProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" fontSize={12} stroke="#94a3b8" />
                  <YAxis fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Registre suas medidas para visualizar a evolução.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-slate-100">Ações Rápidas</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/foods"
              className="card-hover flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors"
            >
              <BeakerIcon className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-400">
                Novo Alimento
              </span>
            </a>
            <a
              href="/dashboard/meals"
              className="card-hover flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors"
            >
              <BeakerIcon className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-400">
                Nova Refeição
              </span>
            </a>
            <a
              href="/dashboard/trainings"
              className="card-hover flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors"
            >
              <FireIcon className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-400">
                Novo Treino
              </span>
            </a>
            <a
              href="/dashboard/measurements"
              className="card-hover flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors"
            >
              <ScaleIcon className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-400">
                Registrar Medida
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

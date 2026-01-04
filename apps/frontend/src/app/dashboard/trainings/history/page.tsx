'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { trainingsApi } from '@/lib/api';
import Link from 'next/link';
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface SessionExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  weight?: number;
  notes?: string;
  completed: boolean;
}

interface TrainingSession {
  id: string;
  date: string;
  duration?: number;
  notes?: string;
  completed: boolean;
  training: {
    id: string;
    name: string;
    type: string;
  };
  sessionExercises: SessionExercise[];
}

interface Training {
  id: string;
  name: string;
  type: string;
  trainingExercises: {
    id: string;
    exercise: { id: string; name: string };
    sets: number;
    reps: string;
    weight?: number;
  }[];
}

interface SessionForm {
  trainingId: string;
  date: string;
  duration?: number;
  notes?: string;
}

export default function TrainingHistoryPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [exerciseData, setExerciseData] = useState<
    { exerciseName: string; sets: number; reps: string; weight: number; notes: string; completed: boolean }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionForm>();

  const watchTrainingId = watch('trainingId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (watchTrainingId) {
      const training = trainings.find((t) => t.id === watchTrainingId);
      setSelectedTraining(training || null);
      if (training) {
        setExerciseData(
          training.trainingExercises.map((te) => ({
            exerciseName: te.exercise.name,
            sets: te.sets,
            reps: te.reps,
            weight: te.weight || 0,
            notes: '',
            completed: false,
          }))
        );
      }
    }
  }, [watchTrainingId, trainings]);

  const loadData = async () => {
    try {
      const [sessionsRes, trainingsRes] = await Promise.all([
        trainingsApi.getSessions(50),
        trainingsApi.getAll(),
      ]);
      setSessions(sessionsRes.data);
      setTrainings(trainingsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    reset({
      trainingId: '',
      date: new Date().toISOString().split('T')[0],
      duration: undefined,
      notes: '',
    });
    setSelectedTraining(null);
    setExerciseData([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTraining(null);
    setExerciseData([]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exerciseData];
    updated[index] = { ...updated[index], [field]: value };
    setExerciseData(updated);
  };

  const onSubmit = async (data: SessionForm) => {
    if (!data.trainingId) {
      toast.error('Selecione um treino');
      return;
    }

    try {
      await trainingsApi.createSession(data.trainingId, {
        date: data.date,
        duration: data.duration ? Number(data.duration) : undefined,
        notes: data.notes,
        completed: exerciseData.every((e) => e.completed),
        exercises: exerciseData.map((e) => ({
          exerciseName: e.exerciseName,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || undefined,
          notes: e.notes || undefined,
          completed: e.completed,
        })),
      });
      toast.success('Treino registrado!');
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao registrar treino');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      await trainingsApi.deleteSession(id);
      toast.success('Registro excluído!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir registro');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Agrupar exercícios por nome para mostrar progresso
  const getExerciseHistory = (exerciseName: string) => {
    return sessions
      .flatMap((s) => s.sessionExercises.filter((e) => e.exerciseName === exerciseName))
      .map((e, i, arr) => ({
        ...e,
        date: sessions.find((s) => s.sessionExercises.includes(e))?.date || '',
      }))
      .slice(0, 5);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/trainings" className="btn-ghost p-2">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Histórico de Treinos</h1>
            <p className="text-slate-400">Registre seus treinos e acompanhe sua evolução</p>
          </div>
        </div>
        <button onClick={openModal} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Treino
        </button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Treinos Registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {sessions.filter((s) => s.completed).length}
          </div>
          <div className="stat-label">Treinos Completos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {sessions.filter((s) => {
              const sessionDate = new Date(s.date);
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return sessionDate >= weekAgo;
            }).length}
          </div>
          <div className="stat-label">Esta Semana</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}h
          </div>
          <div className="stat-label">Tempo Total</div>
        </div>
      </div>

      {/* Lista de sessões */}
      {sessions.length === 0 ? (
        <div className="empty-state">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-slate-500" />
          <p className="text-lg font-medium">Nenhum treino registrado</p>
          <p className="text-sm mt-1">Comece registrando seu primeiro treino!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        session.completed
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}
                    >
                      {session.completed ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <ClockIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">
                        {session.training.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {formatDate(session.date)}
                        {session.duration && ` • ${session.duration} min`}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-slate-500 mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Exercícios da sessão */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-400">Exercícios:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {session.sessionExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          exercise.completed
                            ? 'bg-green-900/20 border border-green-800'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span className="text-sm text-slate-100">{exercise.exerciseName}</span>
                        <span className="text-sm text-slate-400">
                          {exercise.sets}x{exercise.reps}
                          {exercise.weight && exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de registro */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="text-lg font-semibold text-slate-100">Registrar Treino</h2>
                <button onClick={closeModal} className="btn-icon">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body space-y-4">
                  <div className="form-group">
                    <label className="label">Treino *</label>
                    <select
                      className={`input ${errors.trainingId ? 'input-error' : ''}`}
                      {...register('trainingId', { required: true })}
                    >
                      <option value="">Selecione um treino</option>
                      {trainings.map((training) => (
                        <option key={training.id} value={training.id}>
                          {training.name} ({training.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Data *</label>
                      <input
                        type="date"
                        className="input"
                        {...register('date', { required: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Duração (min)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="60"
                        {...register('duration')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Observações</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Como foi o treino?"
                      {...register('notes')}
                    />
                  </div>

                  {/* Exercícios do treino selecionado */}
                  {selectedTraining && exerciseData.length > 0 && (
                    <div>
                      <label className="label">Exercícios</label>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {exerciseData.map((exercise, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 ${
                              exercise.completed
                                ? 'border-green-600 bg-green-900/20'
                                : 'border-slate-600 bg-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-100">
                                {exercise.exerciseName}
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={exercise.completed}
                                  onChange={(e) =>
                                    updateExercise(index, 'completed', e.target.checked)
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-400">Feito</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs text-slate-400">Séries</label>
                                <input
                                  type="number"
                                  className="input text-sm"
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    updateExercise(index, 'sets', Number(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-400">Reps</label>
                                <input
                                  className="input text-sm"
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    updateExercise(index, 'reps', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-400">Carga (kg)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  className="input text-sm"
                                  value={exercise.weight}
                                  onChange={(e) =>
                                    updateExercise(index, 'weight', Number(e.target.value))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Salvando...' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

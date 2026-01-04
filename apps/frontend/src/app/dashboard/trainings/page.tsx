'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { trainingsApi, exercisesApi, pdfApi } from '@/lib/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface TrainingExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order: number;
}

interface Training {
  id: string;
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
  trainingExercises: TrainingExercise[];
}

interface TrainingForm {
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
}

const TRAINING_TYPES = [
  'Hipertrofia',
  'Força',
  'Resistência',
  'Funcional',
  'Cardio',
  'HIIT',
  'Flexibilidade',
  'Outro',
];

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<
    { exerciseId: string; sets: number; reps: string; restSeconds: number; notes: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrainingForm>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trainingsRes, exercisesRes] = await Promise.all([
        trainingsApi.getAll(),
        exercisesApi.getAll(),
      ]);
      setTrainings(trainingsRes.data);
      setExercises(exercisesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (training?: Training) => {
    if (training) {
      setEditingTraining(training);
      reset({
        name: training.name,
        description: training.description,
        type: training.type,
        isActive: training.isActive,
      });
      setSelectedExercises(
        training.trainingExercises.map((te) => ({
          exerciseId: te.exercise.id,
          sets: te.sets,
          reps: te.reps,
          restSeconds: te.restSeconds,
          notes: te.notes || '',
        }))
      );
    } else {
      setEditingTraining(null);
      reset({
        name: '',
        type: 'Hipertrofia',
        isActive: true,
      });
      setSelectedExercises([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTraining(null);
    reset();
    setSelectedExercises([]);
  };

  const addExercise = () => {
    setSelectedExercises([
      ...selectedExercises,
      { exerciseId: '', sets: 3, reps: '10-12', restSeconds: 60, notes: '' },
    ]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: string | number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const onSubmit = async (data: TrainingForm) => {
    if (selectedExercises.length === 0 || selectedExercises.some((e) => !e.exerciseId)) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    try {
      const payload = {
        ...data,
        exercises: selectedExercises
          .filter((e) => e.exerciseId)
          .map((e, index) => ({ ...e, order: index })),
      };

      if (editingTraining) {
        await trainingsApi.update(editingTraining.id, payload);
        toast.success('Treino atualizado!');
      } else {
        await trainingsApi.create(payload);
        toast.success('Treino criado!');
      }
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar treino');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;

    try {
      await trainingsApi.delete(id);
      toast.success('Treino excluído!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir treino');
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await pdfApi.getTrainingPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `treino-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF baixado!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Hipertrofia: 'bg-blue-600/20 text-blue-400',
      Força: 'bg-red-600/20 text-red-400',
      Resistência: 'bg-green-600/20 text-green-400',
      Funcional: 'bg-purple-600/20 text-purple-400',
      Cardio: 'bg-yellow-600/20 text-yellow-400',
      HIIT: 'bg-orange-600/20 text-orange-400',
      Flexibilidade: 'bg-teal-600/20 text-teal-400',
      Outro: 'bg-slate-600/20 text-slate-400',
    };
    return colors[type] || 'bg-slate-600/20 text-slate-400';
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
        <div>
          <h1 className="page-title">Treinos</h1>
          <p className="page-subtitle">Monte seus programas de treino</p>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard/trainings/history" className="btn-secondary flex items-center">
            <PlayIcon className="h-5 w-5 mr-2" />
            Histórico
          </a>
          <button onClick={() => openModal()} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Treino
          </button>
        </div>
      </div>

      {/* Trainings List */}
      <div className="grid gap-4 md:grid-cols-2">
        {trainings.map((training) => (
          <div key={training.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100">{training.name}</h3>
                    {training.isActive && (
                      <span className="badge badge-success">
                        Ativo
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getTypeColor(
                      training.type
                    )}`}
                  >
                    {training.type}
                  </span>
                  {training.description && (
                    <p className="text-sm text-slate-400 mt-2">{training.description}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDownloadPdf(training.id)}
                    className="btn-icon"
                    title="Baixar PDF"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(training)}
                    className="btn-icon"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(training.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-400 mb-2">
                  Exercícios ({training.trainingExercises.length}):
                </p>
                <div className="space-y-2">
                  {training.trainingExercises.slice(0, 4).map((te) => (
                    <div
                      key={te.id}
                      className="flex items-center justify-between text-sm bg-slate-700 rounded p-2"
                    >
                      <span className="text-slate-100">{te.exercise.name}</span>
                      <span className="text-slate-400">
                        {te.sets}x{te.reps}
                      </span>
                    </div>
                  ))}
                  {training.trainingExercises.length > 4 && (
                    <p className="text-xs text-slate-500 text-center">
                      +{training.trainingExercises.length - 4} mais exercícios
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trainings.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">Nenhum treino encontrado.</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Criar primeiro treino
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingTraining ? 'Editar Treino' : 'Novo Treino'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Nome *</label>
                    <input
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      {...register('name', { required: 'Nome é obrigatório' })}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label">Tipo *</label>
                    <select className="input" {...register('type', { required: true })}>
                      {TRAINING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                      {...register('isActive')}
                    />
                    <span className="text-sm text-slate-100">Treino ativo</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="label">Descrição</label>
                  <textarea
                    rows={2}
                    className="input"
                    {...register('description')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Exercícios</label>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="text-sm text-indigo-500 hover:text-indigo-400"
                    >
                      + Adicionar exercício
                    </button>
                  </div>

                  {selectedExercises.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-700 rounded">
                      Clique em "Adicionar exercício" para começar
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedExercises.map((se, index) => (
                        <div
                          key={index}
                          className="border border-slate-600 rounded-lg p-3 bg-slate-700"
                        >
                          <div className="flex gap-2 items-start">
                            <select
                              className="input flex-1"
                              value={se.exerciseId}
                              onChange={(e) =>
                                updateExercise(index, 'exerciseId', e.target.value)
                              }
                            >
                              <option value="">Selecione um exercício</option>
                              {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  {ex.name} ({ex.muscleGroup})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeExercise(index)}
                              className="btn-icon-danger"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                              <label className="text-xs text-slate-400">Séries</label>
                              <input
                                type="number"
                                className="input"
                                value={se.sets}
                                onChange={(e) =>
                                  updateExercise(index, 'sets', Number(e.target.value))
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Repetições</label>
                              <input
                                className="input"
                                value={se.reps}
                                placeholder="10-12"
                                onChange={(e) =>
                                  updateExercise(index, 'reps', e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Descanso (s)</label>
                              <input
                                type="number"
                                className="input"
                                value={se.restSeconds}
                                onChange={(e) =>
                                  updateExercise(index, 'restSeconds', Number(e.target.value))
                                }
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <label className="text-xs text-slate-400">Observações</label>
                            <input
                              className="input"
                              value={se.notes}
                              placeholder="Tempo sob tensão, técnica, etc."
                              onChange={(e) =>
                                updateExercise(index, 'notes', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { exercisesApi } from '@/lib/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
  videoUrl?: string;
}

interface ExerciseForm {
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
  videoUrl?: string;
}

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Abdômen',
  'Quadríceps',
  'Posterior',
  'Glúteos',
  'Panturrilha',
  'Corpo Inteiro',
  'Cardio',
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseForm>();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await exercisesApi.getAll();
      setExercises(response.data);
    } catch (error) {
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const openModal = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      reset(exercise);
    } else {
      setEditingExercise(null);
      reset({
        name: '',
        muscleGroup: 'Peito',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
    reset();
  };

  const onSubmit = async (data: ExerciseForm) => {
    try {
      if (editingExercise) {
        await exercisesApi.update(editingExercise.id, data);
        toast.success('Exercício atualizado!');
      } else {
        await exercisesApi.create(data);
        toast.success('Exercício criado!');
      }
      closeModal();
      loadExercises();
    } catch (error) {
      toast.error('Erro ao salvar exercício');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      await exercisesApi.delete(id);
      toast.success('Exercício excluído!');
      loadExercises();
    } catch (error) {
      toast.error('Erro ao excluir exercício');
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors: Record<string, string> = {
      Peito: 'bg-red-900/50 text-red-400',
      Costas: 'bg-blue-900/50 text-blue-400',
      Ombros: 'bg-purple-900/50 text-purple-400',
      Bíceps: 'bg-orange-900/50 text-orange-400',
      Tríceps: 'bg-pink-900/50 text-pink-400',
      Antebraço: 'bg-amber-900/50 text-amber-400',
      Abdômen: 'bg-green-900/50 text-green-400',
      Quadríceps: 'bg-cyan-900/50 text-cyan-400',
      Posterior: 'bg-teal-900/50 text-teal-400',
      Glúteos: 'bg-rose-900/50 text-rose-400',
      Panturrilha: 'bg-indigo-900/50 text-indigo-400',
      'Corpo Inteiro': 'bg-slate-700 text-slate-300',
      Cardio: 'bg-yellow-900/50 text-yellow-400',
    };
    return colors[muscle] || 'bg-slate-700 text-slate-300';
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
          <h1 className="page-title">Exercícios</h1>
          <p className="page-subtitle">Catálogo de exercícios disponíveis</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Exercício
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar exercícios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          className="input sm:w-48"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="">Todos os grupos</option>
          {MUSCLE_GROUPS.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </div>

      {/* Exercises List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="card hover:bg-slate-700/50 transition-colors">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getMuscleColor(
                      exercise.muscleGroup
                    )}`}
                  >
                    {exercise.muscleGroup}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(exercise)}
                    className="btn-icon"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {exercise.description && (
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                  {exercise.description}
                </p>
              )}

              {exercise.equipment && (
                <p className="mt-2 text-xs text-slate-500">
                  Equipamento: {exercise.equipment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">Nenhum exercício encontrado.</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Cadastrar primeiro exercício
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-icon"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="label">Nome *</label>
                  <input
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    {...register('name', { required: 'Nome é obrigatório' })}
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Grupo muscular *</label>
                  <select
                    className="input"
                    {...register('muscleGroup', { required: true })}
                  >
                    {MUSCLE_GROUPS.map((muscle) => (
                      <option key={muscle} value={muscle}>
                        {muscle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Equipamento</label>
                  <input
                    className="input"
                    placeholder="Ex: Barra, Halteres, Máquina..."
                    {...register('equipment')}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Descrição</label>
                  <textarea
                    rows={2}
                    className="input"
                    {...register('description')}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Instruções</label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="Passo a passo de como executar o exercício..."
                    {...register('instructions')}
                  />
                </div>

                <div className="form-group">
                  <label className="label">URL do vídeo</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://youtube.com/..."
                    {...register('videoUrl')}
                  />
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

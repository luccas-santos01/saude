'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { foodsApi, micronutrientsApi } from '@/lib/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Food {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sodium?: number;
}

interface FoodForm {
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sodium?: number;
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FoodForm>();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async (searchTerm?: string) => {
    try {
      const response = await foodsApi.getAll(searchTerm);
      setFoods(response.data);
    } catch (error) {
      toast.error('Erro ao carregar alimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    loadFoods(value);
  };

  const openModal = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      reset(food);
    } else {
      setEditingFood(null);
      reset({
        servingSize: 100,
        servingUnit: 'g',
        calories: 0,
        proteins: 0,
        carbohydrates: 0,
        fats: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFood(null);
    reset();
  };

  const onSubmit = async (data: FoodForm) => {
    try {
      if (editingFood) {
        await foodsApi.update(editingFood.id, data);
        toast.success('Alimento atualizado!');
      } else {
        await foodsApi.create(data);
        toast.success('Alimento criado!');
      }
      closeModal();
      loadFoods();
    } catch (error) {
      toast.error('Erro ao salvar alimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este alimento?')) return;

    try {
      await foodsApi.delete(id);
      toast.success('Alimento excluído!');
      loadFoods();
    } catch (error) {
      toast.error('Erro ao excluir alimento');
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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Alimentos</h1>
          <p className="page-subtitle">Gerencie seus alimentos cadastrados</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Alimento
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar alimentos..."
          value={search}
          onChange={handleSearch}
          className="input pl-10"
        />
      </div>

      {/* Foods List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {foods.map((food) => (
          <div key={food.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">{food.name}</h3>
                  {food.brand && (
                    <p className="text-sm text-slate-400">{food.brand}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Porção: {food.servingSize}{food.servingUnit}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(food)}
                    className="btn-icon"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="stat-card">
                  <p className="stat-value nutrient-calories">{food.calories}</p>
                  <p className="stat-label">kcal</p>
                </div>
                <div className="stat-card">
                  <p className="stat-value nutrient-protein">{food.proteins}g</p>
                  <p className="stat-label">Prot</p>
                </div>
                <div className="stat-card">
                  <p className="stat-value nutrient-carbs">{food.carbohydrates}g</p>
                  <p className="stat-label">Carb</p>
                </div>
                <div className="stat-card">
                  <p className="stat-value nutrient-fat">{food.fats}g</p>
                  <p className="stat-label">Gord</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {foods.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">Nenhum alimento encontrado.</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Cadastrar primeiro alimento
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
                  {editingFood ? 'Editar Alimento' : 'Novo Alimento'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-icon"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="modal-body">
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
                  <label className="label">Marca</label>
                  <input className="input" {...register('brand')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Porção *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('servingSize', {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Unidade</label>
                    <select className="input" {...register('servingUnit')}>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Calorias *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('calories', {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Proteínas (g) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('proteins', {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Carboidratos (g) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('carbohydrates', {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Gorduras (g) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('fats', {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Fibras (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('fiber', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Sódio (mg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('sodium', { valueAsNumber: true })}
                    />
                  </div>
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

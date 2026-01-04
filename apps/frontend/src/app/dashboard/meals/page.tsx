'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { mealsApi, foodsApi } from '@/lib/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Food {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

interface MealFood {
  id: string;
  food: Food;
  quantity: number;
}

interface Meal {
  id: string;
  name: string;
  description?: string;
  totalCalories: number;
  totalProteins: number;
  totalCarbohydrates: number;
  totalFats: number;
  mealFoods: MealFood[];
}

interface MealForm {
  name: string;
  description?: string;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<{ foodId: string; quantity: number }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MealForm>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mealsRes, foodsRes] = await Promise.all([
        mealsApi.getAll(),
        foodsApi.getAll(),
      ]);
      setMeals(mealsRes.data);
      setFoods(foodsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      reset({ name: meal.name, description: meal.description });
      setSelectedFoods(
        (meal.mealFoods || []).map((mf) => ({ foodId: mf.food.id, quantity: mf.quantity }))
      );
    } else {
      setEditingMeal(null);
      reset({ name: '', description: '' });
      setSelectedFoods([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeal(null);
    reset();
    setSelectedFoods([]);
  };

  const addFood = () => {
    setSelectedFoods([...selectedFoods, { foodId: '', quantity: 100 }]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const updateFood = (index: number, field: 'foodId' | 'quantity', value: string | number) => {
    const updated = [...selectedFoods];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedFoods(updated);
  };

  const onSubmit = async (data: MealForm) => {
    if (selectedFoods.length === 0 || selectedFoods.some((f) => !f.foodId)) {
      toast.error('Adicione pelo menos um alimento');
      return;
    }

    try {
      const payload = {
        ...data,
        foods: selectedFoods.filter((f) => f.foodId),
      };

      if (editingMeal) {
        await mealsApi.update(editingMeal.id, payload);
        toast.success('Refeição atualizada!');
      } else {
        await mealsApi.create(payload);
        toast.success('Refeição criada!');
      }
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar refeição');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta refeição?')) return;

    try {
      await mealsApi.delete(id);
      toast.success('Refeição excluída!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir refeição');
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
          <h1 className="page-title">Refeições</h1>
          <p className="page-subtitle">Monte suas refeições com alimentos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Refeição
        </button>
      </div>

      {/* Meals Grid */}
      {meals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {meals.map((meal) => (
            <div key={meal.id} className="card">
              <div className="card-body">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-100">{meal.name}</h3>
                    {meal.description && (
                      <p className="text-sm text-slate-400 mt-1">{meal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(meal)} className="btn-icon">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(meal.id)} className="btn-icon-danger">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Nutrientes */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="stat-card">
                    <p className="stat-value nutrient-calories">
                      {meal.totalCalories?.toFixed(0) || 0}
                    </p>
                    <p className="stat-label">kcal</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value nutrient-protein">
                      {meal.totalProteins?.toFixed(1) || 0}g
                    </p>
                    <p className="stat-label">Prot</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value nutrient-carbs">
                      {meal.totalCarbohydrates?.toFixed(1) || 0}g
                    </p>
                    <p className="stat-label">Carb</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value nutrient-fat">
                      {meal.totalFats?.toFixed(1) || 0}g
                    </p>
                    <p className="stat-label">Gord</p>
                  </div>
                </div>

                {/* Lista de Alimentos */}
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Alimentos:</p>
                  <ul className="space-y-1">
                    {(meal.mealFoods || []).map((mf) => (
                      <li key={mf.id} className="text-sm text-slate-400 flex justify-between">
                        <span>{mf.food.name}</span>
                        <span className="text-slate-500">
                          {mf.quantity}{mf.food.servingUnit}
                        </span>
                      </li>
                    ))}
                    {(!meal.mealFoods || meal.mealFoods.length === 0) && (
                      <li className="text-sm text-slate-500 italic">Nenhum alimento</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-text">Nenhuma refeição encontrada.</p>
          <button onClick={() => openModal()} className="btn-primary">
            Criar primeira refeição
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Modal Header */}
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingMeal ? 'Editar Refeição' : 'Nova Refeição'}
                </h3>
                <button type="button" onClick={closeModal} className="btn-icon">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="label">Nome *</label>
                  <input
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Ex: Café da manhã"
                    {...register('name', { required: 'Nome é obrigatório' })}
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Descrição</label>
                  <textarea
                    rows={2}
                    className="input"
                    placeholder="Descrição opcional..."
                    {...register('description')}
                  />
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Alimentos</label>
                    <button
                      type="button"
                      onClick={addFood}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Adicionar alimento
                    </button>
                  </div>

                  {selectedFoods.length === 0 ? (
                    <div className="text-center py-6 bg-slate-700/50 rounded-lg border border-dashed border-slate-600">
                      <p className="text-sm text-slate-400">
                        Clique em "Adicionar alimento" para começar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedFoods.map((sf, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <select
                            className="input flex-1"
                            value={sf.foodId}
                            onChange={(e) => updateFood(index, 'foodId', e.target.value)}
                          >
                            <option value="">Selecione um alimento</option>
                            {foods.map((food) => (
                              <option key={food.id} value={food.id}>
                                {food.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="input w-24"
                            value={sf.quantity}
                            onChange={(e) =>
                              updateFood(index, 'quantity', Number(e.target.value))
                            }
                            placeholder="Qtd"
                          />
                          <button
                            type="button"
                            onClick={() => removeFood(index)}
                            className="btn-icon-danger"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
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

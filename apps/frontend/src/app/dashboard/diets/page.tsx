'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { dietsApi, mealsApi, pdfApi } from '@/lib/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface Meal {
  id: string;
  name: string;
  totalCalories: number;
  totalProteins: number;
  totalCarbohydrates: number;
  totalFats: number;
}

interface DietMeal {
  id: string;
  meal: Meal;
  time: string;
  order: number;
}

interface DietDay {
  id: string;
  dayOfWeek: number;
  meals: DietMeal[];
}

interface Diet {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  days: DietDay[];
}

interface DietForm {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export default function DietsPage() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [selectedDays, setSelectedDays] = useState<
    { dayOfWeek: number; meals: { mealId: string; time: string }[] }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DietForm>();

  useEffect(() => {
    loadData();
  }, []);

  // Transforma dietMeals (flat) para days (agrupado por dia)
  const transformDietMeals = (dietMeals: any[]): DietDay[] => {
    const daysMap = new Map<number, DietMeal[]>();
    
    for (const dm of dietMeals || []) {
      const dayOfWeek = dm.dayOfWeek ?? 0;
      if (!daysMap.has(dayOfWeek)) {
        daysMap.set(dayOfWeek, []);
      }
      daysMap.get(dayOfWeek)!.push({
        id: dm.id,
        meal: dm.meal,
        time: dm.time || '08:00',
        order: dm.order || 0,
      });
    }

    return Array.from(daysMap.entries()).map(([dayOfWeek, meals]) => ({
      id: `day-${dayOfWeek}`,
      dayOfWeek,
      meals: meals.sort((a, b) => a.order - b.order),
    }));
  };

  const loadData = async () => {
    try {
      const [dietsRes, mealsRes] = await Promise.all([
        dietsApi.getAll(),
        mealsApi.getAll(),
      ]);
      // Transformar cada dieta para ter a estrutura days
      const transformedDiets = dietsRes.data.map((diet: any) => ({
        ...diet,
        days: transformDietMeals(diet.dietMeals),
      }));
      setDiets(transformedDiets);
      setMeals(mealsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (diet?: Diet) => {
    if (diet) {
      setEditingDiet(diet);
      reset({
        name: diet.name,
        description: diet.description,
        startDate: diet.startDate?.split('T')[0],
        endDate: diet.endDate?.split('T')[0],
        isActive: diet.isActive,
      });
      setSelectedDays(
        diet.days.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          meals: d.meals.map((m) => ({ mealId: m.meal.id, time: m.time })),
        }))
      );
    } else {
      setEditingDiet(null);
      reset({
        name: '',
        description: '',
        isActive: true,
      });
      setSelectedDays([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiet(null);
    reset();
    setSelectedDays([]);
  };

  const addDay = () => {
    const usedDays = selectedDays.map((d) => d.dayOfWeek);
    const nextDay = [0, 1, 2, 3, 4, 5, 6].find((d) => !usedDays.includes(d));
    if (nextDay !== undefined) {
      setSelectedDays([...selectedDays, { dayOfWeek: nextDay, meals: [] }]);
    }
  };

  const removeDay = (index: number) => {
    setSelectedDays(selectedDays.filter((_, i) => i !== index));
  };

  const updateDayOfWeek = (index: number, dayOfWeek: number) => {
    const updated = [...selectedDays];
    updated[index].dayOfWeek = dayOfWeek;
    setSelectedDays(updated);
  };

  const addMealToDay = (dayIndex: number) => {
    const updated = [...selectedDays];
    updated[dayIndex].meals.push({ mealId: '', time: '08:00' });
    setSelectedDays(updated);
  };

  const removeMealFromDay = (dayIndex: number, mealIndex: number) => {
    const updated = [...selectedDays];
    updated[dayIndex].meals = updated[dayIndex].meals.filter(
      (_, i) => i !== mealIndex
    );
    setSelectedDays(updated);
  };

  const updateMealInDay = (
    dayIndex: number,
    mealIndex: number,
    field: 'mealId' | 'time',
    value: string
  ) => {
    const updated = [...selectedDays];
    updated[dayIndex].meals[mealIndex] = {
      ...updated[dayIndex].meals[mealIndex],
      [field]: value,
    };
    setSelectedDays(updated);
  };

  const onSubmit = async (data: DietForm) => {
    try {
      const payload = {
        ...data,
        days: selectedDays.map((day, dayOrder) => ({
          dayOfWeek: day.dayOfWeek,
          meals: day.meals
            .filter((m) => m.mealId)
            .map((m, mealOrder) => ({
              mealId: m.mealId,
              time: m.time,
              order: mealOrder,
            })),
        })),
      };

      if (editingDiet) {
        await dietsApi.update(editingDiet.id, payload);
        toast.success('Dieta atualizada!');
      } else {
        await dietsApi.create(payload);
        toast.success('Dieta criada!');
      }
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar dieta');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta dieta?')) return;

    try {
      await dietsApi.delete(id);
      toast.success('Dieta excluída!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir dieta');
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await pdfApi.getDietPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dieta-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF baixado!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const calculateDayTotals = (diet: Diet, dayOfWeek: number) => {
    const day = diet.days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return { calories: 0, proteins: 0, carbs: 0, fats: 0 };

    return day.meals.reduce(
      (acc, dm) => ({
        calories: acc.calories + (dm.meal.totalCalories || 0),
        proteins: acc.proteins + (dm.meal.totalProteins || 0),
        carbs: acc.carbs + (dm.meal.totalCarbohydrates || 0),
        fats: acc.fats + (dm.meal.totalFats || 0),
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
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
          <h1 className="page-title">Dietas</h1>
          <p className="page-subtitle">Organize seus planos alimentares semanais</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Dieta
        </button>
      </div>

      {/* Diets List */}
      <div className="space-y-4">
        {diets.map((diet) => (
          <div key={diet.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-8 w-8 text-indigo-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-100">{diet.name}</h3>
                      {diet.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Ativa
                        </span>
                      )}
                    </div>
                    {diet.description && (
                      <p className="text-sm text-slate-400">{diet.description}</p>
                    )}
                    {diet.startDate && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(diet.startDate).toLocaleDateString('pt-BR')}
                        {diet.endDate &&
                          ` - ${new Date(diet.endDate).toLocaleDateString('pt-BR')}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDownloadPdf(diet.id)}
                    className="btn-icon"
                    title="Baixar PDF"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(diet)}
                    className="btn-icon"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(diet.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Week Overview */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((dayName, index) => {
                  const totals = calculateDayTotals(diet, index);
                  const hasDay = diet.days.some((d) => d.dayOfWeek === index);
                  return (
                    <div
                      key={index}
                      className={`text-center p-2 rounded ${
                        hasDay ? 'bg-indigo-500/20' : 'bg-slate-700'
                      }`}
                    >
                      <p className={`text-xs font-medium ${hasDay ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {dayName.substring(0, 3)}
                      </p>
                      {hasDay && (
                        <p className="text-sm font-semibold nutrient-calories">
                          {totals.calories.toFixed(0)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {diets.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">Nenhuma dieta encontrada.</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Criar primeira dieta
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
                  {editingDiet ? 'Editar Dieta' : 'Nova Dieta'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group col-span-2 sm:col-span-1">
                    <label className="label">Nome *</label>
                    <input
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      {...register('name', { required: 'Nome é obrigatório' })}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name.message}</span>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                        {...register('isActive')}
                      />
                      <span className="text-sm text-slate-300">Dieta ativa</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Descrição</label>
                  <textarea
                    rows={2}
                    className="input"
                    {...register('description')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Data início</label>
                    <input type="date" className="input" {...register('startDate')} />
                  </div>
                  <div className="form-group">
                    <label className="label">Data fim</label>
                    <input type="date" className="input" {...register('endDate')} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Dias da semana</label>
                    <button
                      type="button"
                      onClick={addDay}
                      className="text-sm text-indigo-400 hover:text-primary-300"
                      disabled={selectedDays.length >= 7}
                    >
                      + Adicionar dia
                    </button>
                  </div>

                  {selectedDays.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-700 rounded-lg">
                      Clique em "Adicionar dia" para configurar as refeições
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="border border-slate-600 rounded-lg p-4 bg-slate-700/50">
                          <div className="flex items-center justify-between mb-3">
                            <select
                              className="input w-40"
                              value={day.dayOfWeek}
                              onChange={(e) =>
                                updateDayOfWeek(dayIndex, Number(e.target.value))
                              }
                            >
                              {DAYS_OF_WEEK.map((name, i) => (
                                <option key={i} value={i}>
                                  {name}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => addMealToDay(dayIndex)}
                                className="text-sm text-indigo-400 hover:text-primary-300"
                              >
                                + Refeição
                              </button>
                              <button
                                type="button"
                                onClick={() => removeDay(dayIndex)}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Remover dia
                              </button>
                            </div>
                          </div>

                          {day.meals.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-2">
                              Nenhuma refeição adicionada
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {day.meals.map((meal, mealIndex) => (
                                <div key={mealIndex} className="flex gap-2 items-center">
                                  <input
                                    type="time"
                                    className="input w-28"
                                    value={meal.time}
                                    onChange={(e) =>
                                      updateMealInDay(
                                        dayIndex,
                                        mealIndex,
                                        'time',
                                        e.target.value
                                      )
                                    }
                                  />
                                  <select
                                    className="input flex-1"
                                    value={meal.mealId}
                                    onChange={(e) =>
                                      updateMealInDay(
                                        dayIndex,
                                        mealIndex,
                                        'mealId',
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Selecione uma refeição</option>
                                    {meals.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} ({m.totalCalories?.toFixed(0) || 0} kcal)
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeMealFromDay(dayIndex, mealIndex)
                                    }
                                    className="btn-icon-danger"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
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

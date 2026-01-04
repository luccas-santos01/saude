'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { bodyMeasurementsApi } from '@/lib/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ScaleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Measurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

interface MeasurementForm {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [showChart, setShowChart] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementForm>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [measurementsRes, statsRes] = await Promise.all([
        bodyMeasurementsApi.getAll(),
        bodyMeasurementsApi.getStats(),
      ]);
      setMeasurements(measurementsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (measurement?: Measurement) => {
    if (measurement) {
      setEditingMeasurement(measurement);
      reset({
        ...measurement,
        date: measurement.date.split('T')[0],
      });
    } else {
      setEditingMeasurement(null);
      reset({
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeasurement(null);
    reset();
  };

  const onSubmit = async (data: MeasurementForm) => {
    try {
      // Convert empty strings to null
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' || value === undefined ? null : value,
        ])
      );

      if (editingMeasurement) {
        await bodyMeasurementsApi.update(editingMeasurement.id, cleanData);
        toast.success('Medida atualizada!');
      } else {
        await bodyMeasurementsApi.create(cleanData);
        toast.success('Medida registrada!');
      }
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar medida');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta medida?')) return;

    try {
      await bodyMeasurementsApi.delete(id);
      toast.success('Medida excluída!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir medida');
    }
  };

  const chartData = measurements
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: m.weight,
      gordura: m.bodyFat,
      muscular: m.muscleMass,
    }));

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
          <h1 className="page-title">Medidas Corporais</h1>
          <p className="page-subtitle">Acompanhe sua evolução física</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Medida
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-lg">
                <ScaleIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="stat-label">Peso Atual</p>
                <p className="stat-value">
                  {stats.currentWeight?.toFixed(1) || '-'} kg
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="stat-label">Variação</p>
                <p
                  className={`stat-value ${
                    stats.weightChange > 0
                      ? 'text-red-500'
                      : stats.weightChange < 0
                      ? 'text-emerald-500'
                      : ''
                  }`}
                >
                  {stats.weightChange > 0 ? '+' : ''}
                  {stats.weightChange?.toFixed(1) || '-'} kg
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-label">Gordura Corporal</p>
              <p className="stat-value">
                {stats.currentBodyFat?.toFixed(1) || '-'}%
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-label">Massa Muscular</p>
              <p className="stat-value">
                {stats.currentMuscleMass?.toFixed(1) || '-'} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowChart(!showChart)}
          className="btn-secondary text-sm"
        >
          {showChart ? 'Ocultar gráfico' : 'Mostrar gráfico'}
        </button>
      </div>

      {/* Chart */}
      {showChart && measurements.length > 1 && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Evolução</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#10b981"
                  name="Peso (kg)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="gordura"
                  stroke="#ef4444"
                  name="Gordura (%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="muscular"
                  stroke="#3b82f6"
                  name="Massa Muscular (kg)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Measurements List */}
      <div className="space-y-4">
        {measurements.map((measurement) => (
          <div key={measurement.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {new Date(measurement.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  {measurement.notes && (
                    <p className="text-sm text-slate-400 mt-1">{measurement.notes}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(measurement)}
                    className="btn-icon"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    className="btn-icon-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
                {measurement.weight && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.weight}
                    </p>
                    <p className="text-xs text-slate-400">Peso (kg)</p>
                  </div>
                )}
                {measurement.bodyFat && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.bodyFat}%
                    </p>
                    <p className="text-xs text-slate-400">Gordura</p>
                  </div>
                )}
                {measurement.muscleMass && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.muscleMass}
                    </p>
                    <p className="text-xs text-slate-400">Muscular</p>
                  </div>
                )}
                {measurement.chest && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.chest}
                    </p>
                    <p className="text-xs text-slate-400">Peito (cm)</p>
                  </div>
                )}
                {measurement.waist && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.waist}
                    </p>
                    <p className="text-xs text-slate-400">Cintura (cm)</p>
                  </div>
                )}
                {measurement.hips && (
                  <div className="text-center p-2 bg-slate-700 rounded-lg">
                    <p className="text-lg font-semibold text-slate-100">
                      {measurement.hips}
                    </p>
                    <p className="text-xs text-slate-400">Quadril (cm)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {measurements.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">Nenhuma medida registrada.</p>
          <button onClick={() => openModal()} className="btn-primary mt-4">
            Registrar primeira medida
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingMeasurement ? 'Editar Medida' : 'Nova Medida'}
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
                  <label className="label">Data *</label>
                  <input
                    type="date"
                    className={`input ${errors.date ? 'input-error' : ''}`}
                    {...register('date', { required: 'Data é obrigatória' })}
                  />
                  {errors.date && (
                    <span className="error-message">{errors.date.message}</span>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-medium text-slate-100 mb-3">Composição Corporal</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="label">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('weight', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Gordura (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('bodyFat', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Massa Muscular (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('muscleMass', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-medium text-slate-100 mb-3">Circunferências (cm)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="label">Peito</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('chest', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Cintura</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('waist', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Quadril</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('hips', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-medium text-slate-100 mb-3">Membros (cm)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Braço Esquerdo</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('leftArm', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Braço Direito</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('rightArm', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Coxa Esquerda</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('leftThigh', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Coxa Direita</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('rightThigh', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Panturrilha Esquerda</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('leftCalf', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Panturrilha Direita</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        {...register('rightCalf', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="form-group">
                    <label className="label">Observações</label>
                    <textarea
                      rows={2}
                      className="input"
                      placeholder="Anotações sobre o dia, condições da medição, etc."
                      {...register('notes')}
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

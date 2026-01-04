'use client';

import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { progressImagesApi, pdfApi } from '@/lib/api';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ProgressImage {
  id: string;
  imageUrl: string;
  type: string;
  date: string;
  notes?: string;
}

const IMAGE_TYPES = [
  { value: 'front', label: 'Frente' },
  { value: 'back', label: 'Costas' },
  { value: 'side_left', label: 'Lado Esquerdo' },
  { value: 'side_right', label: 'Lado Direito' },
  { value: 'other', label: 'Outro' },
];

export default function ProgressPage() {
  const [images, setImages] = useState<ProgressImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState('front');
  const [uploadNotes, setUploadNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<ProgressImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await progressImagesApi.getAll();
      setImages(response.data);
    } catch (error) {
      toast.error('Erro ao carregar imagens');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);
      if (uploadNotes) {
        formData.append('notes', uploadNotes);
      }

      await progressImagesApi.upload(formData);
      toast.success('Imagem enviada!');
      closeModal();
      loadImages();
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      await progressImagesApi.delete(id);
      toast.success('Imagem excluída!');
      loadImages();
    } catch (error) {
      toast.error('Erro ao excluir imagem');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await pdfApi.getProgressPdf();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progresso-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Relatório baixado!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  const openModal = () => {
    setUploadType('front');
    setUploadNotes('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUploadType('front');
    setUploadNotes('');
  };

  const getTypeLabel = (type: string) => {
    return IMAGE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const groupedImages = images.reduce((acc, img) => {
    const date = new Date(img.date).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(img);
    return acc;
  }, {} as Record<string, ProgressImage[]>);

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
          <h1 className="page-title">Fotos de Progresso</h1>
          <p className="page-subtitle">Acompanhe sua evolução visualmente</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Relatório
          </button>
          <button onClick={openModal} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Foto
          </button>
        </div>
      </div>

      {/* Images by Date */}
      {Object.entries(groupedImages).map(([date, dateImages]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-slate-100 mb-3">{date}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dateImages.map((image) => (
              <div
                key={image.id}
                className="card overflow-hidden group cursor-pointer"
                onClick={() => setPreviewImage(image)}
              >
                <div className="aspect-square relative">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${image.imageUrl}`}
                    alt={getTypeLabel(image.type)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="btn-icon-danger opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="card-body p-2">
                  <span className="text-sm font-medium text-slate-100">
                    {getTypeLabel(image.type)}
                  </span>
                  {image.notes && (
                    <p className="text-xs text-slate-400 truncate">{image.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {images.length === 0 && (
        <div className="empty-state">
          <PhotoIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="empty-state-text">Nenhuma foto de progresso registrada.</p>
          <button onClick={openModal} className="btn-primary mt-4">
            Adicionar primeira foto
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content sm:max-w-md">
            <div className="modal-header">
              <h3 className="modal-title">Nova Foto</h3>
              <button
                onClick={closeModal}
                className="btn-icon"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="label">Tipo de Foto</label>
                <select
                  className="input"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  {IMAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Observações</label>
                <textarea
                  rows={2}
                  className="input"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Opcional..."
                />
              </div>

              <div className="form-group">
                <label className="label">Imagem</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg bg-slate-800">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <div className="flex text-sm text-slate-400">
                      <label className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1">
                        <span>Selecionar arquivo</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="loading-container py-4">
                  <div className="loading-spinner h-8 w-8"></div>
                  <span className="ml-2 text-slate-400">Enviando...</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="modal-container">
          <div
            className="modal-overlay bg-opacity-90"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-4xl w-full z-10">
            <button
              onClick={() => setPreviewImage(null)}
              className="btn-icon absolute -top-12 right-0 text-slate-100 hover:text-slate-400"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${previewImage.imageUrl}`}
              alt={getTypeLabel(previewImage.type)}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-lg font-medium text-slate-100">{getTypeLabel(previewImage.type)}</p>
              <p className="text-sm text-slate-400">
                {new Date(previewImage.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {previewImage.notes && (
                <p className="text-sm text-slate-500 mt-2">{previewImage.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

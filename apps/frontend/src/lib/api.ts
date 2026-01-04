import axios from 'axios';

// Em produção, usa URL relativa para passar pelo Nginx
// Em desenvolvimento, usa localhost
const API_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.patch('/users/me', data),
  updateProfile: (data: any) => api.patch('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.patch('/users/me', { password: data.newPassword }),
  deleteMe: () => api.delete('/users/me'),
  deleteAccount: () => api.delete('/users/me'),
};

// Foods
export const foodsApi = {
  getAll: (search?: string) => api.get('/foods', { params: { search } }),
  getOne: (id: string) => api.get(`/foods/${id}`),
  create: (data: any) => api.post('/foods', data),
  update: (id: string, data: any) => api.patch(`/foods/${id}`, data),
  delete: (id: string) => api.delete(`/foods/${id}`),
};

// Micronutrients
export const micronutrientsApi = {
  getAll: () => api.get('/micronutrients'),
  create: (data: { name: string; unit: string }) => api.post('/micronutrients', data),
  update: (id: string, data: any) => api.patch(`/micronutrients/${id}`, data),
  delete: (id: string) => api.delete(`/micronutrients/${id}`),
};

// Meals
export const mealsApi = {
  getAll: () => api.get('/meals'),
  getOne: (id: string) => api.get(`/meals/${id}`),
  getNutrition: (id: string) => api.get(`/meals/${id}/nutrition`),
  create: (data: any) => api.post('/meals', data),
  update: (id: string, data: any) => api.patch(`/meals/${id}`, data),
  delete: (id: string) => api.delete(`/meals/${id}`),
  addFood: (mealId: string, data: any) => api.post(`/meals/${mealId}/foods`, data),
  removeFood: (mealId: string, mealFoodId: string) =>
    api.delete(`/meals/${mealId}/foods/${mealFoodId}`),
};

// Diets
export const dietsApi = {
  getAll: () => api.get('/diets'),
  getOne: (id: string) => api.get(`/diets/${id}`),
  getNutrition: (id: string) => api.get(`/diets/${id}/nutrition`),
  create: (data: any) => api.post('/diets', data),
  update: (id: string, data: any) => api.patch(`/diets/${id}`, data),
  delete: (id: string) => api.delete(`/diets/${id}`),
  addMeal: (dietId: string, data: any) => api.post(`/diets/${dietId}/meals`, data),
  removeMeal: (dietId: string, dietMealId: string) =>
    api.delete(`/diets/${dietId}/meals/${dietMealId}`),
};

// Exercises
export const exercisesApi = {
  getAll: (muscleGroup?: string) => api.get('/exercises', { params: { muscleGroup } }),
  getMuscleGroups: () => api.get('/exercises/muscle-groups'),
  getOne: (id: string) => api.get(`/exercises/${id}`),
  create: (data: any) => api.post('/exercises', data),
  update: (id: string, data: any) => api.patch(`/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
};

// Trainings
export const trainingsApi = {
  getAll: () => api.get('/trainings'),
  getOne: (id: string) => api.get(`/trainings/${id}`),
  create: (data: any) => api.post('/trainings', data),
  update: (id: string, data: any) => api.patch(`/trainings/${id}`, data),
  delete: (id: string) => api.delete(`/trainings/${id}`),
  addExercise: (trainingId: string, data: any) =>
    api.post(`/trainings/${trainingId}/exercises`, data),
  updateExercise: (trainingId: string, exerciseId: string, data: any) =>
    api.patch(`/trainings/${trainingId}/exercises/${exerciseId}`, data),
  removeExercise: (trainingId: string, exerciseId: string) =>
    api.delete(`/trainings/${trainingId}/exercises/${exerciseId}`),
  getSessions: (limit?: number) => api.get('/trainings/sessions', { params: { limit } }),
  createSession: (trainingId: string, data: any) =>
    api.post(`/trainings/${trainingId}/sessions`, data),
  getSession: (sessionId: string) => api.get(`/trainings/sessions/${sessionId}`),
  updateSession: (sessionId: string, data: any) =>
    api.patch(`/trainings/sessions/${sessionId}`, data),
  deleteSession: (sessionId: string) => api.delete(`/trainings/sessions/${sessionId}`),
};

// Body Measurements
export const bodyMeasurementsApi = {
  getAll: (limit?: number) => api.get('/body-measurements', { params: { limit } }),
  getLatest: () => api.get('/body-measurements/latest'),
  getStats: () => api.get('/body-measurements/stats'),
  getProgress: (field: string, limit?: number) =>
    api.get(`/body-measurements/progress/${field}`, { params: { limit } }),
  getOne: (id: string) => api.get(`/body-measurements/${id}`),
  create: (data: any) => api.post('/body-measurements', data),
  update: (id: string, data: any) => api.patch(`/body-measurements/${id}`, data),
  delete: (id: string) => api.delete(`/body-measurements/${id}`),
};

// Progress Images
export const progressImagesApi = {
  getAll: (category?: string) => api.get('/progress-images', { params: { category } }),
  getCategories: () => api.get('/progress-images/categories'),
  getTimeline: () => api.get('/progress-images/timeline'),
  getOne: (id: string) => api.get(`/progress-images/${id}`),
  upload: (formData: FormData) =>
    api.post('/progress-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: any) => api.patch(`/progress-images/${id}`, data),
  delete: (id: string) => api.delete(`/progress-images/${id}`),
};

// PDF
export const pdfApi = {
  getDietPdf: (dietId: string) =>
    api.get(`/pdf/diet/${dietId}`, { responseType: 'blob' }),
  getTrainingPdf: (trainingId: string) =>
    api.get(`/pdf/training/${trainingId}`, { responseType: 'blob' }),
  getProgressPdf: () =>
    api.get('/pdf/progress', { responseType: 'blob' }),
};

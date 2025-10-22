import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types TypeScript
export interface Equipment {
  _id: string;
  nom: string;
  type: string;
  marque?: string;
  modele?: string;
  numeroSerie: string;
  dateAchat: string;
  dateMiseEnService?: string;
  statut: 'Disponible' | 'Affecté' | 'En maintenance' | 'En panne' | 'Hors service' | 'Réservé';
  emplacement?: string;
  specifications?: {
    processeur?: string;
    ram?: string;
    stockage?: string;
    systemeExploitation?: string;
    autres?: string;
  };
  prixAchat?: number;
  garantie?: {
    dureeMois?: number;
    dateFin?: string;
    fournisseur?: string;
  };
  notes?: string;
  qrCodePath?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  affectationActive?: any;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFormData {
  nom: string;
  type: string;
  marque?: string;
  modele?: string;
  numeroSerie: string;
  dateAchat: string;
  dateMiseEnService?: string;
  statut: string;
  emplacement?: string;
  specifications?: {
    processeur?: string;
    ram?: string;
    stockage?: string;
    systemeExploitation?: string;
    autres?: string;
  };
  prixAchat?: number;
  garantie?: {
    dureeMois?: number;
    dateFin?: string;
    fournisseur?: string;
  };
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  champsManquants?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Services API
export const equipmentApi = {
  // Créer un équipement
  create: async (data: EquipmentFormData): Promise<ApiResponse<Equipment>> => {
    const response = await api.post('/equipements', data);
    return response.data;
  },

  // Obtenir tous les équipements
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: string;
    type?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Equipment>> => {
    const response = await api.get('/equipements', { params });
    return response.data;
  },

  // Obtenir un équipement par ID
  getById: async (id: string): Promise<ApiResponse<Equipment>> => {
    const response = await api.get(`/equipements/${id}`);
    return response.data;
  },

  // Mettre à jour un équipement
  update: async (id: string, data: Partial<EquipmentFormData>): Promise<ApiResponse<Equipment>> => {
    const response = await api.put(`/equipements/${id}`, data);
    return response.data;
  },

  // Supprimer un équipement
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/equipements/${id}`);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/equipements/stats');
    return response.data;
  }
};

export default api;
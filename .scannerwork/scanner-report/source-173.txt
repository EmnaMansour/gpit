// services/contactService.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Intercepteurs pour le logging
api.interceptors.request.use(
  (config) => {
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`⬅️ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const contactService = {
  // Envoi d'un message de contact
  async sendContactMessage(contactData: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) {
    try {
      console.log('🔄 Envoi du message de contact:', contactData);
      
      // CORRECTION: Utiliser /api/contacts (pluriel) au lieu de /api/contact
      const response = await api.post('/api/contacts', contactData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Réponse contact:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur contact service:', error);
      
      if (error.response) {
        console.error('📊 Détails erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        throw new Error(error.response.data.message || 'Erreur serveur');
      } else if (error.request) {
        console.error('🌐 Pas de réponse du serveur');
        throw new Error('Erreur de connexion au serveur');
      } else {
        console.error('⚙️ Erreur de configuration:', error.message);
        throw new Error('Erreur de configuration');
      }
    }
  },

  // Récupération des messages (pour l'admin)
  async getPendingContacts(token: string) {
    try {
      // CORRECTION: Utiliser /api/contacts/pending au lieu de /api/contact/pending
      const response = await api.get('/api/contacts/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération contacts:', error);
      throw error;
    }
  },

  // Récupération de tous les contacts (pour l'admin)
  async getAllContacts(token: string) {
    try {
      const response = await api.get('/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération tous les contacts:', error);
      throw error;
    }
  },

  // Marquer comme lu
  async markAsRead(contactId: string, token: string) {
    try {
      // CORRECTION: Utiliser /api/contacts/ au lieu de /api/contact/
      const response = await api.patch(`/api/contacts/${contactId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur marquer comme lu:', error);
      throw error;
    }
  },

  // Supprimer un contact
  async deleteContact(contactId: string, token: string) {
    try {
      const response = await api.delete(`/api/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur suppression contact:', error);
      throw error;
    }
  }
};

export default contactService;
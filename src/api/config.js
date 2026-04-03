import { apiRequest } from './client';

export const getBackendConfig = async () => apiRequest('/config', { requiresAuth: false });
import { apiRequest } from './client';

export const listMistakes = async ({ needsRevision = false } = {}) => {
  const query = new URLSearchParams();

  if (needsRevision) {
    query.set('needsRevision', 'true');
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  const data = await apiRequest(`/mistakes${suffix}`);
  return data.mistakes ?? [];
};

export const createMistake = async ({ file, mistake }) => {
  const payload = new FormData();

  if (file) {
    payload.append('image', file);
  }

  for (const [key, value] of Object.entries(mistake)) {
    payload.append(key, typeof value === 'boolean' ? String(value) : value ?? '');
  }

  const data = await apiRequest('/mistakes', {
    method: 'POST',
    body: payload,
  });

  return data.mistake;
};

export const updateMistake = async (id, updates) => {
  const data = await apiRequest(`/mistakes/${id}`, {
    method: 'PATCH',
    body: updates,
  });

  return data.mistake;
};
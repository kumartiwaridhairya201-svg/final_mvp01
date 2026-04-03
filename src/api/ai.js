import { apiRequest } from './client';

export const analyzeQuestionImage = async (base64Image) => {
  const data = await apiRequest('/ai/analyze-question', {
    method: 'POST',
    body: { base64Image },
  });

  return data.analysis;
};
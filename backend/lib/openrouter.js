import {
  isOpenRouterConfigured,
  openRouterApiKey,
  openRouterConfigError,
} from './env.js';

const openRouterModel = 'google/gemini-2.0-flash-exp:free';
const openRouterEndpoint = 'https://openrouter.ai/api/v1/chat/completions';

export const analyzeQuestionImage = async (base64Image) => {
  if (!isOpenRouterConfigured) {
    throw new Error(openRouterConfigError);
  }

  const response = await fetch(openRouterEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openRouterModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a NEET exam assistant. Analyze this question image and extract: (1) Subject: Physics/Chemistry/Biology, (2) Topic, (3) Question text, (4) What concept was likely misunderstood, (5) A short revision note to remember the correct approach. Return JSON only with keys: subject, topic, question_summary, my_mistake, revision_note.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            { type: 'text', text: 'Extract NEET question details as JSON...' },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to analyze image: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new Error('OpenRouter returned an unexpected response format.');
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error('Failed to parse OpenRouter JSON:', content);
    throw new Error('Invalid JSON response from AI');
  }
};
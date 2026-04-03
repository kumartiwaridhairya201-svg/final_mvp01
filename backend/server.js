import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { analyzeQuestionImage } from './lib/openrouter.js';
import {
  backendPort,
  frontendOrigins,
  isOpenRouterConfigured,
  isSupabaseConfigured,
  openRouterConfigError,
  supabaseConfigError,
} from './lib/env.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const allowedSubjects = new Set(['Physics', 'Chemistry', 'Biology']);
const allowedDifficulties = new Set(['Easy', 'Medium', 'Hard']);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || frontendOrigins.length === 0 || frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS.'));
  },
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const toBoolean = (value, fallback) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return fallback;
};

const normalizeMistakePayload = (body) => ({
  subject: allowedSubjects.has(body.subject) ? body.subject : 'Physics',
  topic: normalizeText(body.topic),
  question_summary: normalizeText(body.question_summary),
  my_mistake: normalizeText(body.my_mistake),
  revision_note: normalizeText(body.revision_note),
  difficulty: allowedDifficulties.has(body.difficulty) ? body.difficulty : 'Medium',
  needs_revision: toBoolean(body.needs_revision, true),
});

const normalizeMistakeUpdates = (body) => {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'needs_revision')) {
    updates.needs_revision = toBoolean(body.needs_revision, true);
  }

  return updates;
};

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;

const getFileExtension = (file) => {
  const explicitExtension = file.originalname.split('.').pop()?.trim().toLowerCase();

  if (explicitExtension) {
    return explicitExtension;
  }

  if (file.mimetype === 'image/png') {
    return 'png';
  }

  if (file.mimetype === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (_req, res) => {
  res.json({
    openRouterConfigured: isOpenRouterConfigured,
    supabaseConfigured: isSupabaseConfigured,
    openRouterConfigError: isOpenRouterConfigured ? null : openRouterConfigError,
    supabaseConfigError: isSupabaseConfigured ? null : supabaseConfigError,
  });
});

app.post('/api/ai/analyze-question', requireAuth, async (req, res) => {
  if (!isOpenRouterConfigured) {
    res.status(503).json({ error: openRouterConfigError });
    return;
  }

  const base64Image = normalizeText(req.body?.base64Image);

  if (!base64Image) {
    res.status(400).json({ error: 'A base64-encoded image is required.' });
    return;
  }

  try {
    const analysis = await analyzeQuestionImage(base64Image);
    res.json({ analysis });
  } catch (error) {
    console.error('AI analysis failed:', error);
    res.status(502).json({ error: getErrorMessage(error, 'AI analysis failed.') });
  }
});

app.get('/api/mistakes', requireAuth, async (req, res) => {
  try {
    let query = req.supabase.from('mistakes').select('*').order('created_at', { ascending: false });

    if (req.query.needsRevision === 'true') {
      query = query.eq('needs_revision', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ mistakes: data ?? [] });
  } catch (error) {
    console.error('Failed to fetch mistakes:', error);
    res.status(500).json({ error: getErrorMessage(error, 'Failed to load mistakes.') });
  }
});

app.post('/api/mistakes', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const payload = normalizeMistakePayload(req.body);

    if (!payload.topic || !payload.revision_note) {
      res.status(400).json({ error: 'Topic and revision note are required.' });
      return;
    }

    let imageUrl = null;

    if (req.file) {
      const filePath = `${req.user.id}/${crypto.randomUUID()}.${getFileExtension(req.file)}`;
      const { error: uploadError } = await req.supabase.storage
        .from('mistake-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = req.supabase.storage.from('mistake-images').getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    const { data, error } = await req.supabase
      .from('mistakes')
      .insert([{ ...payload, image_url: imageUrl }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ mistake: data });
  } catch (error) {
    console.error('Failed to save mistake:', error);
    res.status(500).json({ error: getErrorMessage(error, 'Failed to save mistake.') });
  }
});

app.patch('/api/mistakes/:id', requireAuth, async (req, res) => {
  const updates = normalizeMistakeUpdates(req.body);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'At least one updatable field is required.' });
    return;
  }

  try {
    const { data, error } = await req.supabase
      .from('mistakes')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ mistake: data });
  } catch (error) {
    console.error('Failed to update mistake:', error);
    res.status(500).json({ error: getErrorMessage(error, 'Failed to update mistake.') });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'Image exceeds the 10MB upload limit.' });
    return;
  }

  if (error.message === 'Origin not allowed by CORS.') {
    res.status(403).json({ error: error.message });
    return;
  }

  console.error('Unhandled backend error:', error);
  res.status(500).json({ error: 'Unexpected backend error.' });
});

app.listen(backendPort, () => {
  console.log(`Backend API listening on port ${backendPort}`);
});
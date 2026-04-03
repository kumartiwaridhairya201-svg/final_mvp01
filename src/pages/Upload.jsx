import { useEffect, useRef, useState } from 'react';
import { Upload as UploadIcon, Camera, Loader2, Image as ImageIcon, Save } from 'lucide-react';
import { analyzeQuestionImage } from '../api/ai';
import { getBackendConfig } from '../api/config';
import { createMistake } from '../api/mistakes';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import ConfigNotice from '../components/ConfigNotice';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    available: true,
    error: '',
    isLoading: true,
    openRouterConfigured: false,
    openRouterConfigError: '',
  });
  
  const [formData, setFormData] = useState({
    subject: 'Physics',
    topic: '',
    question_summary: '',
    my_mistake: '',
    revision_note: '',
    difficulty: 'Medium',
    needs_revision: true,
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadBackendConfig = async () => {
      try {
        const config = await getBackendConfig();

        if (!isMounted) {
          return;
        }

        const isAiEnabled = Boolean(config.openRouterConfigured);

        setBackendStatus({
          available: true,
          error: '',
          isLoading: false,
          openRouterConfigured: isAiEnabled,
          openRouterConfigError: config.openRouterConfigError ?? '',
        });
        setUseAI(isAiEnabled);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBackendStatus({
          available: false,
          error: error.message,
          isLoading: false,
          openRouterConfigured: false,
          openRouterConfigError: '',
        });
        setUseAI(false);
      }
    };

    loadBackendConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target.result;
      setPreview(base64Url);
      
      if (useAI && backendStatus.openRouterConfigured) {
        setIsAnalyzing(true);
        try {
          const base64Data = base64Url.split(',')[1];
          const aiResult = await analyzeQuestionImage(base64Data);
          setFormData(prev => ({
            ...prev,
            subject: ['Physics', 'Chemistry', 'Biology'].includes(aiResult.subject) ? aiResult.subject : prev.subject,
            topic: aiResult.topic || '',
            question_summary: aiResult.question_summary || '',
            my_mistake: aiResult.my_mistake || '',
            revision_note: aiResult.revision_note || '',
          }));
        } catch (error) {
          console.error("AI Analysis failed:", error);
          alert("AI Analysis failed. You can still enter details manually.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      alert(supabaseConfigError);
      return;
    }

    if (!backendStatus.available) {
      alert(backendStatus.error);
      return;
    }

    setIsSaving(true);
    
    try {
      await createMistake({ file, mistake: formData });
      navigate('/');
    } catch (error) {
      console.error("Save failed:", error);
      alert(error.message || 'Failed to save mistake.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="mb-2 bg-gradient-to-r from-cyan-300 via-sky-400 to-orange-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          Log New Mistake
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">Upload a screenshot or photo, let AI prefill what it can, and save the result directly to your personal revision backlog.</p>
      </div>

      {!isSupabaseConfigured && (
        <ConfigNotice
          title="Supabase not configured"
          message={supabaseConfigError}
        />
      )}

      {!backendStatus.available && (
        <ConfigNotice
          title="Backend unavailable"
          message={backendStatus.error}
        />
      )}

      {!backendStatus.isLoading && backendStatus.available && !backendStatus.openRouterConfigured && (
        <ConfigNotice
          title="AI extraction disabled"
          message={backendStatus.openRouterConfigError}
        />
      )}

      {!preview ? (
        <div className="space-y-4">
          <div className="mb-4 flex items-center space-x-3 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30">
            <label className="flex items-center cursor-pointer relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={!backendStatus.openRouterConfigured}
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${useAI ? 'bg-blue-600' : 'bg-gray-700'} ${!backendStatus.openRouterConfigured ? 'opacity-50' : ''}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${useAI ? 'left-6' : 'left-1'}`} />
              </div>
            </label>
            <div>
              <p className="font-medium text-gray-200">AI Auto-Extract</p>
              <p className="text-xs text-gray-500">Automatically extract subject, topic, and notes</p>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-white/10 bg-slate-900/70 p-8 text-center transition-all hover:border-cyan-400 hover:bg-cyan-500/5 sm:p-12"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 transition-colors group-hover:bg-cyan-500/20">
              <UploadIcon className="h-8 w-8 text-slate-400 transition-colors group-hover:text-cyan-300" />
            </div>
            <p className="mb-1 text-lg font-medium text-slate-200">Click or drag image here</p>
            <p className="text-sm text-slate-500">Supports JPG, PNG, WEBP</p>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 rounded-2xl bg-slate-900 px-4 py-4 font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
              />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 rounded-2xl bg-slate-900 px-4 py-4 font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="group relative flex h-48 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 sm:h-56">
            <img src={preview} alt="Preview" className="h-full object-contain" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-blue-400 font-medium animate-pulse">AI is analyzing question...</p>
              </div>
            )}
            {!isAnalyzing && (
              <button 
                type="button"
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute right-3 top-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 opacity-100 transition-opacity backdrop-blur-md sm:opacity-0 sm:group-hover:opacity-100"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4 shadow-xl shadow-slate-950/30 sm:p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject</label>
                <select 
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  disabled={isAnalyzing}
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Topic</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thermodynamics, Kinematics"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Difficulty</label>
                <select 
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  disabled={isAnalyzing}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <label className="flex items-center cursor-pointer relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.needs_revision}
                    onChange={(e) => setFormData({...formData, needs_revision: e.target.checked})}
                    disabled={isAnalyzing}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${formData.needs_revision ? 'bg-orange-600' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.needs_revision ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
                <div>
                  <p className="font-medium text-gray-200">Needs Revision</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Question Summary</label>
                <textarea 
                  rows={2}
                  placeholder="Briefly describe the question..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-gray-600"
                  value={formData.question_summary}
                  onChange={e => setFormData({...formData, question_summary: e.target.value})}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-500/80 mb-1.5">Why I got it wrong</label>
                <textarea 
                  rows={3}
                  placeholder="Calculation error, forgot formula, conceptual misunderstanding..."
                  className="w-full bg-red-950/20 border border-red-900/50 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-red-500 transition-colors resize-none placeholder:text-gray-600"
                  value={formData.my_mistake}
                  onChange={e => setFormData({...formData, my_mistake: e.target.value})}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-500/80 mb-1.5">Revision Note</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="The key takeaway to remember next time..."
                  className="w-full bg-blue-950/20 border border-blue-900/50 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-gray-600"
                  value={formData.revision_note}
                  onChange={e => setFormData({...formData, revision_note: e.target.value})}
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isAnalyzing || isSaving || !isSupabaseConfigured || !backendStatus.available}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 flex items-center justify-center space-x-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isSaving ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Saving Mistake...' : 'Save Mistake'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

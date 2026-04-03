import { useState, useEffect } from 'react';
import { listMistakes, updateMistake } from '../api/mistakes';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { Loader2, Zap, CheckCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import ConfigNotice from '../components/ConfigNotice';

export default function Revision() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    fetchRevisionMistakes();
  }, []);

  const fetchRevisionMistakes = async () => {
    try {
      setErrorMessage('');
      const data = await listMistakes({ needsRevision: true });
      setMistakes(data);
    } catch (err) {
      console.error('Error fetching mistakes:', err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (markLearned) => {
    const currentMistake = mistakes[currentIndex];
    
    if (markLearned && isSupabaseConfigured) {
      try {
        setErrorMessage('');
        await updateMistake(currentMistake.id, { needs_revision: false });
      } catch (err) {
        console.error('Error updating logic:', err);
        setErrorMessage(err.message);
      }
    }
    
    if (currentIndex + 1 < mistakes.length) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Session finished
      setMistakes(mistakes.filter((_, idx) => idx > currentIndex || !markLearned));
      setSessionStarted(false);
      setCurrentIndex(0);
      setShowAnswer(false);
      fetchRevisionMistakes();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <ConfigNotice
        title="Supabase not configured"
        message={supabaseConfigError}
        className="max-w-2xl mx-auto mt-12"
      />
    );
  }

  if (errorMessage) {
    return (
      <ConfigNotice
        title="Could not load revision queue"
        message={errorMessage}
        className="max-w-2xl mx-auto mt-12"
      />
    );
  }

  if (mistakes.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-8 text-center shadow-xl shadow-slate-950/30 sm:mt-20">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">You&apos;re all caught up!</h2>
        <p className="text-gray-400 mb-6">No pending mistakes to revise. Great job mastering your weak concepts.</p>
        <Link to="/" className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2.5 rounded-xl font-medium transition-colors">
          Back to Feed
        </Link>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-8 text-center shadow-xl shadow-slate-950/30 sm:mt-20">
        <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCcw className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Revision Time</h2>
        <p className="text-gray-400 mb-8">You have {mistakes.length} concepts marked for revision. Let&apos;s strengthen your weak areas.</p>
        <button 
          onClick={() => setSessionStarted(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-lg transition-all shadow-lg shadow-blue-500/20"
        >
          Start Revision Session
        </button>
      </div>
    );
  }

  const mistake = mistakes[currentIndex];
  
  const subjectColors = {
    Physics: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    Chemistry: 'text-green-400 bg-green-400/10 border border-green-400/20',
    Biology: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-slate-900/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-slate-300">Card {currentIndex + 1} of {mistakes.length}</span>
        <div className="flex space-x-1">
          {mistakes.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2 h-2 rounded-full",
                i === currentIndex ? "bg-blue-500" : i < currentIndex ? "bg-green-500" : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-[380px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/85 shadow-2xl shadow-slate-950/30 sm:min-h-[420px]">
        {/* Front of card */}
        <div className="relative flex flex-grow flex-col justify-center p-5 sm:p-6">
          <div className="absolute left-5 top-5 flex items-center space-x-2 sm:left-6 sm:top-6">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium", subjectColors[mistake.subject])}>
              {mistake.subject}
            </span>
          </div>
          
          <div className="mb-6 mt-8 sm:mt-10">
            <h3 className="mb-4 text-center text-lg font-medium text-slate-300 sm:text-xl">{mistake.topic}</h3>
            
            {mistake.image_url && (
              <div className="mb-6 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 md:h-64">
                <img src={mistake.image_url} alt="Question" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            
            {mistake.question_summary && !mistake.image_url && (
              <p className="text-center text-base text-slate-200 sm:text-lg">{mistake.question_summary}</p>
            )}
          </div>

          {!showAnswer && (
            <div className="mt-auto pt-6 flex justify-center">
              <button 
                onClick={() => setShowAnswer(true)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium py-2 px-6 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              >
                <span>Show Answer</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Back of card (Answer) */}
        {showAnswer && (
          <div className="animate-in slide-in-from-bottom-4 fade-in border-t border-white/10 bg-slate-800/50 p-5 duration-300 sm:p-6">
            <div className="space-y-4 mb-8">
              {mistake.my_mistake && (
                <div>
                  <h4 className="text-red-400 font-medium text-sm mb-1 uppercase tracking-wider">What I did wrong</h4>
                  <p className="text-gray-300">{mistake.my_mistake}</p>
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <h4 className="text-blue-400 font-medium text-sm mb-1 uppercase tracking-wider flex items-center">
                  <Zap className="w-4 h-4 mr-1.5" /> Core Concept
                </h4>
                <p className="text-gray-100 font-medium text-lg">{mistake.revision_note}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button 
                onClick={() => handleNext(false)}
                className="flex items-center justify-center space-x-2 py-3.5 rounded-xl text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 font-medium transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
                <span>Still Confused</span>
              </button>
              <button 
                onClick={() => handleNext(true)}
                className="flex items-center justify-center space-x-2 py-3.5 rounded-xl text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Got It ✓</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

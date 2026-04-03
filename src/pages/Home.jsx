import { useState, useEffect } from 'react';
import { listMistakes, updateMistake } from '../api/mistakes';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import MistakeCard from '../components/MistakeCard';
import { Search, Loader2, Frown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfigNotice from '../components/ConfigNotice';
import { useAuth } from '../context/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterNeedsRevision, setFilterNeedsRevision] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      setErrorMessage('');
      const data = await listMistakes();
      setMistakes(data);
    } catch (err) {
      console.error('Error fetching mistakes:', err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNeedsRevision = async (id, newValue) => {
    if (!isSupabaseConfigured) {
      return;
    }

    // Optimistic update
    setMistakes((currentMistakes) =>
      currentMistakes.map((mistake) =>
        mistake.id === id ? { ...mistake, needs_revision: newValue } : mistake
      )
    );

    try {
      setErrorMessage('');
      await updateMistake(id, { needs_revision: newValue });
    } catch (err) {
      console.error('Error updating:', err);
      setErrorMessage(err.message);
      // Revert on error
      fetchMistakes();
    }
  };

  const filteredMistakes = mistakes.filter(m => {
    const matchesSearch = (m.topic || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.question_summary || '').toLowerCase().includes(search.toLowerCase());
    const matchesSubject = filterSubject === 'All' || m.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'All' || m.difficulty === filterDifficulty;
    const matchesRevision = !filterNeedsRevision || m.needs_revision === true;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesRevision;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
            {user?.email}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Mistake Feed</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Review every question you missed, update revision status fast, and keep one private log that works cleanly on mobile.</p>
          </div>
        </div>
        
        <Link 
          to="/upload" 
          className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
        >
          + Log Mistake
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <ConfigNotice
          title="Supabase not configured"
          message={supabaseConfigError}
        />
      )}

      {errorMessage && isSupabaseConfigured && (
        <ConfigNotice
          title="Could not load mistakes"
          message={errorMessage}
        />
      )}

      <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by topic, keyword..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select 
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-slate-300 focus:border-cyan-400 focus:outline-none"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
          
          <select 
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-slate-300 focus:border-cyan-400 focus:outline-none"
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-opacity-25"
              checked={filterNeedsRevision}
              onChange={e => setFilterNeedsRevision(e.target.checked)}
            />
            <span className="text-sm text-slate-300">Needs Revision Only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : !isSupabaseConfigured ? null : filteredMistakes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
          {filteredMistakes.map(mistake => (
            <MistakeCard 
              key={mistake.id} 
              mistake={mistake} 
              onUpdateNeedsRevision={handleUpdateNeedsRevision} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 px-6 py-16 text-center shadow-xl shadow-slate-950/30">
          <Frown className="mx-auto mb-3 h-12 w-12 text-slate-600" />
          <h3 className="text-xl font-medium text-slate-300">No mistakes found</h3>
          <p className="mt-1 text-slate-500">
            {mistakes.length === 0 ? "You haven't logged any mistakes yet. Keep practicing!" : "Try adjusting your filters."}
          </p>
        </div>
      )}
    </div>
  );
}

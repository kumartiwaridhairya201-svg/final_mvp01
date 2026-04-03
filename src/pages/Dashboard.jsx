import { useState, useEffect } from 'react';
import { listMistakes } from '../api/mistakes';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { Loader2, Target, BookOpen, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import ConfigNotice from '../components/ConfigNotice';

export default function Dashboard() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
        className="max-w-3xl"
      />
    );
  }

  if (errorMessage) {
    return (
      <ConfigNotice
        title="Could not load dashboard"
        message={errorMessage}
        className="max-w-3xl"
      />
    );
  }

  const totalMistakes = mistakes.length;
  const pendingRevisions = mistakes.filter(m => m.needs_revision).length;
  const masteredConcepts = totalMistakes - pendingRevisions;

  const subjectData = [
    { name: 'Physics', value: mistakes.filter(m => m.subject === 'Physics').length, color: '#3b82f6' },
    { name: 'Chemistry', value: mistakes.filter(m => m.subject === 'Chemistry').length, color: '#10b981' },
    { name: 'Biology', value: mistakes.filter(m => m.subject === 'Biology').length, color: '#f97316' },
  ].filter(d => d.value > 0);

  const difficultyData = [
    { name: 'Easy', value: mistakes.filter(m => m.difficulty === 'Easy').length, color: '#10b981' },
    { name: 'Medium', value: mistakes.filter(m => m.difficulty === 'Medium').length, color: '#facc15' },
    { name: 'Hard', value: mistakes.filter(m => m.difficulty === 'Hard').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Performance Dashboard</h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">See where mistakes cluster, how much is still pending, and which subjects need a tighter revision loop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/30 sm:items-center sm:p-6">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-400 font-medium">Total Mistakes Logged</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">{totalMistakes}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/30 sm:items-center sm:p-6">
          <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-400 font-medium">Pending Revisions</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">{pendingRevisions}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/30 sm:items-center sm:p-6">
          <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-400 font-medium">Mastered Concepts</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">{masteredConcepts}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Breakdown */}
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/30 sm:p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-6 font-sans">Mistakes by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/30 sm:p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-6 font-sans">Mistakes by Difficulty</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {difficultyData.map(entry => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

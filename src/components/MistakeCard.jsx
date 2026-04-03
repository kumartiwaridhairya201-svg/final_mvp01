import { cn } from '../lib/utils';
import { BookOpen, AlertCircle, Bookmark, CheckCircle, RefreshCcw } from 'lucide-react';

const subjectColors = {
  Physics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Chemistry: 'bg-green-500/20 text-green-400 border-green-500/30',
  Biology: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const difficultyColors = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
};

export default function MistakeCard({ mistake, onUpdateNeedsRevision }) {
  const { 
    id, subject, topic, question_summary, 
    my_mistake, revision_note, difficulty, 
    needs_revision, image_url 
  } = mistake;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/85 shadow-xl shadow-slate-950/30 transition-colors hover:border-white/20">
      {image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img 
            src={image_url} 
            alt="Question" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                subjectColors[subject] || 'bg-gray-800 text-gray-300'
              )}>
                {subject}
              </span>
              <span className={cn(
                "text-xs font-semibold flex items-center",
                difficultyColors[difficulty] || 'text-gray-400'
              )}>
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {difficulty}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-gray-100 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
              {topic}
            </h3>
          </div>
          
          <button
            onClick={() => onUpdateNeedsRevision(id, !needs_revision)}
            className={cn(
              "self-start rounded-full p-2 transition-all sm:self-auto",
              needs_revision 
                ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
                : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
            )}
            title={needs_revision ? "Mark as mastered" : "Mark for revision"}
          >
            {needs_revision ? <RefreshCcw className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-3">
          {question_summary && (
            <div className="text-sm">
              <p className="text-gray-400 font-medium mb-1 line-clamp-1">Question</p>
              <p className="text-gray-300 line-clamp-2">{question_summary}</p>
            </div>
          )}
          
          {my_mistake && (
            <div className="text-sm bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              <p className="text-red-400 font-medium mb-1">My Mistake</p>
              <p className="text-gray-300">{my_mistake}</p>
            </div>
          )}
          
          {revision_note && (
            <div className="text-sm bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              <p className="text-blue-400 font-medium mb-1 flex items-center">
                <Bookmark className="w-4 h-4 mr-1.5" />
                Revision Note
              </p>
              <p className="text-gray-300 line-clamp-3">{revision_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

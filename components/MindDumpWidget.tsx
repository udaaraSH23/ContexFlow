import React, { useState } from 'react';
import { MindDumpItem, Bucket, Task } from '../types';
import { Brain, ArrowRight, Archive, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface MindDumpWidgetProps {
  items: MindDumpItem[];
  buckets: Bucket[];
  tasks: Task[]; // For loop detection
  onAdd: (text: string) => void;
  onUpdate: (item: MindDumpItem) => void;
  onConvertToTask: (dumpId: string, bucketId: string, text: string) => void;
}

export const MindDumpWidget: React.FC<MindDumpWidgetProps> = ({ 
  items, buckets, tasks, onAdd, onUpdate, onConvertToTask 
}) => {
  const [inputText, setInputText] = useState('');
  const [convertId, setConvertId] = useState<string | null>(null);

  const activeItems = items.filter(i => i.status === 'inbox').sort((a, b) => b.createdAt - a.createdAt);

  // Forgotten Loop Detection
  const forgottenTasks = tasks.filter(t => {
      // Logic: In 'Doing' or 'Refine' for too long, or Parked
      if (t.state === 'Doing') return true; // Shouldn't leave things in Doing without session
      if (t.state === 'Refine') {
          const ageHours = (Date.now() - t.updatedAt) / (1000 * 60 * 60);
          return ageHours > 168; // 7 days
      }
      return false;
  }).slice(0, 3); // Top 3

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      onAdd(inputText.trim());
      setInputText('');
    }
  };

  const handleArchive = (item: MindDumpItem) => {
    onUpdate({ ...item, status: 'archived' });
  };

  const handleConvertSelection = (bucketId: string) => {
    if (convertId) {
        const item = items.find(i => i.id === convertId);
        if (item) {
            onConvertToTask(item.id, bucketId, item.text);
            setConvertId(null);
        }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="font-bold text-indigo-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
            Mind Space
        </h3>
        <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">Capture & Triage</span>
      </div>
      
      <div className="p-4 space-y-4">
        
        {/* Input */}
        <div className="relative">
            <input 
                className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                placeholder="Anything on your mind? Drop it here..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-400 font-medium">↵</div>
        </div>

        {/* List */}
        <div className="space-y-2">
            {activeItems.length === 0 && (
                <div className="text-center text-gray-400 text-xs italic py-2">
                    Mind clear. Excellent.
                </div>
            )}
            {activeItems.map(item => (
                <div key={item.id} className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    {convertId === item.id ? (
                        <div className="flex-1 flex items-center space-x-2 animate-fade-in">
                            <span className="text-xs font-bold text-gray-500">To Bucket:</span>
                            <select 
                                autoFocus
                                className="flex-1 p-1 text-sm border rounded"
                                onChange={(e) => handleConvertSelection(e.target.value)}
                                onBlur={() => setConvertId(null)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select...</option>
                                {buckets.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <span className="text-sm text-gray-700 truncate flex-1 mr-4">{item.text}</span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setConvertId(item.id)}
                                    title="Convert to Task"
                                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleArchive(item)}
                                    title="Archive"
                                    className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded"
                                >
                                    <Archive className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>

        {/* Forgotten Loop Detector */}
        {forgottenTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center mb-2 text-xs font-bold text-orange-500 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Detected Open Loops
                </div>
                <div className="space-y-1">
                    {forgottenTasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between text-xs text-gray-600 bg-orange-50 p-2 rounded">
                            <span className="truncate flex-1 mr-2">{t.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.state === 'Doing' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                                {t.state === 'Doing' ? 'Stuck in Doing' : 'Stale Refine'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

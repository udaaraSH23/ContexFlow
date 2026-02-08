import React, { useState } from 'react';
import { AppData, Plan, Bucket, Task, MindDumpItem } from '../types';
import { Moon, Calendar, Save, CheckCircle2, ArrowRight, Brain, Briefcase, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface PlanningViewProps {
  data: AppData;
  onSavePlan: (plan: Plan) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ data, onSavePlan }) => {
  const [tab, setTab] = useState<'Nightly' | 'Weekly'>('Nightly');
  
  // Nightly State
  const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const existingNightly = data.plans.find(p => p.type === 'Nightly' && p.dateKey === tomorrowKey);
  
  const [nightlyState, setNightlyState] = useState<Partial<Plan>>(existingNightly || {
    type: 'Nightly',
    dateKey: tomorrowKey,
    sprintBucketIds: []
  });

  // Weekly State
  const currentWeekKey = format(new Date(), 'yyyy-ww');
  const existingWeekly = data.plans.find(p => p.type === 'Weekly' && p.dateKey === currentWeekKey);
  const [weeklyState, setWeeklyState] = useState<Partial<Plan>>(existingWeekly || {
    type: 'Weekly',
    dateKey: currentWeekKey,
    outcomes: ['', '', '']
  });

  // --- DERIVED DATA FOR SPLIT SCREEN ---
  const activeTasks = data.tasks.filter(t => t.state === 'Ready' || t.state === 'Refine' || t.state === 'Inbox');
  const inboxMindDump = data.mindDumpItems.filter(i => i.status === 'inbox');
  
  // Buckets
  const recoveryBuckets = data.buckets.filter(b => b.category === 'Self-Care & Fun');
  const workBuckets = data.buckets.filter(b => b.category !== 'Self-Care & Fun');

  const handleSaveNightly = () => {
    onSavePlan({
      id: existingNightly?.id || `plan-${Date.now()}`,
      createdAt: Date.now(),
      type: 'Nightly',
      dateKey: tomorrowKey,
      anchorBucketId: nightlyState.anchorBucketId,
      anchorTaskId: nightlyState.anchorTaskId,
      sprintBucketIds: nightlyState.sprintBucketIds,
      recoveryBucketId: nightlyState.recoveryBucketId
    });
    alert("Nightly plan saved! See you tomorrow.");
  };

  const handleSaveWeekly = () => {
    onSavePlan({
        id: existingWeekly?.id || `plan-${Date.now()}`,
        createdAt: Date.now(),
        type: 'Weekly',
        dateKey: currentWeekKey,
        outcomes: weeklyState.outcomes
    });
    alert("Weekly outcomes saved.");
  };

  const toggleSprintBucket = (bucketId: string) => {
    const current = nightlyState.sprintBucketIds || [];
    if (current.includes(bucketId)) {
        setNightlyState({...nightlyState, sprintBucketIds: current.filter(id => id !== bucketId)});
    } else {
        if (current.length < 2) {
            setNightlyState({...nightlyState, sprintBucketIds: [...current, bucketId]});
        }
    }
  };

  const setAnchor = (bucketId: string, taskId?: string) => {
      setNightlyState({
          ...nightlyState,
          anchorBucketId: bucketId,
          anchorTaskId: taskId
      });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header Tabs */}
      <div className="flex space-x-4 mb-6 flex-shrink-0">
        <button 
          onClick={() => setTab('Nightly')}
          className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${tab === 'Nightly' ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <Moon className="w-5 h-5 mr-2" />
          Nightly Strategy <span className="ml-2 opacity-60 font-normal text-xs">(Tomorrow)</span>
        </button>
        <button 
          onClick={() => setTab('Weekly')}
          className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${tab === 'Weekly' ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Weekly Strategy
        </button>
      </div>

      {tab === 'Nightly' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
            
            {/* LEFT COLUMN: CONTEXT POOL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                        Available Context
                    </h3>
                    <p className="text-xs text-gray-500">Open tasks & mind dumps.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    
                    {/* Tasks List */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Tasks (Ready/Refine)</h4>
                        <div className="space-y-2">
                            {activeTasks.map(task => {
                                const bucket = data.buckets.find(b => b.id === task.bucketId);
                                return (
                                    <div key={task.id} className="group p-3 border rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{task.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{bucket?.name} • {task.state}</div>
                                            </div>
                                            <button 
                                                onClick={() => setAnchor(task.bucketId, task.id)}
                                                className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-bold hover:bg-indigo-200"
                                            >
                                                Set Anchor
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                            {activeTasks.length === 0 && <div className="text-sm text-gray-400 italic">No open tasks. Good job?</div>}
                        </div>
                    </div>

                    {/* Mind Dump List */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                             <Brain className="w-3 h-3 mr-1" /> Mind Space Inbox
                        </h4>
                        <div className="space-y-2">
                            {inboxMindDump.map(item => (
                                <div key={item.id} className="p-3 border border-dashed rounded-lg bg-gray-50 text-sm text-gray-600">
                                    {item.text}
                                    {/* Simplified interaction for MVP */}
                                </div>
                            ))}
                            {inboxMindDump.length === 0 && <div className="text-sm text-gray-400 italic">Mind space empty.</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: TOMORROW'S PLAN */}
            <div className="bg-indigo-50 rounded-2xl shadow-inner border border-indigo-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-indigo-100 bg-indigo-100/50">
                    <h3 className="font-bold text-indigo-900">Tomorrow's Strategy</h3>
                    <p className="text-xs text-indigo-600">Commit to one anchor.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Anchor Slot */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-indigo-200">
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-2">1. The Anchor (Deep Work)</div>
                        {nightlyState.anchorBucketId ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xl text-gray-800">
                                        {data.buckets.find(b => b.id === nightlyState.anchorBucketId)?.name}
                                    </div>
                                    {nightlyState.anchorTaskId && (
                                        <div className="text-indigo-600 font-medium mt-1">
                                            Task: {data.tasks.find(t => t.id === nightlyState.anchorTaskId)?.title}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setNightlyState({...nightlyState, anchorBucketId: undefined, anchorTaskId: undefined})} className="text-gray-400 hover:text-red-500">Change</button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
                                Select a task from the left<br/>or click a bucket below
                            </div>
                        )}
                        
                        {/* Bucket Quick Pick if empty */}
                        {!nightlyState.anchorBucketId && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {workBuckets.map(b => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => setAnchor(b.id)}
                                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-indigo-100 text-gray-600"
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sprint Slot */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">2. Micro-Sprints (Maintenance)</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {nightlyState.sprintBucketIds?.map(bid => (
                                <span key={bid} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold flex items-center">
                                    {data.buckets.find(b => b.id === bid)?.name}
                                    <button onClick={() => toggleSprintBucket(bid)} className="ml-2 hover:text-emerald-900">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Add up to 2:</div>
                        <div className="flex flex-wrap gap-2">
                            {workBuckets.filter(b => b.id !== nightlyState.anchorBucketId).map(b => (
                                <button 
                                    key={b.id}
                                    onClick={() => toggleSprintBucket(b.id)}
                                    disabled={nightlyState.sprintBucketIds?.includes(b.id)}
                                    className="px-2 py-1 border rounded text-xs hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recovery Slot */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">3. Recovery (Required)</div>
                        <div className="flex flex-wrap gap-2">
                            {recoveryBuckets.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => setNightlyState({...nightlyState, recoveryBucketId: b.id})}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${nightlyState.recoveryBucketId === b.id ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t">
                     <button 
                        onClick={handleSaveNightly}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-200"
                    >
                        <Save className="w-5 h-5 mr-2" /> Confirm Strategy
                    </button>
                </div>
            </div>
        </div>
      )}

      {tab === 'Weekly' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Must-Win Outcomes</h2>
              <div className="space-y-4 mb-8">
                  {[0, 1, 2].map(idx => (
                      <div key={idx}>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Outcome {idx + 1}</label>
                          <input 
                            value={weeklyState.outcomes?.[idx] || ''}
                            onChange={e => {
                                const newOutcomes = [...(weeklyState.outcomes || [])];
                                newOutcomes[idx] = e.target.value;
                                setWeeklyState({...weeklyState, outcomes: newOutcomes});
                            }}
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white outline-none"
                            placeholder="e.g. Finish Authentication Module"
                          />
                      </div>
                  ))}
              </div>
               <button 
                    onClick={handleSaveWeekly}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                    Save Outcomes
                </button>
          </div>
      )}
    </div>
  );
};

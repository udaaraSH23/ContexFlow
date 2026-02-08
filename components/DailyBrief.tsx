import React from 'react';
import { AppData, Bucket, Session, Task, Goal, Milestone, Plan, MindDumpItem } from '../types';
import { Play, Coffee, Zap, AlertTriangle, ArrowRight, CheckCircle2, AlertCircle, Sun, Sunrise, Sunset, Flame, ChevronRight, Split } from 'lucide-react';
import { format, isSameDay, subDays } from 'date-fns';
import { MindDumpWidget } from './MindDumpWidget';

interface DailyBriefProps {
  data: AppData;
  onStartSession: (bucketId: string, type: 'Anchor' | 'Sprint' | 'Recovery', taskId?: string) => void;
  onAddMindDump: (text: string) => void;
  onUpdateMindDump: (item: MindDumpItem) => void;
  onConvertMindDump: (dumpId: string, bucketId: string, text: string) => void;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({ 
    data, onStartSession, onAddMindDump, onUpdateMindDump, onConvertMindDump 
}) => {
  // --- PLAN & CONTEXT CHECK ---
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayPlan = data.plans.find(p => p.type === 'Nightly' && p.dateKey === todayKey);
  const hour = new Date().getHours();
  
  // Greeting Logic
  let greeting = "Good Morning.";
  let Icon = Sunrise;
  if (hour >= 12 && hour < 17) { greeting = "Good Afternoon."; Icon = Sun; }
  else if (hour >= 17) { greeting = "Good Evening."; Icon = Sunset; }

  // Yesterday Context
  const yesterday = subDays(new Date(), 1);
  const yesterdaySessions = data.sessions.filter(s => isSameDay(s.startedAt, yesterday));
  const yesterdayNarrative = yesterdaySessions.length > 0 
    ? `You logged ${yesterdaySessions.length} sessions yesterday.` 
    : "Fresh start today.";

  // --- SELECTION LOGIC ---
  const getLastSession = (bucketId: string) => {
    return data.sessions
      .filter(s => s.bucketId === bucketId)
      .sort((a, b) => b.startedAt - a.startedAt)[0];
  };

  const isNeglected = (bucketId: string) => {
    const last = getLastSession(bucketId);
    if (!last) return true; 
    const diffHours = (Date.now() - last.startedAt) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Logic: Pick Anchor
  let anchorBucket: Bucket | undefined;
  if (todayPlan && todayPlan.anchorBucketId) {
    anchorBucket = data.buckets.find(b => b.id === todayPlan.anchorBucketId);
  } else {
    // Auto Pick: Priority Main Work bucket with 'Doing' or 'Ready' tasks
    anchorBucket = data.buckets.find(b => b.category === 'Main Work' && 
      data.tasks.some(t => t.bucketId === b.id && (t.state === 'Doing' || t.state === 'Ready'))) 
      || data.buckets.find(b => b.category === 'Main Work');
  }

  const anchorTask = todayPlan?.anchorTaskId 
      ? data.tasks.find(t => t.id === todayPlan.anchorTaskId)
      : (anchorBucket 
        ? data.tasks.find(t => t.bucketId === anchorBucket.id && t.state === 'Doing') 
          || data.tasks.find(t => t.bucketId === anchorBucket.id && t.state === 'Ready')
        : undefined);

  // Logic: Pick Sprint 
  let sprintBucket: Bucket | undefined;
  if (todayPlan && todayPlan.sprintBucketIds && todayPlan.sprintBucketIds.length > 0) {
      sprintBucket = data.buckets.find(b => b.id === todayPlan.sprintBucketIds![0]);
  } else {
      // Auto Pick: Neglected Main/Support
      sprintBucket = data.buckets.find(b => b.id !== anchorBucket?.id && isNeglected(b.id) && (b.category === 'Main Work' || b.category === 'Supporting Habits'))
      || data.buckets.find(b => b.category === 'Supporting Habits');
  }

  // Logic: Pick Recovery
  let recoveryBucket: Bucket | undefined;
  if (todayPlan && todayPlan.recoveryBucketId) {
      recoveryBucket = data.buckets.find(b => b.id === todayPlan.recoveryBucketId);
  } else {
      recoveryBucket = data.buckets.find(b => b.category === 'Self-Care & Fun');
  }

  const anchorLastSession = anchorBucket ? getLastSession(anchorBucket.id) : undefined;
  
  // Stale Detection
  const isStale = anchorTask && anchorTask.state === 'Doing' && (Date.now() - anchorTask.updatedAt > (24 * 60 * 60 * 1000));

  // Goal Context
  let goalContext: { goal?: Goal, milestone?: Milestone } = {};
  if (anchorTask && anchorTask.milestoneId) {
    const m = data.milestones.find(m => m.id === anchorTask.milestoneId);
    const g = m ? data.goals.find(g => g.id === m.goalId) : undefined;
    goalContext = { goal: g, milestone: m };
  }

  if (!anchorBucket) return <div>Add buckets to see your brief.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Main Brief (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* NARRATIVE HEADER */}
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{greeting}</h1>
                    <p className="text-sm text-gray-500">{yesterdayNarrative} Today is about execution.</p>
                </div>
            </div>
            {todayPlan ? (
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Plan Active
                </span>
            ) : (
                <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Auto-Pilot
                </span>
            )}
        </div>

        {/* HERO: THE ANCHOR */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
            
            <div className="p-6 md:p-8">
                {/* Badge Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                         <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">Primary Focus (Anchor)</span>
                         <span className="text-gray-300">|</span>
                         <span className="text-xs font-bold text-gray-600">{anchorBucket.name}</span>
                    </div>
                    {anchorLastSession && (
                        <div className="text-xs text-gray-400">
                            Last active: {format(anchorLastSession.startedAt, 'MMM d')}
                        </div>
                    )}
                </div>

                {/* Hero Content */}
                <div className="mb-6">
                    {anchorTask ? (
                        <div>
                             <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                {anchorTask.nextAction ? `Action: ${anchorTask.nextAction}` : anchorTask.title}
                             </h2>
                             <div className="flex items-center text-gray-500 text-sm">
                                <span className="font-medium mr-2">Goal:</span> {anchorTask.doneDefinition || "Complete the task"}
                             </div>
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-400 italic">No specific task selected.</h2>
                    )}
                </div>

                {/* Resume Context / Stale Alert */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                    {isStale ? (
                         <div className="flex items-start">
                             <AlertCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                             <div>
                                 <p className="text-sm font-bold text-orange-700">Stuck in "Doing"?</p>
                                 <p className="text-xs text-orange-600 mt-1">
                                     This task has been active for over 24h. If you're blocked, try breaking it down or switching to "Refine".
                                 </p>
                             </div>
                         </div>
                    ) : anchorLastSession?.closeoutNext ? (
                         <div className="flex items-start">
                             <ArrowRight className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                             <div>
                                 <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Context from last session</p>
                                 <p className="text-sm text-gray-700 font-medium">"{anchorLastSession.closeoutNext}"</p>
                                 {anchorLastSession.closeoutFirstAction && (
                                     <p className="text-xs text-gray-500 mt-1">Start by: {anchorLastSession.closeoutFirstAction}</p>
                                 )}
                             </div>
                         </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Starting fresh on this bucket.</p>
                    )}
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => onStartSession(anchorBucket!.id, 'Anchor', anchorTask?.id)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-lg flex items-center justify-center transition-all transform hover:scale-[1.01]"
                >
                  <Play className="w-6 h-6 mr-3 fill-current" />
                  Launch Session
                </button>
            </div>
        </div>

        {/* SECONDARY: SPRINT & RECOVERY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sprint Card */}
            {sprintBucket && (
            <div 
                onClick={() => onStartSession(sprintBucket!.id, 'Sprint')}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Micro-Sprint</span>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-700 transition-colors mt-1">{sprintBucket.name}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Zap className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    {isNeglected(sprintBucket.id) ? '⚠️ Bucket neglected. Quick 20m touch.' : 'Keep the context warm.'}
                </p>
            </div>
            )}

            {/* Recovery Card */}
            {recoveryBucket && (
            <div 
                onClick={() => onStartSession(recoveryBucket!.id, 'Recovery')}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
            >
                 <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Recovery</span>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors mt-1">{recoveryBucket.name}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Coffee className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Required to prevent crash. Reset energy.
                </p>
            </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: Mind Dump & Tools (1/3 width) */}
      <div className="lg:col-span-1 space-y-6">
          <MindDumpWidget 
            items={data.mindDumpItems || []} 
            buckets={data.buckets}
            tasks={data.tasks}
            onAdd={onAddMindDump}
            onUpdate={onUpdateMindDump}
            onConvertToTask={onConvertMindDump}
          />
          
          {/* Goal Context Widget (Moved here to clear up Main Stage) */}
          {goalContext.goal && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                 <div className="text-xs font-bold text-gray-400 uppercase mb-2">Active Goal</div>
                 <div className="font-bold text-gray-800 mb-1">{goalContext.goal.title}</div>
                 <div className="text-sm text-indigo-600 flex items-center">
                     <Flame className="w-4 h-4 mr-1" />
                     {goalContext.milestone?.title || "In Progress"}
                 </div>
             </div>
          )}
      </div>
    </div>
  );
};

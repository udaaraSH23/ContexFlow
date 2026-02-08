import React from 'react';
import { AppData, Bucket, Task, Session } from '../types';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Battery, Calendar } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface StandupViewProps {
  data: AppData;
  onStartSession: (bucketId: string) => void;
}

export const StandupView: React.FC<StandupViewProps> = ({ data, onStartSession }) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  const tomorrowKey = format(tomorrow, 'yyyy-MM-dd');
  const tomorrowPlan = data.plans.find(p => p.type === 'Nightly' && p.dateKey === tomorrowKey);

  // Group buckets
  const buckets = data.buckets;

  // Helper to get bucket stats
  const getBucketContext = (bucket: Bucket) => {
    // 1. Yesterday: Did we work?
    const yesterdaySessions = data.sessions.filter(s => s.bucketId === bucket.id && isSameDay(s.startedAt, yesterday));
    const lastSession = yesterdaySessions.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0))[0];
    
    // 2. Today: Active Tasks?
    const activeTask = data.tasks.find(t => t.bucketId === bucket.id && t.state === 'Doing');
    const readyTasks = data.tasks.filter(t => t.bucketId === bucket.id && t.state === 'Ready');
    const isStale = activeTask && (Date.now() - activeTask.updatedAt > 24 * 60 * 60 * 1000);

    // 3. Tomorrow: Is it in the plan?
    const isPlannedAnchor = tomorrowPlan?.anchorBucketId === bucket.id;
    const isPlannedSprint = tomorrowPlan?.sprintBucketIds?.includes(bucket.id);
    const isPlannedRecovery = tomorrowPlan?.recoveryBucketId === bucket.id;

    const hasActivity = yesterdaySessions.length > 0 || activeTask || readyTasks.length > 0 || isPlannedAnchor || isPlannedSprint;

    return { lastSession, activeTask, readyTasks, isStale, isPlannedAnchor, isPlannedSprint, isPlannedRecovery, hasActivity };
  };

  const activeBuckets = buckets.filter(b => getBucketContext(b).hasActivity);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
             Daily Standup
             <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">{format(today, 'EEEE, MMM do')}</span>
          </h1>
          <p className="text-gray-500 mt-1">Reviewing flow across {activeBuckets.length} active areas.</p>
        </div>
        <div className="flex space-x-6 mt-4 md:mt-0">
           <div className="text-center">
             <div className="text-xs font-bold text-gray-400 uppercase">Yesterday</div>
             <div className="font-mono font-bold text-lg text-gray-800">
               {data.sessions.filter(s => isSameDay(s.startedAt, yesterday)).length} Sessions
             </div>
           </div>
           <div className="text-center">
             <div className="text-xs font-bold text-gray-400 uppercase">Current Focus</div>
             <div className="font-mono font-bold text-lg text-indigo-600">
               {data.tasks.filter(t => t.state === 'Doing').length} Active
             </div>
           </div>
           <div className="text-center">
             <div className="text-xs font-bold text-gray-400 uppercase">Tomorrow</div>
             <div className="font-mono font-bold text-lg text-gray-800">
               {tomorrowPlan ? 'Planned' : 'Pending'}
             </div>
           </div>
        </div>
      </div>

      {/* The Matrix */}
      <div className="space-y-6">
        {activeBuckets.map(bucket => {
          const ctx = getBucketContext(bucket);
          
          return (
            <div key={bucket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
              
              {/* Bucket Label (Sidebar) */}
              <div className={`w-full md:w-48 p-4 ${CATEGORY_COLORS[bucket.category]} bg-opacity-10 border-b md:border-b-0 md:border-r border-gray-100 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center`}>
                 <div className="font-bold text-gray-800">{bucket.name}</div>
                 <div className="text-xs text-gray-500 mt-1">{bucket.category}</div>
                 <button 
                    onClick={() => onStartSession(bucket.id)}
                    className="mt-0 md:mt-4 text-xs bg-white border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1 rounded shadow-sm transition-colors"
                 >
                    Open Area
                 </button>
              </div>

              {/* The 3 Columns */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                
                {/* 1. YESTERDAY */}
                <div className="p-5 bg-gray-50/50">
                  <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     <Clock className="w-3 h-3" />
                     <span>Yesterday</span>
                  </div>
                  {ctx.lastSession ? (
                    <div>
                       <div className="flex items-center text-sm font-bold text-gray-700 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Finished: "{ctx.lastSession.closeoutFinished}"
                       </div>
                       <div className="mt-2 text-xs text-gray-500 pl-6 border-l-2 border-gray-200 ml-2">
                          <span className="font-semibold text-gray-600">Context:</span> {ctx.lastSession.closeoutNext}
                       </div>
                       <div className="mt-2 flex items-center text-xs text-gray-400 pl-6">
                          <Battery className="w-3 h-3 mr-1" /> Energy: {ctx.lastSession.energyAfter}/5
                       </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">No activity recorded.</div>
                  )}
                </div>

                {/* 2. TODAY */}
                <div className="p-5 bg-white relative">
                   {ctx.activeTask && (
                       <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500"></div>
                   )}
                   <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                     <ArrowRight className="w-3 h-3" />
                     <span>Today's Status</span>
                   </div>
                   
                   {ctx.activeTask ? (
                     <div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                          {ctx.activeTask.title}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                           State: <span className="text-indigo-600 font-semibold">DOING</span>
                        </div>
                        {ctx.isStale && (
                           <div className="flex items-start bg-orange-50 text-orange-700 p-2 rounded text-xs">
                              <AlertTriangle className="w-3 h-3 mr-2 mt-0.5" />
                              Stalled > 24h. Move to Refine?
                           </div>
                        )}
                        {ctx.activeTask.nextAction && (
                           <div className="mt-2 text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100">
                              👉 Next: {ctx.activeTask.nextAction}
                           </div>
                        )}
                     </div>
                   ) : ctx.readyTasks.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-600">
                           <span className="font-bold text-gray-800">{ctx.readyTasks.length}</span> tasks ready to pull.
                        </div>
                        <div className="mt-2 space-y-1">
                           {ctx.readyTasks.slice(0, 2).map(t => (
                              <div key={t.id} className="text-xs text-gray-500 truncate">• {t.title}</div>
                           ))}
                        </div>
                      </div>
                   ) : (
                     <div className="text-sm text-gray-400 italic">Inbox empty. Capture tasks?</div>
                   )}
                </div>

                {/* 3. TOMORROW */}
                <div className="p-5 bg-gray-50/50">
                   <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     <Calendar className="w-3 h-3" />
                     <span>Tomorrow's Plan</span>
                   </div>
                   
                   {ctx.isPlannedAnchor ? (
                      <div className="bg-white border border-indigo-200 shadow-sm rounded-lg p-3">
                         <div className="text-xs font-bold text-indigo-600 uppercase mb-1">⚓ Primary Anchor</div>
                         <div className="text-sm font-medium text-gray-800">Deep Work Scheduled</div>
                      </div>
                   ) : ctx.isPlannedSprint ? (
                      <div className="bg-white border border-emerald-200 shadow-sm rounded-lg p-3">
                         <div className="text-xs font-bold text-emerald-600 uppercase mb-1">⚡ Micro-Sprint</div>
                         <div className="text-sm font-medium text-gray-800">Maintenance (20m)</div>
                      </div>
                   ) : ctx.isPlannedRecovery ? (
                      <div className="bg-white border border-purple-200 shadow-sm rounded-lg p-3">
                         <div className="text-xs font-bold text-purple-600 uppercase mb-1">☕ Recovery</div>
                         <div className="text-sm font-medium text-gray-800">Recharge Block</div>
                      </div>
                   ) : (
                      <div className="text-sm text-gray-400 italic">Not in the plan yet.</div>
                   )}
                </div>

              </div>
            </div>
          );
        })}
        
        {activeBuckets.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                No active context found. Start a session or add tasks to see the standup view.
            </div>
        )}
      </div>
    </div>
  );
};

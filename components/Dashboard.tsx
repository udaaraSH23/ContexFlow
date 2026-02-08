import React, { useState } from 'react';
import { AppData, MindDumpItem } from '../types';
import { DailyBrief } from './DailyBrief';
import { Clock, Battery, Activity, ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, StickyNote, History } from 'lucide-react';
import { format, subDays, addDays, isSameDay } from 'date-fns';

interface DashboardProps {
  data: AppData;
  onStartSession: (bucketId: string, type: 'Anchor' | 'Sprint' | 'Recovery', taskId?: string) => void;
  onAddMindDump: (text: string) => void;
  onUpdateMindDump: (item: MindDumpItem) => void;
  onConvertMindDump: (dumpId: string, bucketId: string, text: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    data, onStartSession, onAddMindDump, onUpdateMindDump, onConvertMindDump 
}) => {
  const [view, setView] = useState<'yesterday' | 'today' | 'tomorrow'>('today');

  // --- DATA PREP ---
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  // Yesterday Data
  const yesterdaySessions = data.sessions.filter(s => isSameDay(s.startedAt, yesterday));
  const yesterdayTotalMin = yesterdaySessions.reduce((acc, s) => acc + s.actualMin, 0);
  const lastSessionYesterday = yesterdaySessions.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0))[0];
  const yesterdayCompletedTasks = data.tasks.filter(t => t.state === 'Done' && isSameDay(t.updatedAt, yesterday));

  // Tomorrow Data
  const tomorrowKey = format(tomorrow, 'yyyy-MM-dd');
  const tomorrowPlan = data.plans.find(p => p.type === 'Nightly' && p.dateKey === tomorrowKey);
  const tomorrowAnchor = tomorrowPlan?.anchorBucketId ? data.buckets.find(b => b.id === tomorrowPlan.anchorBucketId) : null;
  const tomorrowAnchorTask = tomorrowPlan?.anchorTaskId ? data.tasks.find(t => t.id === tomorrowPlan.anchorTaskId) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. The Time Bridge Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button 
                onClick={() => setView('yesterday')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${view === 'yesterday' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <History className="w-4 h-4 mr-2" />
                Yesterday
            </button>
            <button 
                onClick={() => setView('today')}
                className={`px-8 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${view === 'today' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Today
            </button>
            <button 
                onClick={() => setView('tomorrow')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${view === 'tomorrow' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Tomorrow
                <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
      </div>

      {/* 2. VIEW: YESTERDAY (Review & Handoff) */}
      {view === 'yesterday' && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg"><History className="w-6 h-6 text-gray-600" /></div>
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">Yesterday's Context</h2>
                          <p className="text-gray-500">Review what you closed out to bridge the gap.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Deep Work</div>
                          <div className="text-2xl font-mono font-bold text-gray-800">{Math.floor(yesterdayTotalMin / 60)}h {yesterdayTotalMin % 60}m</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Sessions</div>
                           <div className="text-2xl font-mono font-bold text-gray-800">{yesterdaySessions.length}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Completed</div>
                           <div className="text-2xl font-mono font-bold text-gray-800">{yesterdayCompletedTasks.length} <span className="text-sm font-normal text-gray-400">tasks</span></div>
                      </div>
                  </div>

                  {/* The Handover Note */}
                  {lastSessionYesterday?.closeoutNext ? (
                      <div className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-xl">
                          <h3 className="font-bold text-indigo-900 flex items-center mb-3">
                              <StickyNote className="w-5 h-5 mr-2" />
                              Last Closeout Note
                          </h3>
                          <div className="space-y-4">
                              <div>
                                  <p className="text-xs font-bold text-indigo-400 uppercase">You finished</p>
                                  <p className="text-indigo-800 font-medium text-lg">"{lastSessionYesterday.closeoutFinished}"</p>
                              </div>
                              <div className="flex items-start p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                  <ArrowRight className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                                  <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase">Next Step Defined</p>
                                      <p className="text-gray-800 font-medium">{lastSessionYesterday.closeoutNext}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                          No session closeout data found for yesterday.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 3. VIEW: TODAY (Execution) */}
      {view === 'today' && (
          <div className="animate-fade-in">
             <DailyBrief 
                data={data} 
                onStartSession={onStartSession}
                onAddMindDump={onAddMindDump}
                onUpdateMindDump={onUpdateMindDump}
                onConvertMindDump={onConvertMindDump}
              />
          </div>
      )}

      {/* 4. VIEW: TOMORROW (Staging) */}
      {view === 'tomorrow' && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg"><CalendarDays className="w-6 h-6 text-indigo-600" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Tomorrow's Staging</h2>
                            <p className="text-gray-500">Plan is {tomorrowPlan ? 'Ready' : 'Pending'}</p>
                        </div>
                      </div>
                      {!tomorrowPlan && (
                          <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-bold">
                              No Nightly Plan yet
                          </div>
                      )}
                  </div>

                  {tomorrowPlan ? (
                      <div className="space-y-6">
                          {/* Anchor Preview */}
                          <div className="p-5 border border-indigo-100 rounded-xl bg-indigo-50">
                              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Primary Anchor</span>
                              <div className="mt-2 flex items-center">
                                  {tomorrowAnchor ? (
                                      <>
                                        <div className="w-3 h-3 rounded-full bg-indigo-600 mr-3"></div>
                                        <span className="text-lg font-bold text-gray-800">{tomorrowAnchor.name}</span>
                                        {tomorrowAnchorTask && <span className="ml-2 text-gray-500"> — {tomorrowAnchorTask.title}</span>}
                                      </>
                                  ) : <span className="text-gray-400 italic">Not selected</span>}
                              </div>
                          </div>

                          {/* Sprints Preview */}
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 border border-gray-100 rounded-xl">
                                  <span className="text-xs font-bold text-gray-400 uppercase">Micro-Sprints</span>
                                  <div className="mt-2 space-y-1">
                                      {tomorrowPlan.sprintBucketIds?.map(bid => {
                                          const b = data.buckets.find(bucket => bucket.id === bid);
                                          return b ? <div key={bid} className="font-medium text-gray-700">• {b.name}</div> : null;
                                      })}
                                      {(!tomorrowPlan.sprintBucketIds || tomorrowPlan.sprintBucketIds.length === 0) && <span className="text-gray-400 italic text-sm">None selected</span>}
                                  </div>
                              </div>
                              <div className="p-4 border border-gray-100 rounded-xl">
                                  <span className="text-xs font-bold text-gray-400 uppercase">Recovery</span>
                                  <div className="mt-2 font-medium text-gray-700">
                                      {data.buckets.find(b => b.id === tomorrowPlan.recoveryBucketId)?.name || <span className="text-gray-400 italic font-normal">Not set</span>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-12">
                          <p className="text-gray-500 mb-4">You haven't planned tomorrow yet.</p>
                          <p className="text-sm text-gray-400">Go to the <strong>Planning</strong> tab to create your strategy.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

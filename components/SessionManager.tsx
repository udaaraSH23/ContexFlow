import React, { useState, useEffect } from 'react';
import { Session, Bucket, Task, Workspace } from '../types';
import { Play, Square, Save, ExternalLink, CheckSquare, Battery, BatteryCharging, Clock, ArrowRightCircle } from 'lucide-react';

interface SessionManagerProps {
  bucket: Bucket;
  workspace: Workspace;
  task?: Task;
  previousSession?: Session; // Added: To show re-entry context
  initialType: 'Anchor' | 'Sprint' | 'Recovery';
  onComplete: (sessionData: Partial<Session>) => void;
  onCancel: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ 
  bucket, workspace, task, previousSession, initialType, onComplete, onCancel 
}) => {
  const [step, setStep] = useState<'PREP' | 'ACTIVE' | 'CLOSEOUT'>('PREP');
  const [energy, setEnergy] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Closeout Form State
  const [closeoutData, setCloseoutData] = useState({
      finished: '',
      next: '',
      firstAction: '',
      energyAfter: 3
  });

  useEffect(() => {
    let interval: any;
    if (step === 'ACTIVE' && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isPaused]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStep('ACTIVE');
  };

  const handleStop = () => {
    setIsPaused(true);
    if(confirm("Ready to end this session?")) {
        setStep('CLOSEOUT');
    } else {
        setIsPaused(false);
    }
  };

  const submitCloseout = () => {
    onComplete({
        bucketId: bucket.id,
        taskId: task?.id,
        type: initialType,
        plannedMin: 0, // In a real app we'd set this before
        actualMin: Math.floor(elapsedSeconds / 60),
        energyBefore: energy,
        energyAfter: closeoutData.energyAfter,
        closeoutFinished: closeoutData.finished,
        closeoutNext: closeoutData.next,
        closeoutFirstAction: closeoutData.firstAction,
        startedAt: Date.now() - (elapsedSeconds * 1000), // Approx
        endedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 ${step === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'bg-gray-50 border-b'}`}>
          <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold flex items-center gap-2">
                 {step === 'ACTIVE' && <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"/>}
                 {bucket.name} <span className="opacity-70 font-light">| {initialType}</span>
               </h2>
               {task && <p className={`mt-1 text-sm ${step === 'ACTIVE' ? 'text-indigo-100' : 'text-gray-500'}`}>Working on: {task.title}</p>}
            </div>
            {step === 'ACTIVE' && (
                <div className="text-4xl font-mono font-bold tracking-widest">
                    {formatTime(elapsedSeconds)}
                </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* PREP STEP */}
          {step === 'PREP' && (
            <div className="space-y-8">
               
               {/* RE-ENTRY CARD (New Feature) */}
               {previousSession && previousSession.closeoutFirstAction && (
                   <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg shadow-sm animate-fade-in-up">
                       <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-2 flex items-center">
                           <ArrowRightCircle className="w-4 h-4 mr-2" />
                           Pick up where you left off
                       </h3>
                       <div className="text-gray-700">
                           <span className="font-semibold text-indigo-700">Last Action:</span> You finished "{previousSession.closeoutFinished}".
                       </div>
                       <div className="text-gray-900 text-lg font-medium mt-2 bg-white p-3 rounded border border-indigo-100">
                           👉 Do this first: {previousSession.closeoutFirstAction}
                       </div>
                   </div>
               )}

               {/* Workspace Auto-Open */}
               <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                 <h3 className="font-bold text-blue-800 mb-3 flex items-center"><ExternalLink className="w-4 h-4 mr-2"/> Workspace Loaded</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase mb-2">Checklist</p>
                        <ul className="space-y-2">
                            {workspace.startupChecklist.map((item, i) => (
                                <li key={i} className="flex items-center text-sm text-blue-900">
                                    <CheckSquare className="w-4 h-4 mr-2 text-blue-500 opacity-50" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase mb-2">Tools</p>
                        <div className="flex flex-wrap gap-2">
                            {workspace.links.length === 0 ? <span className="text-sm italic text-gray-500">No links configured</span> : 
                            workspace.links.map(l => (
                                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white rounded shadow-sm text-sm text-blue-700 hover:bg-blue-100">
                                    {l.label} ↗
                                </a>
                            ))}
                        </div>
                    </div>
                 </div>
               </div>

               {/* Energy Check */}
               <div>
                  <label className="block text-center text-gray-600 font-medium mb-4">Current Energy Level</label>
                  <div className="flex justify-center items-center space-x-6">
                    <Battery className="w-6 h-6 text-gray-400" />
                    <input 
                      type="range" min="1" max="5" step="1" 
                      value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-2xl font-bold text-indigo-600">{energy}</span>
                  </div>
               </div>

               <div className="flex justify-center space-x-4 pt-4">
                  <button onClick={onCancel} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={handleStart} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all">
                    Start Session
                  </button>
               </div>
            </div>
          )}

          {/* ACTIVE STEP */}
          {step === 'ACTIVE' && (
            <div className="flex flex-col items-center justify-center h-full space-y-12">
                <div className="text-center space-y-4 max-w-md">
                    <h3 className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Current Focus</h3>
                    {task ? (
                        <div>
                             <p className="text-2xl font-bold text-gray-800">{task.title}</p>
                             <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-left">
                                <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Success Criteria</p>
                                <p className="text-gray-800">{task.doneDefinition}</p>
                             </div>
                             <div className="mt-2 text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Next Action</p>
                                <p className="text-gray-600">{task.nextAction}</p>
                             </div>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">General {bucket.name} Work</p>
                    )}
                    
                    {/* Reminder of Previous First Action if applicable */}
                    {previousSession?.closeoutFirstAction && (
                        <div className="mt-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100 inline-block text-left max-w-sm">
                            <span className="text-xs font-bold text-indigo-400 uppercase">Context from last time</span>
                            <p className="text-indigo-800 text-sm italic">"Start by: {previousSession.closeoutFirstAction}"</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleStop}
                    className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50 hover:bg-red-100 border-4 border-red-100 transition-all"
                >
                    <Square className="w-8 h-8 text-red-500 fill-current" />
                    <span className="absolute -bottom-8 text-sm font-medium text-gray-400 group-hover:text-red-500">Stop</span>
                </button>
            </div>
          )}

          {/* CLOSEOUT STEP */}
          {step === 'CLOSEOUT' && (
             <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">Session Complete</h3>
                    <p className="text-gray-500">Fast re-entry protocol initiated.</p>
                </div>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What did you finish?</label>
                        <input 
                             className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                             placeholder="Be specific..."
                             value={closeoutData.finished}
                             onChange={e => setCloseoutData({...closeoutData, finished: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What is the very next step?</label>
                        <input 
                             className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                             placeholder="The first thing to do next time..."
                             value={closeoutData.next}
                             onChange={e => setCloseoutData({...closeoutData, next: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First specific action to take next session?</label>
                        <input 
                             className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                             placeholder="e.g. Open file X and read line 40"
                             value={closeoutData.firstAction}
                             onChange={e => setCloseoutData({...closeoutData, firstAction: e.target.value})}
                        />
                    </div>
                </div>

                <div className="border-t pt-6">
                    <label className="block text-center text-gray-600 font-medium mb-4">Ending Energy Level</label>
                    <div className="flex justify-center items-center space-x-6">
                        <BatteryCharging className="w-6 h-6 text-gray-400" />
                        <input 
                        type="range" min="1" max="5" step="1" 
                        value={closeoutData.energyAfter} onChange={(e) => setCloseoutData({...closeoutData, energyAfter: parseInt(e.target.value)})}
                        className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <span className="text-2xl font-bold text-green-600">{closeoutData.energyAfter}</span>
                    </div>
                </div>

                <button onClick={submitCloseout} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" /> Save & Close
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

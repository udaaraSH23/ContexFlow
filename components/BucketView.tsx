import React, { useState } from 'react';
import { AppData, Bucket, Task, TaskState, BucketCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Plus, CheckCircle2, Circle, AlertCircle, Play, Timer, AlertTriangle } from 'lucide-react';

interface BucketViewProps {
  data: AppData;
  onUpdateTask: (task: Task) => void;
  onCreateTask: (task: Task) => void;
  onStartSession: (bucketId: string, taskId?: string) => void;
  onOpenWorkspace: (bucketId: string) => void;
}

export const BucketView: React.FC<BucketViewProps> = ({ 
  data, onUpdateTask, onCreateTask, onStartSession, onOpenWorkspace 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BucketCategory | 'All'>('All');
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group buckets by category for display
  const categories: BucketCategory[] = ['Main Work', 'Supporting Habits', 'Self-Care & Fun'];
  
  const filteredBuckets = selectedCategory === 'All' 
    ? data.buckets 
    : data.buckets.filter(b => b.category === selectedCategory);

  const getTasksForBucket = (bucketId: string) => data.tasks.filter(t => t.bucketId === bucketId && t.state !== 'Done');

  // Stats Logic
  const getLastSession = (bucketId: string) => {
    return data.sessions
      .filter(s => s.bucketId === bucketId)
      .sort((a, b) => b.startedAt - a.startedAt)[0];
  };

  const isStale = (bucketId: string) => {
      const last = getLastSession(bucketId);
      if (!last) return false; 
      const diffHours = (Date.now() - last.startedAt) / (1000 * 60 * 60);
      return diffHours > 48;
  };

  const isResume = (bucketId: string) => {
      // Is this the absolute most recent bucket worked on?
      const mostRecentSession = data.sessions.sort((a, b) => b.startedAt - a.startedAt)[0];
      return mostRecentSession && mostRecentSession.bucketId === bucketId;
  };

  const openNewTaskModal = (bucketId: string) => {
    setEditingTask({ bucketId, state: 'Inbox', title: '' });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask({ ...task });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!editingTask || !editingTask.title || !editingTask.bucketId) return;

    // Readiness Rule Validation
    if (editingTask.state === 'Ready' || editingTask.state === 'Doing') {
      if (!editingTask.nextAction || !editingTask.doneDefinition) {
        setErrorMsg("To mark as Ready or Doing, you MUST define the Next Action and Done Definition.");
        return;
      }
    }

    const taskToSave = {
        ...editingTask,
        id: editingTask.id || `t-${Date.now()}`,
        createdAt: editingTask.createdAt || Date.now(),
        updatedAt: Date.now(),
    } as Task;

    if (editingTask.id) {
        onUpdateTask(taskToSave);
    } else {
        onCreateTask(taskToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button 
           onClick={() => setSelectedCategory('All')}
           className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}
        >
          All Areas
        </button>
        {categories.map(cat => (
           <button 
           key={cat}
           onClick={() => setSelectedCategory(cat)}
           className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}
        >
          {cat}
        </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBuckets.map(bucket => {
            const bucketTasks = getTasksForBucket(bucket.id);
            const readyCount = bucketTasks.filter(t => t.state === 'Ready').length;
            const stale = isStale(bucket.id);
            const resume = isResume(bucket.id);
            
            return (
                <div key={bucket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden">
                    {/* Badges */}
                    {resume && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                            RESUME
                        </div>
                    )}
                    {stale && !resume && (
                        <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center">
                            STALE
                        </div>
                    )}

                    {/* Header */}
                    <div className={`p-4 border-b ${CATEGORY_COLORS[bucket.category]} bg-opacity-10 rounded-t-xl flex justify-between items-center`}>
                        <h3 className="font-bold text-gray-800 pr-8">{bucket.name}</h3>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => onOpenWorkspace(bucket.id)}
                                className="text-xs bg-white bg-opacity-50 hover:bg-opacity-100 px-2 py-1 rounded border border-gray-200 transition-all"
                            >
                                Workspace
                            </button>
                            <button 
                                onClick={() => onStartSession(bucket.id)}
                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-all flex items-center"
                            >
                                <Play className="w-3 h-3 mr-1" /> Start
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="px-4 py-2 bg-gray-50 text-xs flex justify-between text-gray-500">
                        <span>{readyCount} Ready</span>
                        <span>{bucketTasks.length - readyCount} Refine</span>
                    </div>

                    {/* Task List */}
                    <div className="flex-1 p-4 space-y-3 min-h-[200px]">
                        {bucketTasks.length === 0 ? (
                             <div className="text-center py-8 text-gray-400 text-sm">
                                No active tasks.
                                <br/>
                                <button 
                                    onClick={() => openNewTaskModal(bucket.id)}
                                    className="text-indigo-600 font-medium hover:underline mt-1"
                                >
                                    Add one?
                                </button>
                             </div>
                        ) : (
                            bucketTasks.sort((a,b) => (a.state === 'Ready' ? -1 : 1)).map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => openEditTaskModal(task)}
                                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow relative group ${task.state === 'Ready' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm text-gray-800">{task.title}</h4>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                            task.state === 'Ready' ? 'bg-green-200 text-green-800' : 
                                            task.state === 'Inbox' ? 'bg-gray-200 text-gray-700' :
                                            task.state === 'Refine' ? 'bg-orange-100 text-orange-700' :
                                            task.state === 'Doing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100'
                                        }`}>
                                            {task.state}
                                        </span>
                                    </div>
                                    {task.nextAction && (
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">👉 {task.nextAction}</p>
                                    )}
                                </div>
                            ))
                        )}
                         <button 
                            onClick={() => openNewTaskModal(bucket.id)}
                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Task
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Task Modal */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">
                        {editingTask.id ? 'Edit Task' : 'New Task'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <div className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input 
                            value={editingTask.title} 
                            onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="e.g. Write Introduction for Thesis"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <select 
                                value={editingTask.state}
                                onChange={e => setEditingTask({...editingTask, state: e.target.value as TaskState})}
                                className="w-full p-2 border rounded outline-none"
                            >
                                <option value="Inbox">Inbox</option>
                                <option value="Refine">Refine</option>
                                <option value="Ready">Ready</option>
                                <option value="Doing">Doing</option>
                                <option value="Parked">Parked</option>
                            </select>
                        </div>
                        {/* Hidden bucket select if strictly editing within bucket, but needed if new */}
                    </div>

                    {/* Readiness Fields - Highlighted */}
                    <div className={`p-4 rounded-lg border-2 ${editingTask.state === 'Ready' || editingTask.state === 'Doing' ? 'border-indigo-100 bg-indigo-50' : 'border-gray-100'}`}>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Readiness Requirements</h4>
                         
                         <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Next Action (Concrete Step)</label>
                                <input 
                                    value={editingTask.nextAction || ''} 
                                    onChange={e => setEditingTask({...editingTask, nextAction: e.target.value})}
                                    className="w-full p-2 border rounded outline-none text-sm" 
                                    placeholder="e.g. Open file 'Thesis.docx' and write 1 paragraph"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Done Definition (Exit Criteria)</label>
                                <input 
                                    value={editingTask.doneDefinition || ''} 
                                    onChange={e => setEditingTask({...editingTask, doneDefinition: e.target.value})}
                                    className="w-full p-2 border rounded outline-none text-sm" 
                                    placeholder="e.g. Introduction drafted and spell-checked"
                                />
                            </div>
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Links</label>
                        <textarea 
                             value={editingTask.notes || ''} 
                             onChange={e => setEditingTask({...editingTask, notes: e.target.value})}
                             className="w-full p-2 border rounded outline-none text-sm h-20"
                             placeholder="Paste relevant links or thoughts here..."
                        />
                    </div>
                </div>
                
                <div className="p-4 border-t flex justify-end space-x-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={handleSaveTask} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">Save Task</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

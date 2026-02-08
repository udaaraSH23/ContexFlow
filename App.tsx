import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BucketView } from './components/BucketView';
import { SessionManager } from './components/SessionManager';
import { WorkspaceModal } from './components/WorkspaceModal';
import { PlanningView } from './components/PlanningView';
import { StandupView } from './components/StandupView';
import { loadData, saveData } from './services/storage';
import { AppData, Task, Session, Workspace, Plan, MindDumpItem } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppData>(loadData());
  
  // Session State
  const [activeSessionBucketId, setActiveSessionBucketId] = useState<string | null>(null);
  const [activeSessionTaskId, setActiveSessionTaskId] = useState<string | undefined>(undefined);
  const [activeSessionType, setActiveSessionType] = useState<'Anchor'|'Sprint'|'Recovery'>('Anchor');

  // Workspace Modal State
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);

  // Initialize data defaults if missing (for migration)
  useEffect(() => {
      let updated = false;
      const newData = { ...data };
      if (!newData.goals) { newData.goals = []; newData.milestones = []; updated = true; }
      if (!newData.plans) { newData.plans = []; updated = true; }
      if (!newData.mindDumpItems) { newData.mindDumpItems = []; updated = true; }
      
      if(updated) setData(newData);
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Task Actions
  const handleUpdateTask = (task: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
    }));
  };

  const handleCreateTask = (task: Task) => {
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
  };

  // Plan Actions
  const handleSavePlan = (plan: Plan) => {
      setData(prev => {
          const existingIdx = prev.plans.findIndex(p => p.id === plan.id);
          const newPlans = [...prev.plans];
          if(existingIdx >= 0) {
              newPlans[existingIdx] = plan;
          } else {
              newPlans.push(plan);
          }
          return { ...prev, plans: newPlans };
      });
  };

  // Mind Dump Actions
  const handleAddMindDump = (text: string) => {
      const newItem: MindDumpItem = {
          id: `dump-${Date.now()}`,
          text,
          createdAt: Date.now(),
          status: 'inbox'
      };
      setData(prev => ({
          ...prev,
          mindDumpItems: [newItem, ...prev.mindDumpItems]
      }));
  };

  const handleUpdateMindDump = (item: MindDumpItem) => {
      setData(prev => ({
          ...prev,
          mindDumpItems: prev.mindDumpItems.map(i => i.id === item.id ? item : i)
      }));
  };

  const handleConvertMindDumpToTask = (dumpId: string, bucketId: string, text: string) => {
      // 1. Create Task
      const newTask: Task = {
          id: `t-${Date.now()}`,
          bucketId,
          title: text,
          state: 'Inbox',
          createdAt: Date.now(),
          updatedAt: Date.now()
      };
      
      // 2. Archive Dump Item
      setData(prev => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
          mindDumpItems: prev.mindDumpItems.map(i => i.id === dumpId ? { ...i, status: 'converted', convertedTaskId: newTask.id } as MindDumpItem : i)
      }));
  };

  // Session Actions
  const startSession = (bucketId: string, taskId?: string) => {
      // Default to Anchor if not specified by dashboard
      setActiveSessionType('Anchor'); 
      setActiveSessionBucketId(bucketId);
      setActiveSessionTaskId(taskId);
  };

  const startSessionWithType = (bucketId: string, type: 'Anchor' | 'Sprint' | 'Recovery', taskId?: string) => {
      setActiveSessionType(type);
      setActiveSessionBucketId(bucketId);
      setActiveSessionTaskId(taskId); // General bucket work usually, but supports specific task now
  };

  const handleCompleteSession = (sessionPartial: Partial<Session>) => {
      const newSession: Session = {
          id: `sess-${Date.now()}`,
          ...sessionPartial
      } as Session;
      
      setData(prev => ({
          ...prev,
          sessions: [...prev.sessions, newSession]
      }));
      
      setActiveSessionBucketId(null);
      setActiveSessionTaskId(undefined);
  };

  // Workspace Actions
  const openWorkspaceEditor = (bucketId: string) => {
      const ws = data.workspaces.find(w => w.bucketId === bucketId);
      if(ws) setEditingWorkspaceId(ws.id);
  };

  const saveWorkspace = (ws: Workspace) => {
      setData(prev => ({
          ...prev,
          workspaces: prev.workspaces.map(w => w.id === ws.id ? ws : w)
      }));
      setEditingWorkspaceId(null);
  };

  // Helper to find last session for the active bucket to pass to Manager
  const getLastSessionForActiveBucket = () => {
    if (!activeSessionBucketId) return undefined;
    return data.sessions
      .filter(s => s.bucketId === activeSessionBucketId)
      .sort((a, b) => b.startedAt - a.startedAt)[0];
  };

  // Render Helpers
  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <Dashboard 
            data={data} 
            onStartSession={startSessionWithType} 
            onAddMindDump={handleAddMindDump}
            onUpdateMindDump={handleUpdateMindDump}
            onConvertMindDump={handleConvertMindDumpToTask}
        />
      );
    }
    if (activeTab === 'standup') {
        return <StandupView data={data} onStartSession={startSession} />;
    }
    if (activeTab === 'planning') {
        return <PlanningView data={data} onSavePlan={handleSavePlan} />;
    }
    if (activeTab === 'buckets') {
      return (
        <BucketView 
            data={data} 
            onCreateTask={handleCreateTask} 
            onUpdateTask={handleUpdateTask}
            onStartSession={(bid, tid) => startSession(bid, tid)}
            onOpenWorkspace={openWorkspaceEditor}
        />
      );
    }
    return <div className="p-8 text-gray-500">Analytics coming in Phase 2</div>;
  };

  return (
    <>
        {/* Main Layout */}
        <Layout 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onQuickCapture={handleAddMindDump}
        >
          {renderContent()}
        </Layout>

        {/* Overlays */}
        
        {/* Active Session Mode */}
        {activeSessionBucketId && (
            <SessionManager 
                bucket={data.buckets.find(b => b.id === activeSessionBucketId)!}
                workspace={data.workspaces.find(w => w.bucketId === activeSessionBucketId)!}
                task={activeSessionTaskId ? data.tasks.find(t => t.id === activeSessionTaskId) : undefined}
                previousSession={getLastSessionForActiveBucket()}
                initialType={activeSessionType}
                onComplete={handleCompleteSession}
                onCancel={() => setActiveSessionBucketId(null)}
            />
        )}

        {/* Workspace Editor */}
        {editingWorkspaceId && (
            <WorkspaceModal 
                workspace={data.workspaces.find(w => w.id === editingWorkspaceId)!}
                onSave={saveWorkspace}
                onClose={() => setEditingWorkspaceId(null)}
            />
        )}
    </>
  );
}

export default App;

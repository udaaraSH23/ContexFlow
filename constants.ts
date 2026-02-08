import { AppData, BucketCategory } from './types';

export const INITIAL_BUCKETS = [
  // Main Work
  { id: 'b1', name: 'Academic', category: 'Main Work' as BucketCategory, color: 'blue', icon: 'book' },
  { id: 'b2', name: 'Skill Learning', category: 'Main Work' as BucketCategory, color: 'indigo', icon: 'code' },
  { id: 'b3', name: 'Earning Money', category: 'Main Work' as BucketCategory, color: 'emerald', icon: 'dollar-sign' },
  
  // Supporting
  { id: 'b4', name: 'Time Mgmt & Planning', category: 'Supporting Habits' as BucketCategory, color: 'slate', icon: 'calendar' },
  { id: 'b5', name: 'Crisis Planning', category: 'Supporting Habits' as BucketCategory, color: 'orange', icon: 'alert-triangle' },
  
  // Self-Care
  { id: 'b6', name: 'Mental & Emotional', category: 'Self-Care & Fun' as BucketCategory, color: 'purple', icon: 'heart' },
  { id: 'b7', name: 'Personal Growth', category: 'Self-Care & Fun' as BucketCategory, color: 'teal', icon: 'sprout' },
  { id: 'b8', name: 'Fun & Relaxation', category: 'Self-Care & Fun' as BucketCategory, color: 'pink', icon: 'smile' },
  { id: 'b9', name: 'Social Life', category: 'Self-Care & Fun' as BucketCategory, color: 'rose', icon: 'users' },
];

export const MOCK_DATA: AppData = {
  buckets: INITIAL_BUCKETS,
  workspaces: INITIAL_BUCKETS.map(b => ({
    id: `ws-${b.id}`,
    bucketId: b.id,
    title: `${b.name} Workspace`,
    links: [],
    startupChecklist: ['Clear desk', 'Open necessary apps', 'Check notifications (2m limit)']
  })),
  goals: [
    { id: 'g1', title: 'Master React Ecosystem', description: 'Become a senior frontend engineer' }
  ],
  milestones: [
    { id: 'm1', goalId: 'g1', title: 'Understand Advanced Hooks', isCompleted: false },
    { id: 'm2', goalId: 'g1', title: 'Build a complex Fullstack App', isCompleted: false }
  ],
  tasks: [
    {
      id: 't1',
      bucketId: 'b2',
      title: 'Learn React Hooks',
      state: 'Ready',
      nextAction: 'Read official docs on useReducer',
      doneDefinition: 'Create a counter app using useReducer',
      milestoneId: 'm1',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  sessions: [],
  plans: [],
  mindDumpItems: []
};

export const CATEGORY_COLORS: Record<BucketCategory, string> = {
  'Main Work': 'bg-blue-50 text-blue-700 border-blue-200',
  'Supporting Habits': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Self-Care & Fun': 'bg-rose-50 text-rose-700 border-rose-200',
};

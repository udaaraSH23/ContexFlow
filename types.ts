export type BucketCategory = 'Main Work' | 'Supporting Habits' | 'Self-Care & Fun';

export type TaskState = 'Inbox' | 'Refine' | 'Ready' | 'Doing' | 'Done' | 'Parked';

export interface Bucket {
  id: string;
  name: string;
  category: BucketCategory;
  color: string;
  icon: string;
}

export interface WorkspaceLink {
  id: string;
  label: string;
  url: string;
}

export interface Workspace {
  id: string;
  bucketId: string;
  title: string;
  links: WorkspaceLink[];
  startupChecklist: string[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  bucketId: string;
  title: string;
  state: TaskState;
  nextAction?: string; // Required for Ready/Doing
  doneDefinition?: string; // Required for Ready/Doing
  links?: string[]; // simplified for MVP
  notes?: string;
  milestoneId?: string; // Optional link to milestone
  createdAt: number;
  updatedAt: number;
}

export type SessionType = 'Anchor' | 'Sprint' | 'Recovery';

export interface Session {
  id: string;
  bucketId: string;
  taskId?: string; // Optional, can run a session on a bucket generally
  type: SessionType;
  plannedMin: number;
  actualMin: number;
  energyBefore: number; // 1-5
  energyAfter?: number; // 1-5
  closeoutFinished?: string;
  closeoutNext?: string;
  closeoutFirstAction?: string;
  startedAt: number;
  endedAt?: number;
}

export type PlanType = 'Nightly' | 'Weekly';

export interface Plan {
  id: string;
  dateKey: string; // "YYYY-MM-DD" for nightly, "YYYY-W##" for weekly
  type: PlanType;
  anchorBucketId?: string;
  anchorTaskId?: string;
  sprintBucketIds?: string[];
  recoveryBucketId?: string;
  outcomes?: string[]; // For weekly must-win outcomes
  createdAt: number;
}

export type MindDumpStatus = 'inbox' | 'converted' | 'archived';

export interface MindDumpItem {
  id: string;
  text: string;
  createdAt: number;
  status: MindDumpStatus;
  bucketId?: string; // Optional if categorized immediately
}

export interface AppData {
  buckets: Bucket[];
  workspaces: Workspace[];
  tasks: Task[];
  sessions: Session[];
  goals: Goal[];
  milestones: Milestone[];
  plans: Plan[];
  mindDumpItems: MindDumpItem[];
}

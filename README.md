# ContextFlow

**ContextFlow** is a productivity application designed to reduce context-switching costs and prevent burnout. Unlike traditional task managers that just list "what to do," ContextFlow focuses on **how you work**, ensuring every task is ready to start and every session ends with a clear bridge to the next.

## 🎯 Product Goal

Reduce the cognitive load of starting work ("Context Initialization Cost") and prevent exhaustion crashes by:
1.  **Forcing Clarity**: No ambiguous tasks allowed in the "Ready" state.
2.  **Guiding Transitions**: Structured warm-ups and closeouts.
3.  **Balancing Energy**: Alternating between Deep Work (Anchors) and Maintenance (Sprints), with mandatory Recovery.

## 🧠 Core Concepts

### 1. Buckets (Life Areas)
Everything you do falls into a **Bucket**. Buckets are grouped into three categories:
*   **Main Work**: Deep work areas (e.g., Academic, Coding, Business).
*   **Supporting Habits**: Logistics (e.g., Time Management, Finance).
*   **Self-Care & Fun**: Recovery areas (e.g., Health, Social, Gaming).

### 2. The Readiness Rule
A task cannot be moved to **Ready** unless it has:
*   **Next Action**: A specific, concrete first step (e.g., "Open index.tsx and add import").
*   **Done Definition**: A clear exit criteria (e.g., "The modal closes when clicked").

### 3. Time Bridging (Anchor & Sprints)
Instead of trying to do everything every day, ContextFlow enforces a nightly strategy:
*   **Anchor**: One primary deep work session (60-180m).
*   **Micro-Sprints**: 1-2 short sessions (20m) to keep other buckets "warm" without draining energy.
*   **Recovery**: A mandatory block to reset.

### 4. Session Closeout
When you stop a session, you don't just close the tab. The app forces a **Closeout Protocol**:
*   What did you finish?
*   What is the very next step?
*   **Context Hook**: The exact first action to take next time (displayed prominently when you return).

## ✨ Key Features

### 📊 Dashboard (Time Bridge)
A 3-day view to maintain continuity:
*   **Yesterday**: Review what was completed and check handover notes.
*   **Today**: Execute the daily plan via the **Daily Brief**.
*   **Tomorrow**: Stage the Nightly Plan for the next day.

### 🚀 Daily Brief
A "Mission Control" interface that acts as your executive assistant.
*   **Narrative Header**: Contextual greeting based on yesterday's performance.
*   **Hero Card**: Focuses solely on the **Anchor** task's "Next Action".
*   **Stale Detection**: Warns if a task has been stuck in "Doing" for >24 hours.

### 🧍 Daily Standup
A matrix view resembling a team standup, but for your own life areas.
*   **Yesterday**: What was logged?
*   **Today**: What is active?
*   **Tomorrow**: Is it in the plan?

### 📝 Split-Screen Planning
An interactive planning interface:
*   **Left**: Context Pool (Open Tasks, Mind Dump items).
*   **Right**: Tomorrow's slots (Anchor, Sprint, Recovery).
*   **Action**: Click items in the pool to assign them to slots.

### 🧠 Mind Dump
A quick capture inbox to offload mental loops.
*   **Capture**: Press `Esc` anywhere or use the widget to type thoughts.
*   **Convert**: Turn thoughts into tasks assigned to specific buckets.
*   **Loop Detection**: Highlights tasks that have been ignored for too long.

## 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Date Management**: date-fns
*   **Persistence**: LocalStorage (MVP)

## 🚀 Getting Started

1.  **Buckets**: Go to the "Buckets & Tasks" tab to see your life areas.
2.  **Capture**: Use "Quick Capture" to dump tasks into the Inbox.
3.  **Refine**: Edit tasks to add "Next Action" and move them to "Ready".
4.  **Plan**: Go to "Planning" to set your Anchor for tomorrow.
5.  **Execute**: Use the Dashboard to start your Anchor session.

---

*v1.1.0 Standup Mode*

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Landing } from '@/pages/Landing';
import { SmartInbox } from '@/pages/SmartInbox';
import { MissionPlanner } from '@/pages/MissionPlanner';
import { CalendarView } from '@/pages/CalendarView';
import { TasksView } from '@/pages/TasksView';
import { AIChatView } from '@/pages/AIChatView';
import { BrainView } from '@/pages/BrainView';
import { KnowledgeView } from '@/pages/KnowledgeView';
import { AnalyticsView } from '@/pages/AnalyticsView';
import { SettingsView } from '@/pages/SettingsView';
import { WorkspacesView } from '@/pages/WorkspacesView';
import { GuideView } from '@/pages/GuideView';

import { AuthProvider, useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* App Shell with Sidebar */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspaces" element={<WorkspacesView />} />
            <Route path="/brain" element={<BrainView />} />
            <Route path="/inbox" element={<SmartInbox />} />
            <Route path="/missions" element={<MissionPlanner />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/chat" element={<AIChatView />} />
            <Route path="/knowledge" element={<KnowledgeView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/guide" element={<GuideView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

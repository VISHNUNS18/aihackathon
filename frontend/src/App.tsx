import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import TicketDesk from '@/pages/TicketDesk';
import TicketHistory from '@/pages/TicketHistory';
import TeamView from '@/pages/TeamView';
import Settings from '@/pages/Settings';
import BugDemo from '@/pages/BugDemo';
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/desk" element={<TicketDesk />} />
        <Route path="/desk/:ticketId" element={<TicketDesk />} />
        <Route path="/history" element={<TicketHistory />} />
        <Route path="/team" element={<TeamView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/bug-demo" element={<BugDemo />} />
      </Routes>
    </AppShell>
  );
}

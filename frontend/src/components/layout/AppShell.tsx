import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, History, Users, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from './Header';
import { useAgentStore } from '@/store/agentStore';
import { PRODUCTS } from '@/constants/products';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/desk',      label: 'Ticket Desk', icon: Ticket },
  { to: '/history',   label: 'History', icon: History },
  { to: '/team',      label: 'Team View', icon: Users },
  { to: '/settings',  label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { activeProduct } = useAgentStore();
  const product = PRODUCTS[activeProduct];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-gray-100">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: product.color }}
          >
            CY
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">Support Desk</div>
              <div className="text-xs text-gray-400 truncate">{product.name}</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                  isActive ? 'text-white font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: product.color } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mb-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        {/* Each page manages its own scroll */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

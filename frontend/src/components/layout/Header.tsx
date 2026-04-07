import { Bell } from 'lucide-react';
import ProductSwitcher from '@/components/shared/ProductSwitcher';
import { useAgentStore } from '@/store/agentStore';

export default function Header() {
  const { agent } = useAgentStore();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
      <div className="flex-1" />

      <ProductSwitcher />

      <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
          {agent?.name?.charAt(0) || 'A'}
        </div>
        {agent && <span className="text-sm text-gray-600">{agent.name}</span>}
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useWorkflowStore } from '@/store/workflowStore';
import TicketLoader from '@/components/ticket/TicketLoader';
import SkillsPipeline from '@/components/ticket/SkillsPipeline';
import TicketHeader from '@/components/ticket/TicketHeader';
import ConversationThread from '@/components/ticket/ConversationThread';
import WorkflowPanel from '@/components/workflow/WorkflowPanel';
import StripePanel from '@/components/stripe/StripePanel';
import AccountSnapshot from '@/components/account/AccountSnapshot';
import { Zap, CreditCard, User } from 'lucide-react';

type RightTab = 'workflow' | 'account' | 'stripe';

export default function TicketDesk() {
  const { ticketId: paramId } = useParams();
  const { run } = useWorkflow();
  const { bundle, account, stripe } = useWorkflowStore();
  const [rightTab, setRightTab] = useState<RightTab>('workflow');

  useEffect(() => { if (paramId) run(paramId); }, [paramId]);

  const tabs: { key: RightTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'workflow', label: 'AI Workflow',    icon: <Zap className="w-3 h-3" />,        show: true },
    { key: 'account',  label: 'Account',        icon: <User className="w-3 h-3" />,        show: !!account },
    { key: 'stripe',   label: 'Billing',        icon: <CreditCard className="w-3 h-3" />, show: !!stripe },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Top bar — fixed, no scroll ─────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2.5 space-y-2.5 border-b border-gray-100 bg-gray-50">
        <TicketLoader />
        <SkillsPipeline />
      </div>

      {/* ── Split pane — fills remaining height ────────────────── */}
      {bundle ? (
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_420px] divide-x divide-gray-100">

          {/* LEFT — ticket info + conversation */}
          <div className="flex flex-col min-h-0 overflow-hidden">
            {/* Ticket header — sticky */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
              <TicketHeader bundle={bundle} />
            </div>
            {/* Conversation — scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
              <ConversationThread />
            </div>
          </div>

          {/* RIGHT — tabbed workflow / account / stripe */}
          <div className="flex flex-col min-h-0 overflow-hidden bg-white">
            {/* Tab bar — sticky */}
            <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-gray-100">
              {tabs.filter((t) => t.show).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setRightTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    rightTab === t.key
                      ? 'bg-brand text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content — scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              {rightTab === 'workflow' && <WorkflowPanel />}
              {rightTab === 'account'  && account && <AccountSnapshot account={account} />}
              {rightTab === 'stripe'   && <StripePanel />}
            </div>
          </div>
        </div>

      ) : (
        /* ── Empty state ──────────────────────────────────────── */
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_420px] divide-x divide-gray-100">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-brand" />
              </div>
              <p className="text-sm font-medium text-gray-600">Load a ticket to start the AI workflow</p>
              <p className="text-xs text-gray-400 mt-1">Enter a Zendesk ID or pick a demo scenario above</p>
            </div>
          </div>
          <div className="bg-white flex flex-col min-h-0">
            <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-gray-100">
              <span className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg font-medium flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> AI Workflow
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <WorkflowPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

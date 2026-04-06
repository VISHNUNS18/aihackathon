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
import { Zap, CreditCard, User, ChevronsLeft, ChevronsRight, MessageSquare } from 'lucide-react';

type RightTab = 'workflow' | 'account' | 'stripe';
type ConvSize = 'compact' | 'expanded' | 'collapsed';

const CONV_WIDTH: Record<ConvSize, string> = {
  collapsed: 'w-10',
  compact:   'w-[30%]',
  expanded:  'w-[48%]',
};

export default function TicketDesk() {
  const { ticketId: paramId } = useParams();
  const { run } = useWorkflow();
  const { bundle, account, stripe } = useWorkflowStore();
  const [rightTab, setRightTab] = useState<RightTab>('workflow');
  const [convSize, setConvSize] = useState<ConvSize>('compact');

  useEffect(() => { if (paramId) run(paramId); }, [paramId]);

  const tabs: { key: RightTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'workflow', label: 'AI Analysis',  icon: <Zap className="w-3 h-3" />,        show: true },
    { key: 'account',  label: 'Account',      icon: <User className="w-3 h-3" />,        show: !!account },
    { key: 'stripe',   label: 'Billing',      icon: <CreditCard className="w-3 h-3" />, show: !!stripe },
  ];

  const cycleConvSize = () => {
    setConvSize((s) =>
      s === 'collapsed' ? 'compact' : s === 'compact' ? 'expanded' : 'collapsed'
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2.5 space-y-2.5 border-b border-gray-200 bg-white shadow-sm">
        <TicketLoader />
        <SkillsPipeline />
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      {bundle ? (
        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* ── LEFT — Conversation ──────────────────────────────── */}
          <div
            className={`flex-shrink-0 flex flex-col min-h-0 border-r border-gray-200 bg-white transition-all duration-300 ${CONV_WIDTH[convSize]}`}
          >
            {/* Conversation header */}
            <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              {convSize !== 'collapsed' && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-500 truncate">Conversation</span>
                </div>
              )}
              <button
                onClick={cycleConvSize}
                title={convSize === 'collapsed' ? 'Expand' : convSize === 'compact' ? 'Expand more' : 'Collapse'}
                className="ml-auto flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {convSize === 'collapsed'
                  ? <ChevronsRight className="w-3.5 h-3.5" />
                  : convSize === 'expanded'
                  ? <ChevronsLeft className="w-3.5 h-3.5" />
                  : <ChevronsRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Ticket header + messages */}
            {convSize !== 'collapsed' && (
              <>
                <div className="flex-shrink-0 px-3 py-2.5 border-b border-gray-100">
                  <TicketHeader bundle={bundle} />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
                  <ConversationThread />
                </div>
              </>
            )}

            {/* Collapsed strip — just ticket ID */}
            {convSize === 'collapsed' && (
              <div className="flex-1 flex items-start justify-center pt-4">
                <span
                  className="text-[10px] font-mono text-gray-400 writing-vertical"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}
                >
                  #{bundle.ticket?.id ?? '—'}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT — AI Analysis (majority) ───────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-gray-50">

            {/* Tab bar */}
            <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
              {tabs.filter((t) => t.show).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setRightTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    rightTab === t.key
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {rightTab === 'workflow' && <WorkflowPanel />}
              {rightTab === 'account'  && account && <AccountSnapshot account={account} />}
              {rightTab === 'stripe'   && <StripePanel />}
            </div>
          </div>

        </div>

      ) : (
        /* ── Empty state ───────────────────────────────────────── */
        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* Placeholder conversation column */}
          <div className="w-[30%] flex-shrink-0 border-r border-gray-200 bg-white flex items-center justify-center">
            <div className="text-center px-6">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Conversation will appear here</p>
            </div>
          </div>

          {/* Main empty state */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
            <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand text-white rounded-lg shadow-sm">
                <Zap className="w-3 h-3" /> AI Analysis
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <WorkflowPanel />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

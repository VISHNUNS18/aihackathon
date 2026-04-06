import { useState } from 'react';
import { CheckCircle, XCircle, SkipForward, Loader, Circle, Bug, Slack } from 'lucide-react';
import { useWorkflowStore, type SkillStatus } from '@/store/workflowStore';
import { SKILLS } from '@/constants/skills';
import JiraModal from '@/components/workflow/JiraModal';
import SlackModal from '@/components/workflow/SlackModal';

const STATUS_STYLES: Record<SkillStatus, string> = {
  done:    'bg-green-50 border-green-200 text-green-700',
  running: 'bg-blue-50 border-blue-200 text-blue-700',
  error:   'bg-red-50 border-red-200 text-red-600',
  skipped: 'bg-gray-50 border-gray-100 text-gray-300',
  idle:    'bg-white border-gray-100 text-gray-400',
};

const NUM_STYLES: Record<SkillStatus, string> = {
  done:    'bg-green-500 text-white',
  running: 'bg-blue-500 text-white',
  error:   'bg-red-500 text-white',
  skipped: 'bg-gray-200 text-gray-400',
  idle:    'bg-gray-100 text-gray-400',
};

function StatusIcon({ status }: { status: SkillStatus }) {
  if (status === 'done')    return <CheckCircle className="w-3 h-3" />;
  if (status === 'running') return <Loader className="w-3 h-3 animate-spin" />;
  if (status === 'error')   return <XCircle className="w-3 h-3" />;
  if (status === 'skipped') return <SkipForward className="w-3 h-3" />;
  return <Circle className="w-3 h-3" />;
}

export default function SkillsPipeline() {
  const { skillStatuses, bundle, jira } = useWorkflowStore();
  const [jiraOpen, setJiraOpen] = useState(false);
  const [slackOpen, setSlackOpen] = useState(false);

  const doneCount  = Object.values(skillStatuses).filter((s) => s === 'done').length;
  const totalActive = Object.values(skillStatuses).filter((s) => s !== 'idle' && s !== 'skipped').length;
  const hasTicket  = !!bundle;

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Pipeline</span>
            {totalActive > 0 && (
              <span className="text-xs text-gray-400">{doneCount} / {SKILLS.length} complete</span>
            )}
          </div>

          {/* ── Action CTAs — right side ──────────────────────────── */}
          {hasTicket && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setJiraOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  jira
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                }`}
              >
                <Bug className="w-3 h-3" />
                {jira ? `${jira.key}` : 'Raise Bug'}
              </button>
              <button
                onClick={() => setSlackOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 transition-all"
              >
                <Slack className="w-3 h-3" />
                Escalate Slack
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 flex-wrap">
          {SKILLS.map((skill, i) => {
            const status = skillStatuses[skill.id] ?? 'idle';
            return (
              <div key={skill.id} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 ${STATUS_STYLES[status]}`}
                  title={skill.description}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-all ${NUM_STYLES[status]}`}>
                    {skill.id}
                  </div>
                  <span className="hidden sm:inline">{skill.shortName}</span>
                  <StatusIcon status={status} />
                </div>
                {i < SKILLS.length - 1 && (
                  <div className="w-4 h-px mx-0.5 flex-shrink-0" style={{ backgroundColor: '#e5e7eb' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals — rendered outside the pipeline card ────────────── */}
      <JiraModal  open={jiraOpen}  onClose={() => setJiraOpen(false)} />
      <SlackModal open={slackOpen} onClose={() => setSlackOpen(false)} />
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Slack, CheckCircle, Hash, AtSign, X } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import { useWorkflowStore } from '@/store/workflowStore';
import { useAgentStore } from '@/store/agentStore';

interface SlackModalProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_CHANNELS = ['#cx-escalations', '#cx-team', '#cx-urgent'];

/** Normalise input: add # if no prefix, leave @mentions alone */
function normaliseTarget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('#') || trimmed.startsWith('@')) return trimmed;
  return `#${trimmed}`;
}

/** Icon to show next to the channel/DM in the header bar */
function TargetIcon({ target }: { target: string }) {
  if (target.startsWith('@')) return <AtSign className="w-3 h-3 text-gray-400" />;
  return <Hash className="w-3 h-3 text-gray-400" />;
}

export default function SlackModal({ open, onClose }: SlackModalProps) {
  const { ticketId, account, bundle, category, jira } = useWorkflowStore();
  const { defaultChannel, setDefaultChannel } = useAgentStore();

  const [channelInput, setChannelInput] = useState(defaultChannel);
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const channelRef = useRef<HTMLInputElement>(null);

  const resolvedTarget = normaliseTarget(channelInput) || '#cx-escalations';

  const buildMessage = () => [
    `🔴 *Escalation — Ticket #${ticketId}*`,
    `*Customer:* ${bundle?.requester?.name ?? '—'} (${bundle?.requester?.email ?? '—'})`,
    account?.domain ? `*Domain:* ${account.domain}` : null,
    `*Plan:* ${account?.plan ?? '—'}`,
    `*Category:* ${category || 'Pending'}`,
    `*Subject:* ${bundle?.ticket?.subject ?? '—'}`,
    jira ? `*Jira:* ${jira.key} — ${jira.summary}` : null,
    '',
    `*Zendesk:* https://zendesk.com/agent/tickets/${ticketId}`,
  ].filter((l) => l !== null).join('\n');

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      setMessage(buildMessage());
      setPosted(false);
      setChannelInput(defaultChannel);
    }
  }, [open, ticketId]);

  const handlePost = async () => {
    // Save chosen channel as the new default
    const target = normaliseTarget(channelInput);
    if (target) setDefaultChannel(target);

    setPosting(true);
    await new Promise((r) => setTimeout(r, 800));
    setPosting(false);
    setPosted(true);
  };

  const handleQuickPick = (ch: string) => {
    setChannelInput(ch);
    channelRef.current?.focus();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escalate on Slack"
      subtitle={`To ${resolvedTarget} · Ticket #${ticketId}`}
    >
      <div className="p-6 space-y-4">

        {/* ── Success state ─────────────────────────────────────────── */}
        {posted ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-700">Posted to {resolvedTarget}</p>
                <p className="text-xs text-purple-500 mt-0.5">The team has been notified about this escalation.</p>
              </div>
            </div>
            {/* Slack-style preview */}
            <div className="bg-[#1a1d21] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Slack className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">CX Intelligence</span>
                  <span className="text-[10px] text-gray-400 ml-2">just now</span>
                </div>
                <span className="ml-auto text-[10px] text-gray-500">{resolvedTarget}</span>
              </div>
              <pre className="px-4 py-3 text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          </div>

        ) : (
          <>
            {/* ── Channel / DM input ───────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Send to channel or teammate
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {channelInput.startsWith('@')
                    ? <AtSign className="w-3.5 h-3.5" />
                    : <Hash className="w-3.5 h-3.5" />}
                </div>
                <input
                  ref={channelRef}
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="cx-escalations or @john.doe"
                  className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                />
                {channelInput && (
                  <button
                    onClick={() => setChannelInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Use <strong>#channel-name</strong> or <strong>@teammate</strong>. Your choice is remembered for next time.
              </p>

              {/* Quick-pick chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-gray-400">Quick:</span>
                {QUICK_CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => handleQuickPick(ch)}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md border transition-all ${
                      normaliseTarget(channelInput) === ch
                        ? 'bg-purple-600 text-white border-purple-600 font-semibold'
                        : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'
                    }`}
                  >
                    <Hash className="w-2.5 h-2.5" />
                    {ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Message editor ────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
              <div className="bg-[#1a1d21] rounded-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                  <TargetIcon target={resolvedTarget} />
                  <span className="text-xs text-gray-400">{resolvedTarget}</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={9}
                  className="w-full px-4 py-3 text-xs text-gray-200 bg-transparent font-mono resize-none focus:outline-none leading-relaxed"
                  placeholder="Escalation message..."
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Review and edit before posting. Supports Slack markdown (<strong className="text-gray-300">*bold*</strong>, <em className="text-gray-300">_italic_</em>).
              </p>
            </div>

            {/* ── Actions ───────────────────────────────────────────── */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePost}
                disabled={posting || !message.trim() || !channelInput.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Slack className="w-4 h-4" />
                {posting ? 'Posting…' : `Post to ${resolvedTarget}`}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { Save, Hash, AtSign } from 'lucide-react';
import { useAgentStore } from '@/store/agentStore';
import type { ToneStyle } from '@/store/agentStore';

const TONES: { key: ToneStyle; label: string; emoji: string; desc: string }[] = [
  { key: 'friendly',     label: 'Friendly',     emoji: '😊', desc: 'Warm, empathetic, conversational' },
  { key: 'professional', label: 'Professional',  emoji: '👔', desc: 'Formal and polished' },
  { key: 'technical',    label: 'Technical',     emoji: '🔧', desc: 'Precise, detailed, dev-focused' },
  { key: 'concise',      label: 'Concise',       emoji: '⚡', desc: 'Brief, under 5 sentences' },
];

const QUICK_CHANNELS = ['#cx-escalations', '#cx-team', '#cx-urgent'];

export default function Settings() {
  const { agent, setAgent, tone, setTone, customTone, setCustomTone, defaultChannel, setDefaultChannel } = useAgentStore();
  const [name, setName] = useState(agent?.name || '');
  const [email, setEmail] = useState(agent?.email || '');
  const [saved, setSaved] = useState(false);
  const [localCustomTone, setLocalCustomTone] = useState(customTone);
  const [localChannel, setLocalChannel] = useState(defaultChannel);

  const save = () => {
    setAgent({ id: '1', name, email, product: 'cookieyes', role: 'agent' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ENV_CHECKS = [
    { label: 'VITE_ANTHROPIC_API_KEY', ok: !!import.meta.env.VITE_ANTHROPIC_API_KEY },
    { label: 'VITE_API_BASE_URL', ok: !!import.meta.env.VITE_API_BASE_URL },
  ];

  return (
    <div className="h-full overflow-y-auto p-4">
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">Agent profile and configuration</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Agent Profile</h2>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
        </div>
        <button onClick={save}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm rounded-lg hover:bg-brand-dark transition-colors">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Response Tone */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Default Response Tone</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your preferred tone is remembered and applied to every draft. You can always change it per-ticket in the response panel.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTone(t.key); setCustomTone(''); setLocalCustomTone(''); }}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                tone === t.key && !customTone
                  ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <div>
                <div className={`text-xs font-semibold ${tone === t.key && !customTone ? 'text-brand' : 'text-gray-700'}`}>{t.label}</div>
                <div className="text-[11px] text-gray-400">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom tone prompt */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Custom tone prompt
            {customTone && <span className="ml-2 text-violet-600 font-normal">— active, overrides preset</span>}
          </label>
          <textarea
            value={localCustomTone}
            onChange={(e) => setLocalCustomTone(e.target.value)}
            onBlur={() => setCustomTone(localCustomTone)}
            rows={3}
            placeholder='e.g. "Always empathise first, then explain the fix step by step. End with an offer to follow up within 24 hours."'
            className={`w-full px-3 py-2 text-xs text-gray-700 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
              customTone
                ? 'border-violet-300 bg-violet-50/40 focus:ring-violet-300 focus:border-violet-400'
                : 'border-gray-200 focus:ring-brand/30 focus:border-brand'
            }`}
          />
          <p className="text-[11px] text-gray-400 mt-1">Saved on blur. Leave empty to use the preset above.</p>
        </div>
      </div>

      {/* Slack defaults */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Default Slack Destination</h2>
          <p className="text-xs text-gray-400 mt-0.5">Pre-filled when you open the Escalate on Slack modal. Accepts a channel or a teammate DM.</p>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {localChannel.startsWith('@') ? <AtSign className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
          </div>
          <input
            value={localChannel}
            onChange={(e) => setLocalChannel(e.target.value)}
            onBlur={() => setDefaultChannel(localChannel.trim() || '#cx-escalations')}
            placeholder="cx-escalations or @john.doe"
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400">Quick picks:</span>
          {QUICK_CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => { setLocalChannel(ch); setDefaultChannel(ch); }}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md border transition-all ${
                defaultChannel === ch
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

      {/* API Status */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">API Connection Status</h2>
        <div className="space-y-2">
          {ENV_CHECKS.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-mono text-xs text-gray-600">{label}</span>
              <span className={`text-xs ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? 'Set' : 'Missing'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

const AGENTS = [
  'Alex M.', 'Jordan K.', 'Sam P.', 'Riley T.', 'Casey F.', 'Drew N.', 'Morgan L.', 'Quinn B.'
];

export default function TeamView() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Team View</h1>
        <p className="text-sm text-gray-400">8 agents — live activity</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {AGENTS.map((name) => (
          <div key={name} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center">
                {name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{name}</div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-base font-bold text-gray-700">—</div>
                <div className="text-xs text-gray-400">Today</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-base font-bold text-gray-700">—</div>
                <div className="text-xs text-gray-400">Open</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

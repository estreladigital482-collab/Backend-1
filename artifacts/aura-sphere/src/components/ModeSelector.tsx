import React, { useEffect, useState } from 'react';

const MODES = ['standard', 'tv', 'voice', 'developer'] as const;
export type ModeType = (typeof MODES)[number];

interface ModeSelectorProps {
  value: ModeType;
  onChange: (mode: ModeType) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<ModeType>(value);

  useEffect(() => {
    const stored = window.localStorage.getItem('aura_sphere_mode') as ModeType | null;
    if (stored && MODES.includes(stored)) {
      setSelectedMode(stored);
      onChange(stored);
    }
  }, [onChange]);

  useEffect(() => {
    window.localStorage.setItem('aura_sphere_mode', selectedMode);
  }, [selectedMode]);

  return (
    <div className="glass-panel border border-white/10 p-4 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.75)]">
      <h3 className="text-sm text-slate-300 uppercase tracking-[0.2em] mb-3">Modo de Interface</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedMode(mode);
              onChange(mode);
            }}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
              selectedMode === mode
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {mode === 'standard' ? 'Padrão' : mode === 'tv' ? 'TV' : mode === 'voice' ? 'Voz' : 'Dev'}
          </button>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm text-slate-300 uppercase tracking-[0.2em] mb-3">Modo de Interface</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedMode(mode);
              onChange(mode);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              selectedMode === mode
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {mode === 'standard' ? 'Padrão' : mode === 'tv' ? 'TV' : mode === 'voice' ? 'Voz' : 'Dev'}
          </button>
        ))}
      </div>
    </div>
  );
}

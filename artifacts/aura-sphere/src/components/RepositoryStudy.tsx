import React, { useState } from 'react';
import { Search, GitBranch, BookOpen, Rocket, ShieldCheck, Sparkles } from 'lucide-react';

const demoRepos = [
  {
    id: 'rpg-quests',
    name: 'rpg-tools/quest-system',
    description: 'Repositório de ferramentas para criar missões, clonar e estudar módulos de jogo.',
    stars: 420,
    language: 'TypeScript',
    tasks: ['Clonar repo', 'Analisar funções principais', 'Gerar habilidade de NPC']
  },
  {
    id: 'life-hack',
    name: 'life-hack/assistant',
    description: 'Ferramenta de automação para transformar tarefas reais em ações automatizadas.',
    stars: 315,
    language: 'Python',
    tasks: ['Estudar scripts', 'Criar wrapper de reprodução', 'Adotar no projeto']
  }
];

export function RepositoryStudy() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(demoRepos);
  const [selectedRepo, setSelectedRepo] = useState<typeof demoRepos[number] | null>(null);
  const [cloning, setCloning] = useState(false);
  const [clonedRepo, setClonedRepo] = useState<string | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults([
      {
        id: 'life-rpg-search',
        name: `search/${query}`,
        description: `Repositório encontrado para ${query}.`,
        stars: 128,
        language: 'JavaScript',
        tasks: ['Clonar código', 'Estudar componentes', 'Criar habilidade']
      },
      ...demoRepos
    ]);
  };

  const handleClone = async () => {
    if (!selectedRepo) return;
    setCloning(true);
    setTimeout(() => {
      setClonedRepo(selectedRepo.name);
      setCloning(false);
    }, 1200);
  };

  return (
    <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Estudo & Clonagem</p>
          <h3 className="text-2xl font-semibold text-white">Laboratório de Repositórios</h3>
        </div>
        <Sparkles size={32} className="text-violet-400" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 mb-6">
        <div className="flex items-center gap-3 text-slate-200 mb-3">
          <GitBranch size={18} />
          <span className="font-semibold">Clonar repositórios reais</span>
        </div>
        <div className="flex gap-3 flex-col">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar repositórios ou temas..."
            className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 outline-none"
          />
          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition"
          >
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((repo) => (
          <button
            key={repo.id}
            onClick={() => setSelectedRepo(repo)}
            className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
              selectedRepo?.id === repo.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-slate-950/80 hover:border-violet-400 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-white">{repo.name}</h4>
                <p className="text-sm text-slate-400 mt-1">{repo.description}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{repo.language}</p>
                <p>{repo.stars} ★</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
        <h4 className="text-sm font-semibold text-white mb-3">Repositório Selecionado</h4>
        {selectedRepo ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950/80 p-4 border border-white/10">
              <p className="text-sm text-slate-300">Nome: <strong className="text-white">{selectedRepo.name}</strong></p>
              <p className="text-sm text-slate-300">Linguagem: <strong className="text-white">{selectedRepo.language}</strong></p>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="font-semibold text-slate-200">Missões disponíveis</p>
              <ul className="list-disc list-inside space-y-2">
                {selectedRepo.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleClone}
              disabled={cloning}
              className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50"
            >
              <GitBranch size={16} /> {cloning ? 'Clonando...' : 'Clonar Repositório'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Selecione um repositório para ver detalhes e clonar.</p>
        )}
      </div>

      {clonedRepo ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 text-emerald-300 mb-2">
            <ShieldCheck size={16} />
            <span>Repositório clonado com sucesso!</span>
          </div>
          <p>Agora você pode estudar o código e usar as funções para criar habilidades reais no sistema.</p>
          <p className="mt-3 text-slate-400"><strong>Última clonagem:</strong> {clonedRepo}</p>
        </div>
      ) : null}
    </div>
  );
}

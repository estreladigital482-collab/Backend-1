import React, { useState } from 'react';
import { Search, Loader, Check, X, Github, GitBranch, Code2 } from 'lucide-react';

interface AddAbilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAbility: (ability: any) => void;
}

interface SearchResult {
  repo: string;
  functions: Array<{
    name: string;
    signature: string;
    docstring: string;
    selected: boolean;
  }>;
}

export function AddAbilityModal({ isOpen, onClose, onAddAbility }: AddAbilityModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [method, setMethod] = useState<'keyword' | 'repo'>('keyword');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!searchQuery.trim() && method === 'keyword') return;
    if (!repoUrl.trim() && method === 'repo') return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/v1/abilities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: method === 'keyword' ? searchQuery : repoUrl })
      });
      const data = await response.json();

      const results: SearchResult[] = (data.results || []).map((repo: any) => ({
        repo: repo.name,
        functions: (repo.functions || []).map((func: any) => ({
          name: func.name,
          signature: func.signature,
          docstring: func.docstring || 'Sem descrição disponível',
          selected: false
        }))
      }));

      setSearchResults(results.length ? results : [
        {
          repo: 'real-world-tools/analysis-engine',
          functions: [
            { name: 'extract_insights', signature: 'extract_insights(code: str) -> dict', docstring: 'Extrai pontos importantes de um repositório.', selected: false },
            { name: 'clone_and_run', signature: 'clone_and_run(url: str) -> bool', docstring: 'Clona repositório e executa análise automática.', selected: false }
          ]
        }
      ]);
      setStep(2);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([
        {
          repo: 'demo-repo/life-rpg',
          functions: [
            { name: 'study_repository', signature: 'study_repository(url: str) -> report', docstring: 'Estuda o repositório e gera resumo de aprendizado.', selected: false },
            { name: 'build_ability', signature: 'build_ability(name: str, functions: list) -> ability', docstring: 'Cria uma nova habilidade a partir de funções selecionadas.', selected: false }
          ]
        }
      ]);
      setStep(2);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFunctionSelection = (repoIndex: number, funcIndex: number) => {
    const results = [...searchResults];
    const func = results[repoIndex].functions[funcIndex];
    func.selected = !func.selected;
    setSearchResults(results);

    const key = `${repoIndex}-${funcIndex}`;
    setSelectedFunctions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleConfirmAdd = async () => {
    const selectedFuncs = [];
    searchResults.forEach((repo, repoIndex) => {
      repo.functions.forEach((func, funcIndex) => {
        if (func.selected) {
          selectedFuncs.push({
            repo: repo.repo,
            ...func
          });
        }
      });
    });

    if (selectedFuncs.length === 0) return;

    try {
      await fetch('/api/v1/abilities/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functions: selectedFuncs,
          name: `Forja de ${method === 'repo' ? 'Repo' : searchQuery}`,
          description: `Habilidade criada a partir de ${method === 'repo' ? 'repositório clonado' : 'pesquisa por termo'}.`
        })
      });

      onAddAbility({ name: searchQuery || repoUrl, functions: selectedFuncs.length });
      resetModal();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar ability:', error);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSearchQuery('');
    setRepoUrl('');
    setSearchResults([]);
    setSelectedFunctions({});
    setMethod('keyword');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Forjar Nova Habilidade</h2>
            <p className="text-sm text-slate-400">Clone repositórios, estude funções e transforme isso em habilidades práticas.</p>
          </div>
          <button onClick={() => { resetModal(); onClose(); }} className="rounded-full bg-slate-800 p-3 text-slate-300 hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] px-6 py-6">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3 mb-4 text-slate-200">
                <Github size={20} />
                <div>
                  <h3 className="font-semibold text-white">Modo de Busca</h3>
                  <p className="text-sm text-slate-400">Pesquise por habilidades no GitHub ou cole um repositório para clonar.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setMethod('keyword')}
                  className={`rounded-3xl px-4 py-3 text-sm font-semibold text-left transition ${
                    method === 'keyword' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="block">Buscar por termo</span>
                  <span className="text-xs text-slate-400">ex: análise de dados, automação</span>
                </button>
                <button
                  onClick={() => setMethod('repo')}
                  className={`rounded-3xl px-4 py-3 text-sm font-semibold text-left transition ${
                    method === 'repo' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="block">Clonar repositório</span>
                  <span className="text-xs text-slate-400">ex: github.com/user/project</span>
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
              <label className="text-sm font-medium text-slate-200">{method === 'keyword' ? 'Palavra-chave' : 'URL do Repositório'}</label>
              <div className="mt-3 flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  value={method === 'keyword' ? searchQuery : repoUrl}
                  onChange={(e) => method === 'keyword' ? setSearchQuery(e.target.value) : setRepoUrl(e.target.value)}
                  placeholder={method === 'keyword' ? 'Digite termos de busca...' : 'Cole a URL do repositório...'}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || (!searchQuery.trim() && method === 'keyword') || (!repoUrl.trim() && method === 'repo')}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  {isSearching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>
            </div>

            {step === 2 && (
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
                <div className="mb-4 flex items-center gap-3 text-slate-200">
                  <Check size={20} />
                  <div>
                    <h3 className="font-semibold text-white">Resultados Disponíveis</h3>
                    <p className="text-sm text-slate-400">Selecione as funções que você deseja transformar em habilidade.</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-[36rem] overflow-y-auto">
                  {searchResults.map((repo, repoIndex) => (
                    <div key={repoIndex} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between mb-3 gap-4">
                        <h4 className="text-base font-semibold text-white">{repo.repo}</h4>
                        <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs text-violet-200">Repo</span>
                      </div>
                      <div className="space-y-2">
                        {repo.functions.map((func, funcIndex) => {
                          const key = `${repoIndex}-${funcIndex}`;
                          return (
                            <button
                              key={funcIndex}
                              onClick={() => toggleFunctionSelection(repoIndex, funcIndex)}
                              className={`w-full rounded-3xl border px-4 py-3 text-left transition ${func.selected ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-white/10 bg-slate-900/80 text-slate-200 hover:border-violet-400 hover:bg-slate-800'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium">{func.name}</p>
                                  <p className="text-xs text-slate-400 mt-1">{func.signature}</p>
                                </div>
                                <span className="text-xs text-slate-300">{func.selected ? 'Selecionado' : 'Selecionar'}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">{func.docstring}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3 mb-4 text-slate-200">
                <GitBranch size={20} />
                <div>
                  <h3 className="font-semibold text-white">Laboratório de Código</h3>
                  <p className="text-sm text-slate-400">Clonar, estudar e conectar repositórios ao seu workflow.</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Próxima etapa</p>
                <p className="text-sm text-slate-300">Depois de selecionar funções, finalize a habilidade e implemente no seu código.</p>
              </div>
              <button
                onClick={handleConfirmAdd}
                disabled={Object.values(selectedFunctions).filter(Boolean).length === 0}
                className="mt-5 w-full rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                Confirmar Forja
              </button>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3 text-slate-200 mb-4">
                <Code2 size={20} />
                <div>
                  <h3 className="font-semibold text-white">Guia de Estudo</h3>
                  <p className="text-sm text-slate-400">Marque um repositório para estudar e receber notas rápidas.</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">Clonar repositório e executar análise estática</li>
                <li className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">Documentar funções úteis para implementar</li>
                <li className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">Adicionar tarefas ao pipeline de aprendizado</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

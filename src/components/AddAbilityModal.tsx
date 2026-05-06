import React, { useState } from 'react';
import { Search, Loader, Check, X, Github } from 'lucide-react';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/v1/abilities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();

      // Transformar resultados em formato esperado
      const results: SearchResult[] = data.results.map((repo: any) => ({
        repo: repo.name,
        functions: repo.functions.map((func: any) => ({
          name: func.name,
          signature: func.signature,
          docstring: func.docstring || 'No documentation available',
          selected: false
        }))
      }));

      setSearchResults(results);
      setStep(2);
    } catch (error) {
      console.error('Erro na busca:', error);
      // Demo data
      setSearchResults([
        {
          repo: 'demo-repo/data-utils',
          functions: [
            {
              name: 'analyze_data',
              signature: 'analyze_data(data: pd.DataFrame, columns: list) -> dict',
              docstring: 'Analisa colunas específicas de um DataFrame e retorna estatísticas',
              selected: false
            },
            {
              name: 'clean_data',
              signature: 'clean_data(data: pd.DataFrame) -> pd.DataFrame',
              docstring: 'Remove valores nulos e normaliza dados',
              selected: false
            }
          ]
        }
      ]);
      setStep(2);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFunctionSelection = (repoIndex: number, funcIndex: number) => {
    const newResults = [...searchResults];
    const func = newResults[repoIndex].functions[funcIndex];
    func.selected = !func.selected;

    const key = `${repoIndex}-${funcIndex}`;
    if (func.selected) {
      selectedFunctions.add(key);
    } else {
      selectedFunctions.delete(key);
    }

    setSearchResults(newResults);
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
          name: `Custom Ability from ${searchQuery}`,
          description: `Habilidades extraídas da busca: ${searchQuery}`
        })
      });

      onAddAbility({ name: searchQuery, functions: selectedFuncs.length });
      onClose();
      resetModal();
    } catch (error) {
      console.error('Erro ao adicionar ability:', error);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFunctions(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Adicionar Nova Habilidade</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Github size={20} className="text-gray-600" />
              <span className="text-sm text-gray-600">Passo 1: Buscar no GitHub</span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar habilidades (ex: data analysis, web scraping)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSearching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Buscar</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Check size={20} className="text-green-600" />
              <span className="text-sm text-gray-600">Passo 2: Selecionar Funções</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {searchResults.map((repo, repoIndex) => (
                <div key={repoIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{repo.repo}</h3>
                  <div className="space-y-2">
                    {repo.functions.map((func, funcIndex) => (
                      <div key={funcIndex} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={func.selected}
                          onChange={() => toggleFunctionSelection(repoIndex, funcIndex)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-mono text-sm text-blue-600">{func.signature}</div>
                          <div className="text-sm text-gray-600 mt-1">{func.docstring}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Voltar
              </button>
              <button
                onClick={handleConfirmAdd}
                disabled={selectedFunctions.size === 0}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                Adicionar {selectedFunctions.size} Função{selectedFunctions.size !== 1 ? 'ões' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Shield, Sparkles, BookOpen, Compass, Clock3 } from 'lucide-react';
import { AddAbilityModal } from './AddAbilityModal';
import { AbilityCard } from './AbilityCard';

export function AbilitiesGallery() {
  const [abilities, setAbilities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAbilities, setFilteredAbilities] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    category: 'all',
    sortBy: 'rating'
  });

  useEffect(() => {
    fetchAbilities();
  }, []);

  useEffect(() => {
    const filtered = abilities
      .filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (a) =>
          a.rating >= filters.minRating &&
          (filters.category === 'all' || a.category === filters.category)
      )
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

    setFilteredAbilities(filtered);
  }, [searchTerm, abilities, filters]);

  const fetchAbilities = async () => {
    try {
      const response = await fetch('/api/v1/abilities/list');
      const data = await response.json();
      setAbilities(data.abilities || []);
    } catch (error) {
      console.error('Erro ao buscar abilities:', error);
      setAbilities([
        {
          id: '1',
          name: 'Sentinela Analítica',
          description: 'Analisa dados e apresenta insights como se fosse um oráculo do código.',
          source: 'pandas-community',
          rating: 4.9,
          category: 'data',
          functions: 12,
          version: '2.1.0',
          lastUpdated: '3 dias atrás'
        },
        {
          id: '2',
          name: 'Explorador Web',
          description: 'Rastreia sites, extrai informação e monta relatórios estruturados.',
          source: 'beautiful-soup',
          rating: 4.7,
          category: 'web',
          functions: 8,
          version: '1.8.4',
          lastUpdated: '1 semana atrás'
        },
        {
          id: '3',
          name: 'Forjador de Imagens',
          description: 'Gera imagens e processa visuais com precisão de artista digital.',
          source: 'pillow',
          rating: 4.8,
          category: 'ai',
          functions: 10,
          version: '1.3.2',
          lastUpdated: '2 dias atrás'
        },
        {
          id: '4',
          name: 'Mestre Automático',
          description: 'Automatiza rotinas manuais e transforma tarefas repetitivas em ações poderosas.',
          source: 'selenium-tools',
          rating: 4.6,
          category: 'automation',
          functions: 7,
          version: '1.2.0',
          lastUpdated: '5 dias atrás'
        }
      ]);
    }
  };

  const handleAddAbility = async (abilityId: string) => {
    try {
      await fetch('/api/v1/abilities/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability_id: abilityId })
      });
      fetchAbilities();
    } catch (error) {
      console.error('Erro ao adicionar ability:', error);
    }
  };

  const handleAddNewAbility = () => {
    fetchAbilities();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-600/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">
                <Sparkles size={14} /> Forja de Habilidades
              </div>
              <h2 className="text-3xl font-bold text-white">Crie e equilibre suas habilidades</h2>
              <p className="max-w-2xl text-slate-300">
                Encontre habilidades reais, clone repositórios estudados e implemente diretamente no seu código como se estivesse montando um personagem poderoso.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3 text-slate-200 mb-3">
                  <Shield size={18} />
                  <span className="text-xs uppercase tracking-[0.2em]">Armamento</span>
                </div>
                <p className="text-sm text-slate-400">Habilidades defensivas para proteger e melhorar seu fluxo de desenvolvimento.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3 text-slate-200 mb-3">
                  <Compass size={18} />
                  <span className="text-xs uppercase tracking-[0.2em]">Exploração</span>
                </div>
                <p className="text-sm text-slate-400">Clonar repositórios, estudar código e descobrir novos recursos para implementar.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3 text-slate-200 mb-3">
                  <BookOpen size={18} />
                  <span className="text-xs uppercase tracking-[0.2em]">Estudos</span>
                </div>
                <p className="text-sm text-slate-400">Transforme aprendizagem em tarefas práticas e suba de nível em seu projeto.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Missão ativa</p>
              <h3 className="text-2xl font-semibold text-white">Aventurar-se pelo repositório</h3>
            </div>
            <Clock3 size={28} className="text-violet-400" />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="font-semibold text-white">Desafio Diário</p>
              <p className="text-sm text-slate-400 mt-2">
                Escolha um repositório para clonar, analise as funções mais importantes e converta em habilidade customizada.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Repositórios rastreados</span>
                <span className="font-semibold text-white">8</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Habilidades forjadas</span>
                <span className="font-semibold text-white">12</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Estudos concluídos</span>
                <span className="font-semibold text-white">5</span>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition"
            >
              Forjar Nova Habilidade
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Tabela de habilidade</p>
            <h3 className="text-2xl font-semibold text-white">Seu arsenal</h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
          >
            Criar habilidade
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAbilities.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400">
              Nenhuma habilidade encontrada. Use a forja para buscar um repositório ou criar uma habilidade nova.
            </div>
          ) : (
            filteredAbilities.map((ability) => (
              <AbilityCard
                key={ability.id}
                ability={ability}
                onAdd={() => handleAddAbility(ability.id)}
              />
            ))
          )}
        </div>
      </div>

      <AddAbilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAbility={handleAddNewAbility}
      />
    </div>
  );
}

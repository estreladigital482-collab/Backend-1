import React, { useState, useEffect } from 'react';
import { Plus, Star, Download, Info, ChevronRight } from 'lucide-react';
import { AddAbilityModal } from './AddAbilityModal';
import { AbilityCard } from './AbilityCard';

export function AbilitiesGallery() {
  const [abilities, setAbilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAbilities, setFilteredAbilities] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    category: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    fetchAbilities();
  }, []);

  useEffect(() => {
    const filtered = abilities.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(a => 
      a.rating >= filters.minRating &&
      (filters.category === 'all' || a.category === filters.category)
    ).sort((a, b) => {
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
      // Demo abilities
      setAbilities([
        { id: '1', name: 'Data Analysis', description: 'Análise avançada de dados', source: 'pandas-community', rating: 4.8, category: 'data' },
        { id: '2', name: 'Web Scraping', description: 'Extrair dados de websites', source: 'beautiful-soup', rating: 4.5, category: 'web' },
        { id: '3', name: 'Image Processing', description: 'Processar e manipular imagens', source: 'pillow', rating: 4.7, category: 'ai' },
        { id: '4', name: 'Task Automation', description: 'Automatizar tarefas repetitivas', source: 'selenium-tools', rating: 4.2, category: 'automation' }
      ]);
    }
  };

  const handleAddAbility = async (abilityId) => {
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

  const handleAddNewAbility = (newAbility) => {
    // Refresh the abilities list
    fetchAbilities();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Galeria de Habilidades</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Pesquisar Nova
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Pesquisar habilidades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Rating mínimo:</label>
          <select
            value={filters.minRating}
            onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
            className="px-2 py-1 bg-slate-700 text-white border border-slate-600 rounded text-sm"
          >
            <option value={0}>Todos</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Categoria:</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-2 py-1 bg-slate-700 text-white border border-slate-600 rounded text-sm"
          >
            <option value="all">Todas</option>
            <option value="data">Data Science</option>
            <option value="web">Web</option>
            <option value="ai">AI/ML</option>
            <option value="automation">Automação</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Ordenar por:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            className="px-2 py-1 bg-slate-700 text-white border border-slate-600 rounded text-sm"
          >
            <option value="name">Nome</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAbilities.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12">
            Nenhuma habilidade encontrada
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

      <AddAbilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAbility={handleAddNewAbility}
      />
    </div>
  );
}

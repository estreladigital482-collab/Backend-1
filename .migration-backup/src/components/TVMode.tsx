import React from 'react';
import { Button } from '@/components/ui/button';

export function TVMode() {
  return (
    <div className="p-6 space-y-6 text-center">
      <h2 className="text-3xl font-bold text-white">TV Mode</h2>
      <p className="text-slate-300 max-w-2xl mx-auto">
        Interface otimizada para telas grandes: botões grandes, textos legíveis e foco em ações rápidas.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { title: 'Navegar', description: 'Explorar habilidades e conteúdos', action: 'Browse' },
          { title: 'Sincronizar', description: 'Atualizar suas contas sociais', action: 'Sync' },
          { title: 'Recomendações', description: 'Ver sugestões personalizadas', action: 'Recommend' },
          { title: 'Dashboard', description: 'Visualizar métricas e estatísticas', action: 'Dashboard' }
        ].map((card) => (
          <div key={card.title} className="bg-slate-700/70 border border-slate-600 rounded-3xl p-8 shadow-xl shadow-slate-900/30">
            <h3 className="text-2xl font-semibold text-white mb-3">{card.title}</h3>
            <p className="text-slate-300 mb-6">{card.description}</p>
            <Button size="lg" className="w-full py-5 text-lg">
              {card.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

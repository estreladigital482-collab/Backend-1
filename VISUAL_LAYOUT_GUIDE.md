# Guia de Layout Visual - Aura Sphere

## Visão Geral da Estrutura Visual

O Aura Sphere é uma aplicação React com layout responsivo que se adapta a desktop e mobile. A estrutura visual é organizada em componentes modulares para facilitar a manutenção e escalabilidade.

## Estrutura Principal do Layout

### 1. Layout Base (App.tsx)
- **Container Principal**: `min-h-[100dvh] flex flex-col`
- **Tema**: ThemeProvider com suporte a dark/light mode
- **Roteamento**: BrowserRouter com rotas para Index e AIOnShellTabs
- **Providers**: QueryClient, Tooltip, Toaster

### 2. Página Principal (Index.tsx)
- **Header**: Barra superior com título e status de sincronização
- **Conteúdo**: Componente AIOnShell em tela cheia
- **Responsividade**: Layout flexível que se adapta ao tamanho da tela

### 3. Componente Principal (AIOnShell.tsx)

#### Desktop Layout
```
┌─────────────────────────────────────────────────┐
│ Header (SyncPanel, ModeSelector, Theme Toggle) │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│   Sidebar       │     Main Content Area         │
│   (Modes,       │     (Chat, Planning, etc.)    │
│    Controls)    │                               │
│                 │                               │
└─────────────────┴───────────────────────────────┘
```

#### Mobile Layout
```
┌─────────────────────────────────────────────────┐
│ Header (Title, Theme, ModeSelector)            │
├─────────────────────────────────────────────────┤
│                                                 │
│           Main Content Area                     │
│           (Chat, Planning, etc.)                │
│                                                 │
├─────────────────────────────────────────────────┤
│ Bottom Navigation (5 main modes)                │
└─────────────────────────────────────────────────┘
```

## Componentes Visuais Principais

### 1. Sidebar (SidebarControls.tsx)
**Posicionamento**: Esquerda, oculto em mobile
**Conteúdo**:
- Seletor de modos (Chat, Código, Planejamento, etc.)
- Controles de usuário (perfil, logout)
- Botões de ação rápida

**Estilo**: `bg-slate-900 border-r border-white/10`

### 2. Header
**Desktop**: Superior, com SyncPanel e controles
**Mobile**: Superior, compacto com título e controles essenciais

### 3. Área de Conteúdo Principal
**Posicionamento**: Centro-direita
**Responsividade**: `flex-1` para ocupar espaço restante
**Background**: Gradiente `from-gray-900 via-black to-gray-900`

### 4. Navegação Inferior (Mobile)
**Posicionamento**: Bottom fixed
**Modos**: 5 primeiros modos principais
**Estilo**: `bg-slate-900 border-t border-white/10`

## Interface do Chat (Chat.tsx)

### Estrutura da Interface de Chat
```
┌─────────────────────────────────────────────────┐
│ Header (Nome IA + Status + Configurações)       │
├─────────────────────────────────────────────────┤
│ Memória Ativa (se selecionada)                  │
├─────────────────────────────────────────────────┤
│ Provedor IA (Seleção de provider)               │
├─────────────────────────────────────────────────┤
│ Busca de Mensagens                             │
├─────────────────────────────────────────────────┤
│ Preset de Prompt (Seleção + Editor)             │
├─────────────────────────────────────────────────┤
│ Esfera de Partículas (Estado visual)            │
├─────────────────────────────────────────────────┤
│ Área de Mensagens (Scroll reverso)              │
├─────────────────────────────────────────────────┤
│ Input (Texto + Microfone + Enviar)              │
└─────────────────────────────────────────────────┘
```

### Elementos da Interface de Chat

#### Header do Chat
- **Nome da IA**: Título principal
- **Status da Esfera**: "Pronta", "Ouvindo", "Pensando", "Respondendo"
- **Controles**: Configurações, Logout, Offline Indicator

#### Seção de Memória
- **Indicador Visual**: Fundo roxo quando memória ativa
- **Conteúdo**: Preview do conteúdo da memória
- **Ação**: Botão "Limpar contexto"

#### Seção de Provedor
- **Seleção**: Dropdown com opções (Lovable, Anthropic, OpenAI)
- **Status**: Indicação do provider ativo

#### Busca de Mensagens
- **Input de Busca**: Campo de texto para pesquisa
- **Botões**: Buscar, Limpar conversa
- **Resultados**: Lista de mensagens encontradas

#### Preset de Prompt
- **Seleção**: Dropdown com presets pré-definidos
- **Editor**: Interface para criar presets customizados
- **Campos**: Nome, Descrição, Prompt do sistema

#### Esfera de Partículas
- **Estados**: idle, listening, thinking, responding
- **Formas**: Baseado no modo ativo
- **Interatividade**: Volume visual durante voz

#### Área de Mensagens
- **Layout**: Scroll reverso (novas mensagens embaixo)
- **Altura**: `maxHeight: "60vh"`
- **Mensagens**: Componente ChatMessage com ações (copiar, editar)

#### Área de Input
- **Input de Texto**: Campo principal para mensagens
- **Microfone**: Botão para gravação de voz
- **Enviar**: Botão para enviar mensagem
- **Estados**: Desabilitado durante processamento

## Galeria de Habilidades (AbilitiesGallery.tsx)

### Layout da Galeria
```
┌─────────────────────────────────────────────────┐
│ Header (Título + Botão "Pesquisar Nova")        │
├─────────────────────────────────────────────────┤
│ Barra de Pesquisa                              │
├─────────────────────────────────────────────────┤
│ Filtros (Rating, Categoria, Ordenação)         │
├─────────────────────────────────────────────────┤
│ Grid de Habilidades (Cards responsivos)         │
├─────────────────────────────────────────────────┤
│ Modal de Adição (AddAbilityModal)               │
└─────────────────────────────────────────────────┘
```

### Elementos da Galeria
- **Grid Responsivo**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Cards**: AbilityCard com informações e botão de adicionar
- **Filtros**: Rating mínimo, categoria, ordenação
- **Pesquisa**: Busca por nome e descrição

## Modos e suas Interfaces Visuais

### Chat Mode
- **Layout**: Interface completa de chat como descrita acima
- **Componentes**: Chat.tsx com todas as seções
- **Posicionamento**: Toda a área de conteúdo

### Planning Mode
- **Layout**: Interface de planejamento com tarefas
- **Componentes**: PlanningTab, TaskCard
- **Posicionamento**: Área de conteúdo com scroll

### Voice Mode
- **Layout**: Interface de voz com controles de microfone
- **Componentes**: VoiceMode, controles de áudio
- **Posicionamento**: Centralizado na área de conteúdo

### Outros Modos
- **Imagem**: Interface para geração de imagens
- **Código**: Editor de código
- **Projetos**: Gerenciamento de projetos
- **Memória**: Visualizador de memórias
- **Automação**: Configuração de automações
- **Visual**: Personalização da interface
- **Dev Mode**: Painel de desenvolvedor

## Elementos de UI Comuns

### 1. ParticleSphere
**Posicionamento**: Central em modos não implementados
**Estados**: idle, responding, listening
**Formas**: sphere, cube, galaxy, torus, wave, heart, question

### 2. SyncPanel
**Posicionamento**: Header
**Função**: Mostrar status de sincronização

### 3. ModeSelector
**Posicionamento**: Header
**Função**: Alternar entre modos de UI (standard, tv, voice, developer)

### 4. TourModal
**Posicionamento**: Overlay
**Função**: Guia inicial para novos usuários

## Responsividade e Breakpoints

- **Mobile**: < 768px (md:hidden)
- **Desktop**: >= 768px
- **Flex Layout**: Uso extensivo de flexbox para adaptação
- **Overflow**: Hidden em containers principais, scroll em conteúdo

## Tema e Estilização

- **Framework**: Tailwind CSS
- **Tema**: Dark por padrão, com toggle para light
- **Cores**: Gradientes escuros, acentos em roxo/violeta
- **Transições**: Smooth transitions em hover e mudanças de estado

## Instruções para Implementação Visual

### 1. Posicionamento de Ferramentas
**Localização Principal**: Sidebar (desktop) / Header ou Bottom Nav (mobile)
- **Ferramentas Essenciais**: Sempre visíveis (Chat, Voz, Configurações)
- **Ferramentas Avançadas**: Em submenus ou modais
- **Ações Rápidas**: Botões flutuantes ou no header

**Exemplo de Implementação**:
```tsx
// Sidebar - Desktop
<div className="space-y-2">
  <Button variant="ghost" className="w-full justify-start">
    <MessageCircle className="mr-2 h-4 w-4" />
    Chat
  </Button>
  <Button variant="ghost" className="w-full justify-start">
    <Mic className="mr-2 h-4 w-4" />
    Voz
  </Button>
  <Button variant="ghost" className="w-full justify-start">
    <Settings className="mr-2 h-4 w-4" />
    Configurações
  </Button>
</div>
```

### 2. Galeria de Habilidades (AbilitiesGallery)
**Posicionamento**: Modo dedicado ou modal
**Layout**: Grid responsivo com filtros
**Interação**: Cards clicáveis com preview e instalação

**Estrutura Visual**:
- **Header**: Título + botão de busca
- **Filtros**: Rating, categoria, ordenação
- **Grid**: 1 coluna (mobile) → 3 colunas (desktop)
- **Cards**: Imagem, nome, descrição, rating, botão instalar

### 3. Chat Interface
**Zonas de Interação**:
- **Header**: Status e controles globais
- **Centro**: Esfera + mensagens
- **Bottom**: Input com microfone integrado

**Elementos Interativos**:
- **Microfone**: Botão com estados (gravando/parado)
- **Input**: Campo expansível com placeholder dinâmico
- **Mensagens**: Cards com ações (copiar, editar, deletar)

### 4. Configurações e Preferências
**Organização**: Agrupadas por categoria
- **Perfil**: Nome IA, voz, avatar
- **Interface**: Tema, idioma, notificações
- **Privacidade**: Dados, sincronização
- **Avançado**: Debug, reset

**Posicionamento**: Modal ou painel lateral deslizante

### 5. Notificações e Updates
**Tipos de Notificação**:
- **Toast**: Mensagens temporárias (sonner)
- **Badge**: Contadores em ícones
- **Modal**: Atualizações importantes
- **Status Bar**: Indicadores de conectividade

**Posicionamento**:
- **Toasts**: Top-right corner
- **Badges**: Sobre ícones relevantes
- **Status**: Header ou bottom bar

### 6. Plugins e Extensões
**Galeria Visual**:
- **Cards**: Preview, nome, descrição, autor
- **Estados**: Instalado, disponível, atualização pendente
- **Ações**: Instalar, desinstalar, configurar

**Integração na UI**:
- **Ícone**: Badge de plugin ativo
- **Menu**: Lista de plugins carregados
- **Config**: Painel de configuração por plugin

### 7. Microfone e Controles de Voz
**Estados Visuais**:
- **Inativo**: Ícone padrão
- **Gravando**: Animação pulsante + indicador vermelho
- **Processando**: Spinner + texto "Processando..."

**Posicionamento**: Integrado no input do chat ou botão dedicado

### 8. Navbar e Navegação
**Desktop**: Sidebar vertical com ícones + texto
**Mobile**: Bottom navigation com 5 itens principais
**Tablet**: Combinação ou overlay

**Estrutura de Navegação**:
```
Desktop Sidebar:
├── Chat
├── Código
├── Planejamento
├── Projetos
├── Memória
├── [Outros em submenu]
└── Configurações
```

```
Mobile Bottom Nav:
├── Chat
├── Código
├── Planejamento
├── Projetos
└── Memória
```

### 9. Sistema de Updates
**Indicadores**:
- **Badge**: Número de updates pendentes
- **Notificação**: Toast ao detectar nova versão
- **Modal**: Detalhes da atualização

**Posicionamento**: Header, próximo ao botão de configurações

### 10. Tour e Onboarding
**Sequência Visual**:
1. **Overlay**: Destaque de elementos
2. **Tooltips**: Explicações contextuais
3. **Steps**: Progresso do tour
4. **Skip**: Opção de pular

**Gatilho**: Primeiro acesso ou botão "Tour"

## Responsividade e Breakpoints

### Breakpoints Utilizados
- **Mobile**: < 768px (`md:`)
- **Tablet**: 768px - 1024px (`lg:`)
- **Desktop**: >= 1024px

### Padrões de Layout por Dispositivo

#### Mobile (< 768px)
- **Sidebar**: Oculta, acessível via menu hambúrguer
- **Header**: Compacto, essencial
- **Navegação**: Bottom fixed com 5 itens
- **Conteúdo**: Full width, padding reduzido
- **Input**: Fixed bottom com safe area

#### Tablet (768px - 1024px)
- **Sidebar**: Overlay ou mini sidebar
- **Header**: Expandido com mais controles
- **Navegação**: Bottom ou side combinado
- **Conteúdo**: Centralizado com margens

#### Desktop (>= 1024px)
- **Sidebar**: Sempre visível, full height
- **Header**: Completo com todos os controles
- **Navegação**: Sidebar principal
- **Conteúdo**: Área ampla com scroll lateral se necessário

### Componentes Responsivos

#### Grid System
```tsx
// Grid responsivo para galeria
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

#### Flex Layout
```tsx
// Header responsivo
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Conteúdo */}
</div>
```

#### Navigation
```tsx
// Bottom nav mobile
<div className="md:hidden fixed bottom-0 left-0 right-0">
  {/* Navigation items */}
</div>

// Sidebar desktop
<div className="hidden md:block">
  {/* Sidebar content */}
</div>
```

## Tema e Estilização

### Sistema de Cores
- **Background**: Gradientes escuros (`from-gray-900 via-black to-gray-900`)
- **Cards**: `bg-slate-800/50` com backdrop blur
- **Texto**: `text-white` principal, `text-gray-400` secundário
- **Acentos**: Roxo/violeta para elementos ativos
- **Borders**: `border-white/10` para separadores

### Tema Dark/Light
- **Toggle**: Botão no header
- **Persistência**: localStorage
- **Transições**: Smooth transitions entre temas

### Tipografia
- **Fontes**: System fonts para performance
- **Tamanhos**: `text-xs`, `text-sm`, `text-base`, `text-lg`
- **Pesos**: `font-normal`, `font-medium`, `font-semibold`
- **Tracking**: `tracking-tight`, `tracking-[0.25em]` para labels

## Boas Práticas de Layout

### 1. Consistência Visual
- **Spacing**: Sistema de espaçamento consistente (4px base)
- **Borders**: Raio consistente (`rounded-lg`, `rounded-xl`)
- **Shadows**: Subtle shadows para depth

### 2. Acessibilidade
- **ARIA Labels**: Descrições para screen readers
- **Focus Management**: Visible focus indicators
- **Keyboard Navigation**: Tab order lógico
- **Color Contrast**: Suficiente para legibilidade

### 3. Performance
- **Lazy Loading**: Componentes pesados sob demanda
- **Virtual Scrolling**: Para listas longas
- **Image Optimization**: Compressão e formatos modernos

### 4. Interação
- **Feedback Visual**: Hover states, loading states
- **Micro-animações**: Smooth transitions
- **Gestures**: Touch-friendly em mobile

### 5. Estado e Loading
- **Skeleton Screens**: Para loading states
- **Progressive Enhancement**: Funcionalidade básica primeiro
- **Error Boundaries**: Graceful error handling

## Próximos Passos para Estrutura Visual

### Fase 1: Fundamentos
1. ✅ Implementar layout base responsivo
2. ✅ Criar sistema de componentes UI
3. ✅ Estabelecer padrões de design
4. ✅ Configurar tema dark/light

### Fase 2: Componentes Avançados
1. Implementar galeria de habilidades completa
2. Criar interface de plugins extensível
3. Desenvolver sistema de notificações avançado
4. Adicionar tour interativo

### Fase 3: Otimização
1. Otimizar performance em mobile
2. Implementar PWA features
3. Adicionar suporte a temas customizados
4. Criar sistema de personalização avançado

### Fase 4: Escalabilidade
1. Preparar para internacionalização
2. Implementar sistema de plugins
3. Criar API de temas extensível
4. Desenvolver ferramentas de desenvolvedor

Este guia serve como referência completa para manter a consistência visual e usabilidade da aplicação Aura Sphere, garantindo uma experiência coesa em todos os dispositivos e modos de interação.
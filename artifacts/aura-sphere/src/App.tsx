import { Component, type ErrorInfo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AIOnShellTabs } from "./components/AIOnShellTabs.tsx";
import { useDynamicStyles } from "@/hooks/useVisualCustomization";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#0a0d1a", color: "#f87171", minHeight: "100vh", padding: "2rem", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          <strong>Erro ao carregar o Caos:</strong>
          {"\n\n"}{this.state.error.message}
          {"\n\n"}{this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const DynamicStylesProvider = ({ children }: { children: React.ReactNode }) => {
  useDynamicStyles();
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicStylesProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shell" element={<AIOnShellTabs />} />
          <Route path="/control-panel" element={<AIOnShellTabs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DynamicStylesProvider>
    </QueryClientProvider>
  );
}

const App = () => (
  <AppErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <BrowserRouter basename={basePath}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </AppErrorBoundary>
);

export default App;

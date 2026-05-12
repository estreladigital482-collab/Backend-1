import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useDynamicStyles } from "@/hooks/useVisualCustomization";
import { AIOnShellTabs } from "./components/AIOnShellTabs.tsx";

const queryClient = new QueryClient();

const DynamicStylesProvider = ({ children }: { children: React.ReactNode }) => {
  useDynamicStyles();
  return <>{children}</>;
};

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <DynamicStylesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basePath}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shell" element={<AIOnShellTabs />} />
              <Route path="/control-panel" element={<AIOnShellTabs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DynamicStylesProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

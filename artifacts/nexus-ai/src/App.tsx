import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";

import Home from "@/pages/home";
import Shell from "@/pages/shell";
import Dashboard from "@/pages/dashboard";
import Skills from "@/pages/skills";
import Study from "@/pages/study";
import Fuse from "@/pages/fuse";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import StudioHome from "@/pages/studio/index";
import Arsenal from "@/pages/studio/arsenal";
import Agents from "@/pages/studio/agents";
import Themes from "@/pages/studio/themes";
import Missions from "@/pages/studio/missions";
import ItemDetail from "@/pages/studio/item-detail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shell" component={Shell} />
        <Route path="/nexus" component={Dashboard} />
        <Route path="/nexus/skills" component={Skills} />
        <Route path="/nexus/study" component={Study} />
        <Route path="/nexus/fuse" component={Fuse} />
        <Route path="/nexus/chat" component={Chat} />
        <Route path="/nexus/profile" component={Profile} />
        <Route path="/studio" component={StudioHome} />
        <Route path="/studio/arsenal" component={Arsenal} />
        <Route path="/studio/agents" component={Agents} />
        <Route path="/studio/themes" component={Themes} />
        <Route path="/studio/missions" component={Missions} />
        <Route path="/studio/itens/:id" component={ItemDetail} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

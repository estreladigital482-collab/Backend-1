import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Skills from "@/pages/skills";
import Study from "@/pages/study";
import Fuse from "@/pages/fuse";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";

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
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/skills" component={Skills} />
        <Route path="/study" component={Study} />
        <Route path="/fuse" component={Fuse} />
        <Route path="/chat" component={Chat} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Agents from "@/pages/Agents";
import Economy from "@/pages/Economy";
import Governance from "@/pages/Governance";
import Blogs from "@/pages/Blogs";
import Metrics from "@/pages/Metrics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 3000,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/agents" component={Agents} />
        <Route path="/economy" component={Economy} />
        <Route path="/governance" component={Governance} />
        <Route path="/blogs" component={Blogs} />
        <Route path="/metrics" component={Metrics} />
        <Route>
          <div className="flex h-full items-center justify-center text-muted-foreground font-mono">
            404 // DATA STREAM NOT FOUND
          </div>
        </Route>
      </Switch>
    </Shell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

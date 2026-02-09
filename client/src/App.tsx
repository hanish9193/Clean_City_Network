import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Home, Camera, Map as MapIcon, BarChart3, User } from "lucide-react";
import HomePage from "@/pages/Home";
import Upload from "@/pages/Upload";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Camera, label: "Report", href: "/upload" },
    { icon: MapIcon, label: "Map", href: "/dashboard" },
    { icon: BarChart3, label: "Stats", href: "/analytics" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <a className={cn("nav-item", isActive && "active")}>
              <Icon size={24} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}

function Router() {
  return (
    <div className="mobile-container pb-20">
      <header className="sticky top-0 z-40 w-full glass safe-area-top px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-primary">CleanCity</h1>
        <div className="flex items-center gap-3">
           <User size={20} className="text-muted-foreground" />
        </div>
      </header>
      
      <main className="px-4 py-6">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/upload" component={Upload} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;

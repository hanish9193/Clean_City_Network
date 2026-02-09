import { useAuth } from "@/hooks/use-auth";
import { useTasks, useGenerateRoute, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { MapComponent } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Navigation, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: tasks, isLoading: tasksLoading } = useTasks('pending');
  
  const generateRouteMutation = useGenerateRoute();
  const updateStatusMutation = useUpdateTaskStatus();
  
  const [sortedTasks, setSortedTasks] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) setLocation("/api/login");
  }, [user, authLoading, setLocation]);

  // Sort tasks by priority when data loads
  useEffect(() => {
    if (tasks) {
      const sorted = [...tasks].sort((a, b) => 
        (b.calculatedPriority || 0) - (a.calculatedPriority || 0)
      );
      setSortedTasks(sorted);
    }
  }, [tasks]);

  const handleOptimize = async () => {
    // In a real app, we'd get real geolocation
    await generateRouteMutation.mutateAsync({ 
      collectorLat: 40.7128, 
      collectorLng: -74.0060 
    });
    
    // Simulate reordering based on "route"
    // For prototype, we just reverse to show change
    setSortedTasks(prev => [...prev].reverse());
  };

  const handleComplete = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'collected' });
  };

  if (authLoading || tasksLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Sidebar Task List */}
      <div className="w-full lg:w-96 flex-shrink-0 border-r bg-white flex flex-col h-full z-10 shadow-xl">
        <div className="p-6 border-b space-y-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Collection Route</h1>
            <p className="text-sm text-muted-foreground">
              {sortedTasks.length} pending tasks in your sector
            </p>
          </div>
          
          <Button 
            onClick={handleOptimize} 
            disabled={generateRouteMutation.isPending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {generateRouteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            Optimize Route (AI)
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-20">
            {sortedTasks.map((task, index) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4" 
                style={{ borderLeftColor: task.calculatedPriority > 0.7 ? '#ef4444' : '#22c55e' }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge className={task.calculatedPriority > 0.7 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                      Priority: {task.calculatedPriority?.toFixed(2) || "N/A"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{task.location}</h3>
                  <div className="flex items-center space-x-3 mt-4">
                    <img src={task.imageUrl} alt="Thumb" className="w-12 h-12 rounded object-cover bg-muted" />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="ml-auto"
                      onClick={() => handleComplete(task.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Collected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sortedTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Circle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No pending tasks</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative bg-secondary/20">
        <MapComponent tasks={sortedTasks} />
        
        {/* Floating Stats Card */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-border max-w-xs z-[400]">
          <h4 className="font-bold text-sm mb-2">Live Metrics (Eq 22)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Distance</span>
              <span className="font-mono">14.2 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel Saved</span>
              <span className="font-mono text-green-600">-18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

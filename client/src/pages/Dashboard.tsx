import { useAuth } from "@/hooks/use-auth";
import { useTasks, useGenerateRoute, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { MapComponent } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Navigation, CheckCircle2, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: tasks, isLoading: tasksLoading } = useTasks('pending');
  const [isListExpanded, setIsListExpanded] = useState(false);
  
  const generateRouteMutation = useGenerateRoute();
  const updateStatusMutation = useUpdateTaskStatus();
  
  const [sortedTasks, setSortedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/api/login");
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (tasks) {
      const sorted = [...tasks].sort((a, b) => 
        (b.calculatedPriority || 0) - (a.calculatedPriority || 0)
      );
      setSortedTasks(sorted);
    }
  }, [tasks]);

  const handleOptimize = async () => {
    await generateRouteMutation.mutateAsync({ 
      collectorLat: 40.7128, 
      collectorLng: -74.0060 
    });
    setSortedTasks(prev => [...prev].reverse());
  };

  const handleComplete = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'collected' });
  };

  if (authLoading || tasksLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="fixed inset-0 top-[60px] bottom-16 bg-background flex flex-col">
      {/* Map View */}
      <div className="flex-1 relative overflow-hidden">
        <MapComponent tasks={sortedTasks} />
        
        {/* Floating Optimize Button */}
        <div className="absolute top-4 left-4 right-4 z-[400]">
           <Button 
            onClick={handleOptimize} 
            disabled={generateRouteMutation.isPending}
            className="w-full bg-accent text-accent-foreground rounded-2xl h-12 shadow-xl border-none font-bold"
          >
            {generateRouteMutation.isPending ? <Loader2 className="animate-spin" /> : <Navigation size={18} className="mr-2" />}
            AI Optimization (Eq 22)
          </Button>
        </div>
      </div>

      {/* Bottom Sheet Task List */}
      <motion.div 
        animate={{ height: isListExpanded ? '70%' : '120px' }}
        className="bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-border z-[500] flex flex-col"
      >
        <button 
          onClick={() => setIsListExpanded(!isListExpanded)}
          className="w-full flex flex-col items-center py-4"
        >
          <div className="w-12 h-1.5 bg-muted rounded-full mb-2" />
          <div className="flex items-center justify-between w-full px-6">
            <h2 className="font-bold text-sm">{sortedTasks.length} Tasks Nearby</h2>
            <ChevronUp size={20} className={cn("transition-transform", isListExpanded && "rotate-180")} />
          </div>
        </button>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          {sortedTasks.map((task, index) => (
            <div key={task.id} className="bg-muted/30 p-4 rounded-2xl flex items-center gap-4 border border-border/50">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img src={task.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{task.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] px-1 h-4">#{index + 1}</Badge>
                  <p className="text-[10px] text-muted-foreground">Priority {task.calculatedPriority?.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="rounded-xl h-10 w-10 p-0 bg-primary/10 text-primary hover:bg-primary/20"
                onClick={() => handleComplete(task.id)}
              >
                <CheckCircle2 size={20} />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

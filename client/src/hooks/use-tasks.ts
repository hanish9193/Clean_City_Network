import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Task, type InsertTask, type PrivacyDetectionResponse, type OptimizationRoute } from "@shared/routes";
import { useToast } from "@/components/ui/use-toast";

// === TASKS (Waste Reports) ===

export function useTasks(status?: Task['status']) {
  return useQuery({
    queryKey: [api.tasks.list.path, status],
    queryFn: async () => {
      const url = status 
        ? `${api.tasks.list.path}?status=${status}` 
        : api.tasks.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [api.tasks.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tasks.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch task");
      return api.tasks.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTask & { imageBase64?: string }) => {
      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tasks.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create task");
      }
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({
        title: "Report Submitted",
        description: "Your waste report has been anonymized and submitted successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Task['status'] }) => {
      const url = buildUrl(api.tasks.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.tasks.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update status");
      return api.tasks.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ title: "Status Updated" });
    },
  });
}

// === PRIVACY CHECK ===

export function usePrivacyCheck() {
  return useMutation({
    mutationFn: async (imageBase64: string): Promise<PrivacyDetectionResponse> => {
      const res = await fetch(api.privacy.check.path, {
        method: api.privacy.check.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Privacy check failed");
      return api.privacy.check.responses[200].parse(await res.json()) as PrivacyDetectionResponse;
    },
  });
}

// === ROUTE OPTIMIZATION ===

export function useGenerateRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (location: { collectorLat: number; collectorLng: number }) => {
      const res = await fetch(api.routes.generate.path, {
        method: api.routes.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to generate route");
      return api.routes.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.routes.list.path] });
      toast({
        title: "Route Optimized",
        description: "New collection path generated using priority weighting.",
      });
    },
  });
}

export function useRoutes() {
  return useQuery({
    queryKey: [api.routes.list.path],
    queryFn: async () => {
      const res = await fetch(api.routes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch routes");
      return api.routes.list.responses[200].parse(await res.json());
    },
  });
}

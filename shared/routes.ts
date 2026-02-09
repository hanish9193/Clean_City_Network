import { z } from 'zod';
import { insertTaskSchema, tasks, optimizationRoutes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tasks: {
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      // Frontend sends JSON with image data (base64 or URL) + metadata
      input: insertTaskSchema.extend({
        imageBase64: z.string().optional(), // For MVP upload
      }),
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      input: z.object({
        status: z.enum(['pending', 'in_progress', 'collected', 'verified']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id/status' as const,
      input: z.object({
        status: z.enum(['pending', 'in_progress', 'collected', 'verified']),
      }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
      },
    },
  },
  routes: {
    generate: {
      method: 'POST' as const,
      path: '/api/routes/generate' as const,
      input: z.object({
        collectorLat: z.number(),
        collectorLng: z.number(),
      }),
      responses: {
        201: z.object({
          route: z.custom<typeof optimizationRoutes.$inferSelect>(),
          tasks: z.array(z.custom<typeof tasks.$inferSelect>()), // The tasks in order
        }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/routes' as const,
      responses: {
        200: z.array(z.custom<typeof optimizationRoutes.$inferSelect>()),
      },
    },
  },
  // New endpoint for pure privacy check before submission
  privacy: {
    check: {
      method: 'POST' as const,
      path: '/api/privacy/check' as const,
      input: z.object({
        imageBase64: z.string(),
      }),
      responses: {
        200: z.object({
          detected: z.boolean(),
          risks: z.array(z.object({
            type: z.enum(['face', 'plate', 'text']),
            box: z.array(z.number()),
            confidence: z.number()
          })),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

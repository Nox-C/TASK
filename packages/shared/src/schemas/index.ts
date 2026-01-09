import { z } from 'zod';

// Zod validators for API payloads
export const CreateBotSchema = z.object({
  name: z.string().min(1),
  strategyId: z.string().uuid(),
  riskParams: z.record(z.string(), z.any()).optional()
});

export const CreateTaskSchema = z.object({
  name: z.string().min(1),
  triggers: z.array(z.object({
    type: z.enum(['cron', 'webhook']),
    config: z.record(z.string(), z.any())
  })),
  actions: z.array(z.object({
    type: z.enum(['bot.start', 'bot.stop', 'notify']),
    config: z.record(z.string(), z.any())
  }))
});

export const CreateOrderSchema = z.object({
  accountId: z.string().uuid(),
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  qty: z.number().positive(),
  price: z.number().positive().optional(),
  type: z.enum(['market', 'limit']).default('market')
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type CreateBotDto = z.infer<typeof CreateBotSchema>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

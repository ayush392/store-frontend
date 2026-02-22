import { z } from "zod";

export const HealthSchema = z.object({
  ok: z.literal(true),
  uptime: z.number()
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email()
});

export const CreateUserInputSchema = UserSchema.omit({ id: true });

export type Health = z.infer<typeof HealthSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

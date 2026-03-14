import { z } from 'zod';

export const aleoDoctorConfigSchema = z.object({
  chain: z.literal('aleo'),
  network: z.object({
    rpcUrl: z.string().url(),
    timeoutMs: z.number().int().positive().max(30000)
  }),
  wallet: z.object({
    privateKeyEnvVar: z.string().min(1)
  })
});

export type ParsedAleoDoctorConfig = z.infer<typeof aleoDoctorConfigSchema>;

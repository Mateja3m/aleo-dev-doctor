import { z } from 'zod';

const optionalPath = z.string().min(1).optional();

export const aleoDoctorConfigSchema = z.object({
  chain: z.literal('aleo'),
  toolchain: z.object({
    leoBinaryPath: optionalPath,
    snarkosBinaryPath: optionalPath
  }),
  network: z.object({
    name: z.string().min(1),
    rpcUrl: z.string().url(),
    timeoutMs: z.number().int().positive().max(30000)
  }),
  account: z.object({
    privateKeyEnvVar: z.string().min(1),
    addressEnvVar: z.string().min(1),
    viewKeyEnvVar: optionalPath
  }),
  workflow: z.object({
    fixturePath: z.string().min(1),
    compileArgs: z.array(z.string().min(1)).min(1),
    executionMode: z.enum(['placeholder', 'mock'])
  })
});

export const aleoDoctorPartialConfigSchema = z.object({
  chain: z.literal('aleo').optional(),
  toolchain: z
    .object({
      leoBinaryPath: optionalPath,
      snarkosBinaryPath: optionalPath
    })
    .partial()
    .optional(),
  network: z
    .object({
      name: z.string().min(1),
      rpcUrl: z.string().url(),
      timeoutMs: z.number().int().positive().max(30000)
    })
    .partial()
    .optional(),
  account: z
    .object({
      privateKeyEnvVar: z.string().min(1),
      addressEnvVar: z.string().min(1),
      viewKeyEnvVar: optionalPath
    })
    .partial()
    .optional(),
  workflow: z
    .object({
      fixturePath: z.string().min(1),
      compileArgs: z.array(z.string().min(1)).min(1),
      executionMode: z.enum(['placeholder', 'mock'])
    })
    .partial()
    .optional()
});

export type ParsedAleoDoctorConfig = z.infer<typeof aleoDoctorConfigSchema>;

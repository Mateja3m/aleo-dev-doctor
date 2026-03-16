import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { ZodError } from 'zod';

import type { AleoDoctorConfig } from '../domain.js';
import { DEFAULT_CONFIG } from './defaults.js';
import { aleoDoctorConfigSchema, aleoDoctorPartialConfigSchema } from './schema.js';

export function resolveConfigPath(cwd: string, explicitPath?: string): string {
  if (explicitPath) {
    return path.resolve(cwd, explicitPath);
  }

  return path.resolve(cwd, 'aleo-doctor.config.json');
}

export function loadAleoDoctorConfig(cwd: string, explicitPath?: string): AleoDoctorConfig {
  const configPath = resolveConfigPath(cwd, explicitPath);

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  const raw = readFileSync(configPath, 'utf-8');
  const parsedUnknown: unknown = JSON.parse(raw);

  try {
    const parsedPartial = aleoDoctorPartialConfigSchema.parse(parsedUnknown);
    const toolchain = {
      ...DEFAULT_CONFIG.toolchain,
      ...parsedPartial.toolchain
    };
    const account = {
      ...DEFAULT_CONFIG.account,
      ...parsedPartial.account
    };

    return aleoDoctorConfigSchema.parse({
      ...DEFAULT_CONFIG,
      ...parsedPartial,
      toolchain: stripUndefined(toolchain),
      network: {
        ...DEFAULT_CONFIG.network,
        ...parsedPartial.network
      },
      account: stripUndefined(account),
      workflow: {
        ...DEFAULT_CONFIG.workflow,
        ...parsedPartial.workflow
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new Error(`Invalid Aleo doctor config at ${configPath}: ${message}`);
    }

    throw error;
  }
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

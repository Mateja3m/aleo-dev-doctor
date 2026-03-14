import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { ZodError } from 'zod';

import type { AleoDoctorConfig } from '../domain.js';
import { DEFAULT_CONFIG } from './defaults.js';
import { aleoDoctorConfigSchema } from './schema.js';

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
    return aleoDoctorConfigSchema.parse(parsedUnknown);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new Error(`Invalid Aleo doctor config at ${configPath}: ${message}`);
    }

    throw error;
  }
}

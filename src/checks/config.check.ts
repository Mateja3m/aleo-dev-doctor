import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { loadAleoDoctorConfig } from '../config/load-config.js';

export const configCheck: DoctorCheck = {
  id: 'config.base',
  title: 'Config validation',
  category: 'config',
  description: 'Loads and validates Aleo Doctor configuration.',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = loadAleoDoctorConfig(context.cwd, context.configPath);
      return createResult('config.base', 'pass', 'Configuration is valid.', Date.now() - startedAt, {
        rpcUrl: config.network.rpcUrl,
        timeoutMs: config.network.timeoutMs
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Configuration could not be parsed.';
      return createResult('config.base', 'fail', message, Date.now() - startedAt);
    }
  }
};

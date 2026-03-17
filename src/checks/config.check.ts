import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { getConfigOrError } from './helpers.js';

export const configCheck: DoctorCheck = {
  id: 'aleo.config.schema',
  title: 'Aleo config validation',
  category: 'config',
  description: 'Loads and validates Aleo zero-knowledge developer environment configuration.',
  layer: 'foundation',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      return createResult(
        'aleo.config.schema',
        'pass',
        'Aleo developer configuration is valid.',
        Date.now() - startedAt,
        {
          network: config.network.name,
          rpcUrl: config.network.rpcUrl,
          timeoutMs: config.network.timeoutMs,
          fixturePath: config.workflow.fixturePath,
          runArgs: config.workflow.runArgs,
          leoBinaryPath: config.toolchain.leoBinaryPath ?? null,
          snarkosBinaryPath: config.toolchain.snarkosBinaryPath ?? null
        },
        'foundation'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Configuration could not be parsed.';
      return createResult('aleo.config.schema', 'fail', message, Date.now() - startedAt, undefined, 'foundation');
    }
  }
};

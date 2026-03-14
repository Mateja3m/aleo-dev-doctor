import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { loadAleoDoctorConfig } from '../config/load-config.js';

export const workflowBaselineCheck: DoctorCheck = {
  id: 'workflow.baseline',
  title: 'Workflow baseline',
  category: 'workflow',
  description:
    'Lightweight placeholder check for baseline developer workflow assumptions (env, config, network inputs).',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = loadAleoDoctorConfig(context.cwd, context.configPath);
      const walletVar = config.wallet.privateKeyEnvVar;
      const walletSet = Boolean(process.env[walletVar]);

      return createResult(
        'workflow.baseline',
        'warn',
        'Workflow baseline validated with lightweight checks. Deep protocol workflow validation is a planned extension.',
        Date.now() - startedAt,
        {
          placeholder: true,
          rpcConfigured: Boolean(config.network.rpcUrl),
          walletEnvConfigured: walletSet
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'workflow prerequisites could not be validated';
      return createResult('workflow.baseline', 'fail', `Workflow baseline failed: ${message}`, Date.now() - startedAt, {
        placeholder: true
      });
    }
  }
};

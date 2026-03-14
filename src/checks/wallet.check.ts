import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { loadAleoDoctorConfig } from '../config/load-config.js';

const PLACEHOLDER_PRIVATE_KEY_PATTERN = /^A(?:PrivateKey|ViewKey|Address)[A-Za-z0-9_]{10,}$/;

export const walletEnvCheck: DoctorCheck = {
  id: 'wallet.env',
  title: 'Wallet environment assumptions',
  category: 'wallet',
  description: 'Checks if configured wallet environment variable exists and has expected shape.',
  async run(context) {
    const startedAt = Date.now();
    const config = loadAleoDoctorConfig(context.cwd, context.configPath);
    const keyName = config.wallet.privateKeyEnvVar;
    const value = process.env[keyName];

    if (!value) {
      return createResult(
        'wallet.env',
        'warn',
        `Environment variable ${keyName} is not set.`,
        Date.now() - startedAt,
        {
          todo: 'Add secure wallet-provider integration for stronger validation.'
        }
      );
    }

    if (!PLACEHOLDER_PRIVATE_KEY_PATTERN.test(value)) {
      return createResult(
        'wallet.env',
        'warn',
        `${keyName} is set but format does not match placeholder Aleo pattern.`,
        Date.now() - startedAt,
        {
          todo: 'Replace placeholder format validation with canonical Aleo key parser.'
        }
      );
    }

    return createResult('wallet.env', 'pass', `${keyName} is present.`, Date.now() - startedAt);
  }
};

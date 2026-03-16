import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { getConfigOrError } from './helpers.js';

export const accountReadinessCheck: DoctorCheck = {
  id: 'aleo.account.readiness',
  title: 'Aleo account readiness',
  category: 'account',
  description: 'Checks whether the expected Aleo account environment variables are configured.',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const privateKeyEnvVar = config.account.privateKeyEnvVar;
      const addressEnvVar = config.account.addressEnvVar;
      const viewKeyEnvVar = config.account.viewKeyEnvVar;

      const hasPrivateKey = Boolean(process.env[privateKeyEnvVar]);
      const hasAddress = Boolean(process.env[addressEnvVar]);
      const hasViewKey = viewKeyEnvVar ? Boolean(process.env[viewKeyEnvVar]) : undefined;

      const missing = [!hasPrivateKey ? privateKeyEnvVar : null, !hasAddress ? addressEnvVar : null].filter(Boolean);

      if (missing.length > 0) {
        return createResult(
          'aleo.account.readiness',
          'warn',
          `Aleo account configuration is incomplete. Missing ${missing.join(', ')}.`,
          Date.now() - startedAt,
          {
            privateKeyEnvVar,
            addressEnvVar,
            viewKeyEnvVar: viewKeyEnvVar ?? null,
            hasPrivateKey,
            hasAddress,
            hasViewKey: hasViewKey ?? null
          }
        );
      }

      return createResult(
        'aleo.account.readiness',
        'pass',
        'Aleo account configuration is present for privacy-first app development.',
        Date.now() - startedAt,
        {
          privateKeyEnvVar,
          addressEnvVar,
          viewKeyEnvVar: viewKeyEnvVar ?? null,
          hasPrivateKey,
          hasAddress,
          hasViewKey: hasViewKey ?? null
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Aleo configuration is unavailable.';
      return createResult('aleo.account.readiness', 'fail', message, Date.now() - startedAt);
    }
  }
};

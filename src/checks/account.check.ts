import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { getConfigOrError } from './helpers.js';

const ALEO_PRIVATE_KEY_PATTERN = /^APrivateKey1[0-9A-Za-z]{20,}$/;
const ALEO_ADDRESS_PATTERN = /^aleo1[0-9a-z]{20,}$/;
const MOCK_TX_ENV = 'ALEO_DOCTOR_MOCK_TX_READY';

export const accountPrivateKeyCheck: DoctorCheck = {
  id: 'aleo.account.private_key',
  title: 'Aleo private key readiness',
  category: 'account',
  description: 'Checks whether the configured Aleo private key environment variable is present and shaped correctly.',
  layer: 'account',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const envVar = config.account.privateKeyEnvVar;
      const value = process.env[envVar];

      if (!value) {
        return createResult(
          'aleo.account.private_key',
          'warn',
          `Aleo private key variable ${envVar} is not set.`,
          Date.now() - startedAt,
          { privateKeyEnvVar: envVar, present: false },
          'account'
        );
      }

      const formatValid = ALEO_PRIVATE_KEY_PATTERN.test(value);

      return createResult(
        'aleo.account.private_key',
        formatValid ? 'pass' : 'warn',
        formatValid
          ? 'Aleo private key format looks ready for local validation workflows.'
          : 'Aleo private key is present but does not match the expected Aleo prefix pattern.',
        Date.now() - startedAt,
        { privateKeyEnvVar: envVar, present: true, formatValid },
        'account'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account readiness failed.';
      return createResult('aleo.account.private_key', 'fail', message, Date.now() - startedAt, undefined, 'account');
    }
  }
};

export const accountTransactionReadinessCheck: DoctorCheck = {
  id: 'aleo.account.transaction',
  title: 'Transaction readiness',
  category: 'account',
  description: 'Simulates dry-run transaction readiness without submitting any Aleo transaction.',
  layer: 'account',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const addressValue = process.env[config.account.addressEnvVar];
      const privateKeyValue = process.env[config.account.privateKeyEnvVar];
      const mockStatus = process.env[MOCK_TX_ENV];

      if (mockStatus === 'pass' || mockStatus === 'fail') {
        return createResult(
          'aleo.account.transaction',
          mockStatus,
          mockStatus === 'pass'
            ? 'Transaction readiness passed in mock mode.'
            : 'Transaction readiness failed in mock mode.',
          Date.now() - startedAt,
          {
            privateKeyEnvVar: config.account.privateKeyEnvVar,
            addressEnvVar: config.account.addressEnvVar,
            mockMode: true
          },
          'account'
        );
      }

      const addressFormatValid = addressValue ? ALEO_ADDRESS_PATTERN.test(addressValue) : false;
      const ready = Boolean(privateKeyValue) && addressFormatValid;

      return createResult(
        'aleo.account.transaction',
        ready ? 'pass' : 'warn',
        ready
          ? 'Account material is present for transaction dry-run readiness.'
          : 'Transaction readiness is incomplete. Provide a valid Aleo address and private key.',
        Date.now() - startedAt,
        {
          privateKeyEnvVar: config.account.privateKeyEnvVar,
          addressEnvVar: config.account.addressEnvVar,
          hasPrivateKey: Boolean(privateKeyValue),
          hasAddress: Boolean(addressValue),
          addressFormatValid
        },
        'account'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction readiness failed.';
      return createResult('aleo.account.transaction', 'fail', message, Date.now() - startedAt, undefined, 'account');
    }
  }
};

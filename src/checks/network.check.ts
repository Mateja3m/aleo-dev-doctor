import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { retry } from '../adapters/utils.js';
import { getConfigOrError } from './helpers.js';

export const networkReachabilityCheck: DoctorCheck = {
  id: 'aleo.network.rpc',
  title: 'RPC reachability',
  category: 'network',
  description: 'Checks if the configured Aleo RPC endpoint is valid and reachable.',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const rpcUrl = config.network.rpcUrl;
      const parsedUrl = new URL(rpcUrl);

      const response = await retry(
        () =>
          fetch(parsedUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(context.requestTimeoutMs)
          }),
        { retries: 1, minDelayMs: 150 }
      );

      if (response.ok) {
        return createResult(
          'aleo.network.rpc',
          'pass',
          `Aleo ${config.network.name} RPC endpoint is reachable.`,
          Date.now() - startedAt,
          {
            network: config.network.name,
            url: rpcUrl,
            status: response.status,
            reachable: true
          }
        );
      }

      return createResult(
        'aleo.network.rpc',
        'warn',
        `Aleo ${config.network.name} RPC responded with status ${response.status}.`,
        Date.now() - startedAt,
        {
          network: config.network.name,
          url: rpcUrl,
          status: response.status,
          reachable: true
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'RPC request failed.';

      return createResult(
        'aleo.network.rpc',
        'fail',
        `Aleo RPC validation failed: ${message}`,
        Date.now() - startedAt
      );
    }
  }
};

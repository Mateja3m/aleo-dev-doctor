import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { loadAleoDoctorConfig } from '../config/load-config.js';
import { retry } from '../adapters/utils.js';

export const networkReachabilityCheck: DoctorCheck = {
  id: 'network.rpc',
  title: 'RPC reachability',
  category: 'network',
  description: 'Checks if the configured Aleo RPC endpoint responds.',
  async run(context) {
    const startedAt = Date.now();
    const config = loadAleoDoctorConfig(context.cwd, context.configPath);

    try {
      const response = await retry(
        () =>
          fetch(config.network.rpcUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(context.requestTimeoutMs)
          }),
        { retries: 1, minDelayMs: 150 }
      );

      if (response.ok) {
        return createResult('network.rpc', 'pass', 'RPC endpoint is reachable.', Date.now() - startedAt, {
          url: config.network.rpcUrl,
          status: response.status
        });
      }

      return createResult('network.rpc', 'warn', `RPC responded with status ${response.status}.`, Date.now() - startedAt, {
        url: config.network.rpcUrl,
        status: response.status
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'RPC request failed.';
      return createResult('network.rpc', 'fail', `RPC endpoint check failed: ${message}`, Date.now() - startedAt, {
        url: config.network.rpcUrl
      });
    }
  }
};

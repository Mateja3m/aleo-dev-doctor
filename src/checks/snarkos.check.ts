import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { commandExists, getCommandVersion, getConfigOrError, resolveBinaryPath } from './helpers.js';

export const snarkosToolchainCheck: DoctorCheck = {
  id: 'aleo.snarkos.binary',
  title: 'snarkOS binary readiness',
  category: 'snarkos',
  description: 'Checks whether snarkOS is installed and reports its version.',
  layer: 'snarkos',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const snarkosBinary = resolveBinaryPath(config.toolchain.snarkosBinaryPath, 'snarkos');
      const hasSnarkos = await commandExists(snarkosBinary);

      if (!hasSnarkos) {
        return createResult(
          'aleo.snarkos.binary',
          'warn',
          `${snarkosBinary} is not installed or not reachable.`,
          Date.now() - startedAt,
          { configuredBinaryPath: config.toolchain.snarkosBinaryPath ?? null },
          'snarkos'
        );
      }

      const version = await getCommandVersion(snarkosBinary, ['--version']);

      return createResult(
        'aleo.snarkos.binary',
        'pass',
        version ? `snarkOS detected: ${version}.` : 'snarkOS detected.',
        Date.now() - startedAt,
        { configuredBinaryPath: config.toolchain.snarkosBinaryPath ?? null, version },
        'snarkos'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'snarkOS configuration could not be loaded.';
      return createResult('aleo.snarkos.binary', 'fail', message, Date.now() - startedAt, undefined, 'snarkos');
    }
  }
};

export const snarkosRpcCheck: DoctorCheck = {
  id: 'aleo.snarkos.rpc',
  title: 'snarkOS RPC semantics',
  category: 'snarkos',
  description: 'Pings the configured endpoint and validates that the response shape looks Aleo-specific.',
  layer: 'snarkos',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const response = await fetch(config.network.rpcUrl, {
        method: 'GET',
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(context.requestTimeoutMs)
      });

      const contentType = response.headers.get('content-type') ?? '';
      let responsePreview = '';
      let semanticMatch = false;

      if (contentType.includes('application/json')) {
        const json = (await response.json()) as Record<string, unknown>;
        responsePreview = JSON.stringify(json).slice(0, 160);
        semanticMatch = Object.keys(json).some((key) =>
          ['height', 'stateRoot', 'transactions', 'name', 'network'].includes(key)
        );
      } else {
        const text = await response.text();
        responsePreview = text.slice(0, 160);
        semanticMatch = /aleo|block|transaction|height/i.test(text);
      }

      const status = response.ok && semanticMatch ? 'pass' : response.ok ? 'warn' : 'warn';
      const message = response.ok
        ? semanticMatch
          ? 'snarkOS RPC returned an Aleo-like response structure.'
          : 'RPC responded, but the payload did not clearly match expected Aleo/snarkOS semantics.'
        : `RPC responded with status ${response.status}.`;

      return createResult(
        'aleo.snarkos.rpc',
        status,
        message,
        Date.now() - startedAt,
        {
          network: config.network.name,
          url: config.network.rpcUrl,
          status: response.status,
          semanticMatch,
          responsePreview
        },
        'snarkos'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'snarkOS RPC validation failed.';
      return createResult('aleo.snarkos.rpc', 'fail', message, Date.now() - startedAt, undefined, 'snarkos');
    }
  }
};

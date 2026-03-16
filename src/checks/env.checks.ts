import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { commandExists, getCommandVersion, getConfigOrError, resolveBinaryPath } from './helpers.js';

const MIN_NODE_MAJOR = 18;

export const nodeVersionCheck: DoctorCheck = {
  id: 'aleo.env.node',
  title: 'Node.js runtime',
  category: 'env',
  description: 'Validates that the Node.js runtime supports Aleo developer tooling.',
  async run() {
    const startedAt = Date.now();
    const majorVersion = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

    if (majorVersion >= MIN_NODE_MAJOR) {
      return createResult(
        'aleo.env.node',
        'pass',
        `Node.js ${process.versions.node} is ready for Aleo developer tooling.`,
        Date.now() - startedAt,
        { version: process.versions.node, minimumMajor: MIN_NODE_MAJOR }
      );
    }

    return createResult(
      'aleo.env.node',
      'fail',
      `Node.js ${process.versions.node} is below the Aleo doctor minimum major ${MIN_NODE_MAJOR}.`,
      Date.now() - startedAt,
      { version: process.versions.node, minimumMajor: MIN_NODE_MAJOR }
    );
  }
};

export const npmCheck: DoctorCheck = {
  id: 'aleo.env.npm',
  title: 'npm availability',
  category: 'env',
  description: 'Checks npm presence for installing Aleo development dependencies and demos.',
  async run() {
    const startedAt = Date.now();
    const hasNpm = await commandExists('npm');

    if (!hasNpm) {
      return createResult('aleo.env.npm', 'fail', 'npm is not available in PATH.', Date.now() - startedAt);
    }

    const version = await getCommandVersion('npm', ['--version']);

    return createResult(
      'aleo.env.npm',
      'pass',
      version ? `npm ${version} detected for Aleo project setup.` : 'npm detected for Aleo project setup.',
      Date.now() - startedAt,
      version ? { version } : undefined
    );
  }
};

function buildAleoToolchainCheck(
  command: 'leo' | 'snarkos',
  id: 'aleo.toolchain.leo' | 'aleo.toolchain.snarkos',
  binaryKey: 'leoBinaryPath' | 'snarkosBinaryPath'
): DoctorCheck {
  return {
    id,
    title: `${command} toolchain readiness`,
    category: 'toolchain',
    description: `Checks whether ${command} is installed for Aleo development workflows.`,
    async run(context) {
      const startedAt = Date.now();

      try {
        const config = getConfigOrError(context);
        const binaryPath = resolveBinaryPath(config.toolchain[binaryKey], command);
        const exists = await commandExists(binaryPath);

        if (!exists) {
          return createResult(
            id,
            'warn',
            `${command} is not installed or not reachable via ${binaryPath}.`,
            Date.now() - startedAt,
            {
              command,
              configuredBinaryPath: config.toolchain[binaryKey] ?? null
            }
          );
        }

        const version = await getCommandVersion(binaryPath, ['--version']);

        return createResult(
          id,
          'pass',
          version ? `${command} detected and ready: ${version}.` : `${command} detected and ready.`,
          Date.now() - startedAt,
          {
            command,
            configuredBinaryPath: config.toolchain[binaryKey] ?? null,
            version
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Aleo configuration is unavailable.';
        return createResult(id, 'fail', message, Date.now() - startedAt);
      }
    }
  };
}

export const leoCheck = buildAleoToolchainCheck('leo', 'aleo.toolchain.leo', 'leoBinaryPath');
export const snarkosCheck = buildAleoToolchainCheck('snarkos', 'aleo.toolchain.snarkos', 'snarkosBinaryPath');

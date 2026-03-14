import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { commandExists, getCommandVersion } from './helpers.js';

const MIN_NODE_MAJOR = 18;

export const nodeVersionCheck: DoctorCheck = {
  id: 'env.node',
  title: 'Node.js version',
  category: 'env',
  description: 'Validates that the local Node.js version meets the minimum requirement.',
  async run() {
    const startedAt = Date.now();
    const majorVersion = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

    if (majorVersion >= MIN_NODE_MAJOR) {
      return createResult('env.node', 'pass', `Node.js ${process.versions.node} is supported.`, Date.now() - startedAt);
    }

    return createResult(
      'env.node',
      'fail',
      `Node.js ${process.versions.node} is below required major ${MIN_NODE_MAJOR}.`,
      Date.now() - startedAt
    );
  }
};

export const npmCheck: DoctorCheck = {
  id: 'env.npm',
  title: 'npm availability',
  category: 'env',
  description: 'Checks npm presence and reports its version.',
  async run() {
    const startedAt = Date.now();
    const hasNpm = await commandExists('npm');

    if (!hasNpm) {
      return createResult('env.npm', 'fail', 'npm is not available in PATH.', Date.now() - startedAt);
    }

    const version = await getCommandVersion('npm', ['--version']);

    return createResult(
      'env.npm',
      'pass',
      version ? `npm ${version} detected.` : 'npm detected.',
      Date.now() - startedAt,
      version ? { version } : undefined
    );
  }
};

function buildOptionalToolCheck(command: 'leo' | 'snarkos'): DoctorCheck {
  return {
    id: `env.${command}`,
    title: `${command} availability`,
    category: 'env',
    description: `Checks if ${command} is available in PATH.`,
    async run() {
      const startedAt = Date.now();
      const exists = await commandExists(command);

      if (!exists) {
        return createResult(
          `env.${command}`,
          'warn',
          `${command} is not installed or not in PATH.`,
          Date.now() - startedAt
        );
      }

      return createResult(`env.${command}`, 'pass', `${command} is available.`, Date.now() - startedAt);
    }
  };
}

export const leoCheck = buildOptionalToolCheck('leo');
export const snarkosCheck = buildOptionalToolCheck('snarkos');

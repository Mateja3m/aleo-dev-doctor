import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { commandExists, getCommandVersion } from './helpers.js';

const MIN_NODE_MAJOR = 18;

export const nodeVersionCheck: DoctorCheck = {
  id: 'aleo.env.node',
  title: 'Node.js runtime',
  category: 'env',
  description: 'Validates that the Node.js runtime supports Aleo developer tooling.',
  layer: 'foundation',
  async run() {
    const startedAt = Date.now();
    const majorVersion = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

    if (majorVersion >= MIN_NODE_MAJOR) {
      return createResult(
        'aleo.env.node',
        'pass',
        `Node.js ${process.versions.node} is ready for Aleo developer tooling.`,
        Date.now() - startedAt,
        { version: process.versions.node, minimumMajor: MIN_NODE_MAJOR },
        'foundation'
      );
    }

    return createResult(
      'aleo.env.node',
      'fail',
      `Node.js ${process.versions.node} is below the Aleo doctor minimum major ${MIN_NODE_MAJOR}.`,
      Date.now() - startedAt,
      { version: process.versions.node, minimumMajor: MIN_NODE_MAJOR },
      'foundation'
    );
  }
};

export const npmCheck: DoctorCheck = {
  id: 'aleo.env.npm',
  title: 'npm availability',
  category: 'env',
  description: 'Checks npm presence for installing Aleo development dependencies and demos.',
  layer: 'foundation',
  async run() {
    const startedAt = Date.now();
    const hasNpm = await commandExists('npm');

    if (!hasNpm) {
      return createResult('aleo.env.npm', 'fail', 'npm is not available in PATH.', Date.now() - startedAt, undefined, 'foundation');
    }

    const version = await getCommandVersion('npm', ['--version']);

    return createResult(
      'aleo.env.npm',
      'pass',
      version ? `npm ${version} detected for Aleo project setup.` : 'npm detected for Aleo project setup.',
      Date.now() - startedAt,
      version ? { version } : undefined,
      'foundation'
    );
  }
};

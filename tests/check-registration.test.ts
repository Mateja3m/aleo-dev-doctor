import { describe, expect, it } from 'vitest';

import { listAleoCheckIds } from '../src/checks/index.js';

describe('Aleo check registration', () => {
  it('registers stable Aleo check identifiers', () => {
    expect(listAleoCheckIds()).toEqual([
      'aleo.env.node',
      'aleo.env.npm',
      'aleo.toolchain.leo',
      'aleo.toolchain.snarkos',
      'aleo.config.schema',
      'aleo.network.rpc',
      'aleo.account.readiness',
      'aleo.workflow.compile',
      'aleo.workflow.execute'
    ]);
  });
});

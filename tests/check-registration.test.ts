import { describe, expect, it } from 'vitest';

import { listAleoCheckIds } from '../src/checks/index.js';

describe('Aleo check registration', () => {
  it('registers stable Aleo check identifiers', () => {
    expect(listAleoCheckIds()).toEqual([
      'env.node',
      'env.npm',
      'env.leo',
      'env.snarkos',
      'config.base',
      'network.rpc',
      'wallet.env',
      'workflow.baseline'
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import { listAleoCheckIds } from '../src/checks/index.js';

describe('Aleo check registration', () => {
  it('registers stable Aleo check identifiers', () => {
    expect(listAleoCheckIds()).toEqual([
      'aleo.env.node',
      'aleo.env.npm',
      'aleo.config.schema',
      'aleo.leo.version',
      'aleo.leo.build',
      'aleo.leo.run',
      'aleo.zk.execute',
      'aleo.zk.proof',
      'aleo.zk.verify',
      'aleo.snarkos.binary',
      'aleo.snarkos.rpc',
      'aleo.account.private_key',
      'aleo.account.transaction',
      'aleo.program.artifacts'
    ]);
  });
});

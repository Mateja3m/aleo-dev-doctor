import type { AleoDoctorConfig } from '../domain.js';

export const DEFAULT_CONFIG: AleoDoctorConfig = {
  chain: 'aleo',
  toolchain: {},
  network: {
    name: process.env.ALEO_NETWORK ?? 'testnet',
    rpcUrl: process.env.ALEO_RPC_URL ?? 'https://api.explorer.aleo.org/v1',
    timeoutMs: 5000
  },
  account: {
    privateKeyEnvVar: 'ALEO_PRIVATE_KEY',
    addressEnvVar: 'ALEO_ADDRESS',
    viewKeyEnvVar: 'ALEO_VIEW_KEY'
  },
  workflow: {
    fixturePath: 'fixtures/sample-program',
    compileArgs: ['build'],
    runArgs: ['run', 'main', '5u32'],
    executionMode: 'placeholder'
  }
};

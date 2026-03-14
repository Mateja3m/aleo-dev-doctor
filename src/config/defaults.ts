import type { AleoDoctorConfig } from '../domain.js';

export const DEFAULT_CONFIG: AleoDoctorConfig = {
  chain: 'aleo',
  network: {
    rpcUrl: process.env.ALEO_RPC_URL ?? 'https://api.explorer.aleo.org/v1',
    timeoutMs: 5000
  },
  wallet: {
    privateKeyEnvVar: 'ALEO_PRIVATE_KEY'
  }
};

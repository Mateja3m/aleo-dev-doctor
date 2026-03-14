import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadAleoDoctorConfig } from '../src/config/load-config.js';

describe('config validation', () => {
  it('loads defaults when config file does not exist', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'aleo-doctor-default-'));
    try {
      const config = loadAleoDoctorConfig(cwd);
      expect(config.chain).toBe('aleo');
      expect(config.network.rpcUrl.length).toBeGreaterThan(0);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('throws for invalid config schema', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'aleo-doctor-invalid-'));
    const configPath = path.join(cwd, 'aleo-doctor.config.json');

    try {
      writeFileSync(
        configPath,
        JSON.stringify({
          chain: 'aleo',
          network: { rpcUrl: 'not-url', timeoutMs: -1 },
          wallet: { privateKeyEnvVar: '' }
        })
      );

      expect(() => loadAleoDoctorConfig(cwd)).toThrow(/Invalid Aleo doctor config/);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});

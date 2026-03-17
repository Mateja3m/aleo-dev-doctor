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
      expect(config.workflow.fixturePath).toBe('fixtures/sample-program');
      expect(config.workflow.runArgs).toEqual(['run', 'main', '5u32']);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('merges partial Aleo config files with defaults', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'aleo-doctor-partial-'));
    const configPath = path.join(cwd, 'aleo-doctor.config.json');

    try {
      writeFileSync(
        configPath,
        JSON.stringify({
          network: { name: 'mainnet', rpcUrl: 'https://example.com/rpc' },
          workflow: { compileArgs: ['build'] }
        })
      );

      const config = loadAleoDoctorConfig(cwd);
      expect(config.network.name).toBe('mainnet');
      expect(config.network.timeoutMs).toBe(5000);
      expect(config.account.privateKeyEnvVar).toBe('ALEO_PRIVATE_KEY');
      expect(config.workflow.fixturePath).toBe('fixtures/sample-program');
      expect(config.workflow.runArgs).toEqual(['run', 'main', '5u32']);
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
          account: { privateKeyEnvVar: '', addressEnvVar: '' }
        })
      );

      expect(() => loadAleoDoctorConfig(cwd)).toThrow(/Invalid Aleo doctor config/);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});

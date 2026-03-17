import { describe, expect, it } from 'vitest';

import { parseCommandInput } from '../src/adapters/cli-kit.js';
import { runDoctorCommand } from '../src/commands/run-command.js';

describe('command behavior', () => {
  it('parses command flags', () => {
    const parsed = parseCommandInput(['node', 'doctor', 'config', '--json', '--config', './custom.json']);

    expect(parsed).toEqual({
      command: 'config',
      flags: {
        json: true,
        configPath: './custom.json'
      }
    });
  });

  it('returns JSON output when --json is enabled', async () => {
    const result = await runDoctorCommand({
      command: 'config',
      flags: { json: true }
    });

    const parsed = JSON.parse(result.text) as { chain: string; results: unknown[] };
    expect(parsed.chain).toBe('aleo');
    expect(parsed.results.length).toBe(1);
  });

  it('parses workflow command', () => {
    const parsed = parseCommandInput(['node', 'aleo-doctor', 'workflow']);
    expect(parsed?.command).toBe('workflow');
  });

  it('parses zk command', () => {
    const parsed = parseCommandInput(['node', 'aleo-doctor', 'zk']);
    expect(parsed?.command).toBe('zk');
  });

  it('returns ZK workflow checks in JSON reports', async () => {
    process.env.ALEO_DOCTOR_MOCK_EXECUTE = 'pass';
    process.env.ALEO_DOCTOR_MOCK_PROOF = 'pass';
    process.env.ALEO_DOCTOR_MOCK_VERIFY = 'pass';

    try {
      const result = await runDoctorCommand({
        command: 'zk',
        flags: { json: true }
      });

      const parsed = JSON.parse(result.text) as {
        zkReadiness: Record<string, string>;
        layers: Record<string, Array<{ checkId: string; status: string }>>;
        results: Array<{ checkId: string; status: string; details?: Record<string, unknown> }>;
      };

      expect(parsed.results.map((item) => item.checkId)).toEqual([
        'aleo.zk.execute',
        'aleo.zk.proof',
        'aleo.zk.verify'
      ]);
      expect(parsed.results.every((item) => item.status === 'pass')).toBe(true);
      expect(parsed.zkReadiness).toMatchObject({
        execution: 'pass',
        proof: 'pass',
        verification: 'pass'
      });
      expect(parsed.layers.zk).toHaveLength(3);
    } finally {
      delete process.env.ALEO_DOCTOR_MOCK_EXECUTE;
      delete process.env.ALEO_DOCTOR_MOCK_PROOF;
      delete process.env.ALEO_DOCTOR_MOCK_VERIFY;
    }
  });

  it('keeps account readiness JSON details secret-safe', async () => {
    process.env.ALEO_PRIVATE_KEY = 'APrivateKey1ABCDEFGHIJKLMNOPQRSTUV';
    process.env.ALEO_ADDRESS = 'aleo1address';

    try {
      const result = await runDoctorCommand({
        command: 'wallet',
        flags: { json: true }
      });

      const parsed = JSON.parse(result.text) as {
        results: Array<{ checkId: string; details?: Record<string, unknown> }>;
      };

      expect(parsed.results[0]?.checkId).toBe('aleo.account.private_key');
      expect(parsed.results[0]?.details).toMatchObject({
        privateKeyEnvVar: 'ALEO_PRIVATE_KEY',
        present: true
      });
      expect(result.text).not.toContain('APrivateKey1ABCDEFGHIJKLMNOPQRSTUV');
    } finally {
      delete process.env.ALEO_PRIVATE_KEY;
      delete process.env.ALEO_ADDRESS;
    }
  });

  it('keeps zk verify at warn when compiled artifacts are missing', async () => {
    const result = await runDoctorCommand({
      command: 'zk',
      flags: { json: true }
    });

    const parsed = JSON.parse(result.text) as {
      zkReadiness: Record<string, string>;
      results: Array<{ checkId: string; status: string }>;
    };

    expect(parsed.zkReadiness.verification).toBe('warn');
    expect(parsed.results.find((item) => item.checkId === 'aleo.zk.verify')?.status).toBe('warn');
  });
});

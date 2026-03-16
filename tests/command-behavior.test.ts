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

  it('returns Aleo-specific workflow checks in JSON reports', async () => {
    process.env.ALEO_DOCTOR_MOCK_COMPILE = 'pass';
    process.env.ALEO_DOCTOR_MOCK_EXECUTE = 'pass';

    try {
      const result = await runDoctorCommand({
        command: 'workflow',
        flags: { json: true }
      });

      const parsed = JSON.parse(result.text) as {
        results: Array<{ checkId: string; status: string; details?: Record<string, unknown> }>;
      };

      expect(parsed.results.map((item) => item.checkId)).toEqual([
        'aleo.workflow.compile',
        'aleo.workflow.execute'
      ]);
      expect(parsed.results.every((item) => item.status === 'pass')).toBe(true);
    } finally {
      delete process.env.ALEO_DOCTOR_MOCK_COMPILE;
      delete process.env.ALEO_DOCTOR_MOCK_EXECUTE;
    }
  });

  it('keeps account readiness JSON details secret-safe', async () => {
    process.env.ALEO_PRIVATE_KEY = 'super-secret';
    process.env.ALEO_ADDRESS = 'aleo1address';

    try {
      const result = await runDoctorCommand({
        command: 'wallet',
        flags: { json: true }
      });

      const parsed = JSON.parse(result.text) as {
        results: Array<{ checkId: string; details?: Record<string, unknown> }>;
      };

      expect(parsed.results[0]?.checkId).toBe('aleo.account.readiness');
      expect(parsed.results[0]?.details).toMatchObject({
        hasPrivateKey: true,
        hasAddress: true,
        privateKeyEnvVar: 'ALEO_PRIVATE_KEY',
        addressEnvVar: 'ALEO_ADDRESS'
      });
      expect(result.text).not.toContain('super-secret');
    } finally {
      delete process.env.ALEO_PRIVATE_KEY;
      delete process.env.ALEO_ADDRESS;
    }
  });
});

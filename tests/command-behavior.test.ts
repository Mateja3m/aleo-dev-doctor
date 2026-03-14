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
});

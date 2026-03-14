import * as cliKit from '@idoa/dev-doctor-cli-kit';

import type { CommandInput } from '../domain.js';

export function parseCommandInput(argv: string[]): CommandInput | null {
  const parseArgs = (
    cliKit as unknown as {
      parseArgs?: (input: string[]) => { command: string; flags: Record<string, string | boolean | undefined> };
    }
  ).parseArgs;

  if (typeof parseArgs === 'function') {
    const parsed = parseArgs(argv);
    const json = parsed.flags.json === true;
    const configPath = typeof parsed.flags.config === 'string' ? parsed.flags.config : undefined;
    if (!isSupportedCommand(parsed.command)) {
      return null;
    }

    const flags = configPath ? { json, configPath } : { json };
    return { command: parsed.command, flags };
  }

  return parseCommandInputFallback(argv);
}

function parseCommandInputFallback(argv: string[]): CommandInput | null {
  const [, , commandArg, ...rest] = argv;
  if (!isSupportedCommand(commandArg)) {
    return null;
  }

  let json = false;
  let configPath: string | undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--json') {
      json = true;
      continue;
    }

    if (token === '--config') {
      const next = rest[index + 1];
      if (next && !next.startsWith('--')) {
        configPath = next;
        index += 1;
      }
    }
  }

  const flags = configPath ? { json, configPath } : { json };
  return { command: commandArg, flags };
}

function isSupportedCommand(value: string | undefined): value is CommandInput['command'] {
  return (
    value === 'env' ||
    value === 'config' ||
    value === 'network' ||
    value === 'wallet' ||
    value === 'workflow' ||
    value === 'report'
  );
}

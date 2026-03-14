#!/usr/bin/env node

import { parseCommandInput } from './adapters/cli-kit.js';
import { HELP_TEXT } from './commands/help.js';
import { runDoctorCommand } from './commands/run-command.js';

export async function runCli(argv: string[]): Promise<number> {
  const input = parseCommandInput(argv);

  if (!input) {
    console.log(HELP_TEXT);
    return 1;
  }

  const result = await runDoctorCommand(input);
  console.log(result.text);
  return result.exitCode;
}

void runCli(process.argv).then((exitCode) => {
  process.exitCode = exitCode;
});

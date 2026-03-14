import { getChecksForCommand } from '../checks/index.js';
import { loadAleoDoctorConfig } from '../config/load-config.js';
import type { CommandInput, CommandResult, DoctorContext, ProcessLike } from '../domain.js';
import { createDoctorReport } from '../reporting/create-report.js';
import { toTerminalReport } from '../reporting/format-report.js';

export async function runDoctorCommand(
  input: CommandInput,
  processLike: ProcessLike = process
): Promise<CommandResult> {
  loadAleoDoctorConfig(processLike.cwd(), input.flags.configPath);

  const context: DoctorContext = {
    chain: 'aleo',
    cwd: processLike.cwd(),
    requestTimeoutMs: 5000
  };
  if (input.flags.configPath) {
    context.configPath = input.flags.configPath;
  }

  const checks = getChecksForCommand(input.command);
  const results = [];

  for (const check of checks) {
    results.push(await check.run(context));
  }

  const report = createDoctorReport(results);

  return {
    report,
    text: input.flags.json ? JSON.stringify(report, null, 2) : toTerminalReport(report),
    exitCode: report.summary.fail > 0 ? 1 : 0
  };
}

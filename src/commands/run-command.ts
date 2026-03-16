import { getChecksForCommand } from '../checks/index.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';
import { loadAleoDoctorConfig } from '../config/load-config.js';
import type { CommandInput, CommandResult, DoctorContext, ProcessLike } from '../domain.js';
import { createDoctorReport } from '../reporting/create-report.js';
import { toTerminalReport } from '../reporting/format-report.js';

export async function runDoctorCommand(
  input: CommandInput,
  processLike: ProcessLike = process
): Promise<CommandResult> {
  let config: DoctorContext['config'];
  let configError: DoctorContext['configError'];

  try {
    config = loadAleoDoctorConfig(processLike.cwd(), input.flags.configPath);
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Aleo configuration could not be loaded.';
  }

  const context: DoctorContext = {
    chain: 'aleo',
    cwd: processLike.cwd(),
    requestTimeoutMs: config?.network.timeoutMs ?? DEFAULT_CONFIG.network.timeoutMs
  };
  if (input.flags.configPath) {
    context.configPath = input.flags.configPath;
  }
  if (config) {
    context.config = config;
  }
  if (configError) {
    context.configError = configError;
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

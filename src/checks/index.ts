import type { CommandInput, DoctorCheck } from '../domain.js';

import { configCheck } from './config.check.js';
import { leoCheck, nodeVersionCheck, npmCheck, snarkosCheck } from './env.checks.js';
import { networkReachabilityCheck } from './network.check.js';
import { accountReadinessCheck } from './wallet.check.js';
import { workflowCompileCheck, workflowExecuteCheck } from './workflow.check.js';

const checksByCommand: Record<CommandInput['command'], DoctorCheck[]> = {
  env: [nodeVersionCheck, npmCheck, leoCheck, snarkosCheck],
  config: [configCheck],
  network: [networkReachabilityCheck],
  wallet: [accountReadinessCheck],
  workflow: [workflowCompileCheck, workflowExecuteCheck],
  report: [
    nodeVersionCheck,
    npmCheck,
    leoCheck,
    snarkosCheck,
    configCheck,
    networkReachabilityCheck,
    accountReadinessCheck,
    workflowCompileCheck,
    workflowExecuteCheck
  ]
};

export function getChecksForCommand(command: CommandInput['command']): DoctorCheck[] {
  return checksByCommand[command];
}

export function listAleoCheckIds(): string[] {
  return checksByCommand.report.map((check) => check.id);
}

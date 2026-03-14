import type { CommandInput, DoctorCheck } from '../domain.js';

import { configCheck } from './config.check.js';
import { leoCheck, nodeVersionCheck, npmCheck, snarkosCheck } from './env.checks.js';
import { networkReachabilityCheck } from './network.check.js';
import { walletEnvCheck } from './wallet.check.js';
import { workflowBaselineCheck } from './workflow.check.js';

const checksByCommand: Record<CommandInput['command'], DoctorCheck[]> = {
  env: [nodeVersionCheck, npmCheck, leoCheck, snarkosCheck],
  config: [configCheck],
  network: [networkReachabilityCheck],
  wallet: [walletEnvCheck],
  workflow: [workflowBaselineCheck],
  report: [
    nodeVersionCheck,
    npmCheck,
    leoCheck,
    snarkosCheck,
    configCheck,
    networkReachabilityCheck,
    walletEnvCheck,
    workflowBaselineCheck
  ]
};

export function getChecksForCommand(command: CommandInput['command']): DoctorCheck[] {
  return checksByCommand[command];
}

export function listAleoCheckIds(): string[] {
  return checksByCommand.report.map((check) => check.id);
}

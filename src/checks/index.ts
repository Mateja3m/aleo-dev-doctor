import type { CommandInput, DoctorCheck } from '../domain.js';

import { accountPrivateKeyCheck, accountTransactionReadinessCheck } from './account.check.js';
import { configCheck } from './config.check.js';
import { nodeVersionCheck, npmCheck } from './env.checks.js';
import { leoBuildCheck, leoRunCheck, leoVersionCheck } from './leo.check.js';
import { programArtifactScanCheck } from './program.check.js';
import { snarkosRpcCheck, snarkosToolchainCheck } from './snarkos.check.js';
import { zkExecuteCheck, zkProofCheck, zkVerifyCheck } from './zk-workflow.check.js';

const checksByCommand: Record<CommandInput['command'], DoctorCheck[]> = {
  env: [nodeVersionCheck, npmCheck, leoVersionCheck, snarkosToolchainCheck],
  config: [configCheck],
  network: [snarkosRpcCheck],
  wallet: [accountPrivateKeyCheck, accountTransactionReadinessCheck],
  workflow: [leoBuildCheck, leoRunCheck, zkExecuteCheck, zkProofCheck, zkVerifyCheck, programArtifactScanCheck],
  zk: [zkExecuteCheck, zkProofCheck, zkVerifyCheck],
  report: [
    nodeVersionCheck,
    npmCheck,
    configCheck,
    leoVersionCheck,
    leoBuildCheck,
    leoRunCheck,
    zkExecuteCheck,
    zkProofCheck,
    zkVerifyCheck,
    snarkosToolchainCheck,
    snarkosRpcCheck,
    accountPrivateKeyCheck,
    accountTransactionReadinessCheck,
    programArtifactScanCheck,
  ]
};

export function getChecksForCommand(command: CommandInput['command']): DoctorCheck[] {
  return checksByCommand[command];
}

export function listAleoCheckIds(): string[] {
  return checksByCommand.report.map((check) => check.id);
}

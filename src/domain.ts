import type { CheckStatus } from '@idoa/dev-doctor-types';

export type { CheckStatus };

export interface AleoDoctorConfig {
  chain: 'aleo';
  toolchain: {
    leoBinaryPath?: string | undefined;
    snarkosBinaryPath?: string | undefined;
  };
  network: {
    name: string;
    rpcUrl: string;
    timeoutMs: number;
  };
  account: {
    privateKeyEnvVar: string;
    addressEnvVar: string;
    viewKeyEnvVar?: string | undefined;
  };
  workflow: {
    fixturePath: string;
    compileArgs: string[];
    runArgs: string[];
    executionMode: 'placeholder' | 'mock';
  };
}

export interface CommandFlags {
  json: boolean;
  configPath?: string;
}

export interface CommandInput {
  command: 'env' | 'config' | 'network' | 'wallet' | 'workflow' | 'zk' | 'report';
  flags: CommandFlags;
}

export interface CommandResult {
  report: DoctorReport;
  text: string;
  exitCode: number;
}

export interface DoctorCheckResult {
  checkId: string;
  status: CheckStatus;
  message: string;
  details?: Record<string, unknown>;
  durationMs: number;
  layer?: DoctorLayer;
}

export interface DoctorContext {
  chain: string;
  cwd: string;
  configPath?: string;
  requestTimeoutMs: number;
  config?: AleoDoctorConfig;
  configError?: string;
}

export interface DoctorCheck {
  id: string;
  title: string;
  category: string;
  description: string;
  layer: DoctorLayer;
  run(context: DoctorContext): Promise<DoctorCheckResult>;
}

export type DoctorLayer = 'foundation' | 'leo' | 'zk' | 'snarkos' | 'account' | 'program';

export interface DoctorSummary {
  pass: number;
  warn: number;
  fail: number;
  skip: number;
  total: number;
}

export interface DoctorReport {
  chain: string;
  generatedAt: string;
  summary: DoctorSummary;
  results: DoctorCheckResult[];
  layers: Record<DoctorLayer, DoctorCheckResult[]>;
  zkReadiness: {
    compile: CheckStatus;
    execution: CheckStatus;
    proof: CheckStatus;
    verification: CheckStatus;
  };
}

export interface ProcessLike {
  env: NodeJS.ProcessEnv;
  cwd(): string;
}

export function createResult(
  checkId: string,
  status: CheckStatus,
  message: string,
  durationMs: number,
  details?: Record<string, unknown>,
  layer?: DoctorLayer
): DoctorCheckResult {
  const base: DoctorCheckResult = { checkId, status, message, durationMs };
  if (details) {
    base.details = details;
  }
  if (layer) {
    base.layer = layer;
  }
  return base;
}

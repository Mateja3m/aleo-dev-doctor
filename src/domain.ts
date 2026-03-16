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
    executionMode: 'placeholder' | 'mock';
  };
}

export interface CommandFlags {
  json: boolean;
  configPath?: string;
}

export interface CommandInput {
  command: 'env' | 'config' | 'network' | 'wallet' | 'workflow' | 'report';
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
  run(context: DoctorContext): Promise<DoctorCheckResult>;
}

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
  details?: Record<string, unknown>
): DoctorCheckResult {
  const base: DoctorCheckResult = { checkId, status, message, durationMs };
  if (details) {
    base.details = details;
  }
  return base;
}

import { execFile } from 'node:child_process';
import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { AleoDoctorConfig, CheckStatus, DoctorContext } from '../domain.js';

const execFileAsync = promisify(execFile);

export async function commandExists(command: string): Promise<boolean> {
  try {
    const executable = process.platform === 'win32' ? 'where' : 'which';
    await execFileAsync(executable, [command]);
    return true;
  } catch {
    return false;
  }
}

export async function getCommandVersion(command: string, args: string[] = ['--version']): Promise<string | null> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args);
    const text = `${stdout}${stderr}`.trim();
    return text.length > 0 ? text.split('\n')[0] ?? text : null;
  } catch {
    return null;
  }
}

export async function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeoutMs?: number;
  } = {}
): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: options.cwd,
    timeout: options.timeoutMs
  });

  return { stdout, stderr };
}

export function getConfigOrError(context: DoctorContext): AleoDoctorConfig {
  if (context.config) {
    return context.config;
  }

  throw new Error(context.configError ?? 'Aleo configuration could not be loaded.');
}

export function resolveBinaryPath(configuredPath: string | undefined, fallbackCommand: string): string {
  return configuredPath?.trim() ? configuredPath : fallbackCommand;
}

export function resolveFixturePath(cwd: string, fixturePath: string): string {
  return path.resolve(cwd, fixturePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function formatPathForDetails(cwd: string, targetPath: string): string {
  return path.relative(cwd, targetPath) || '.';
}

export async function findFilesByExtension(rootPath: string, extension: string): Promise<string[]> {
  const matches: string[] = [];
  await walk(rootPath, matches, extension);
  return matches;
}

async function walk(rootPath: string, matches: string[], extension: string): Promise<void> {
  const entries = await readdir(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, matches, extension);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      matches.push(fullPath);
    }
  }
}

export async function directoryExists(targetPath: string): Promise<boolean> {
  try {
    const target = await stat(targetPath);
    return target.isDirectory();
  } catch {
    return false;
  }
}

export function summarizeStatuses(statuses: CheckStatus[]): CheckStatus {
  if (statuses.includes('fail')) {
    return 'fail';
  }

  if (statuses.includes('warn')) {
    return 'warn';
  }

  if (statuses.includes('skip')) {
    return 'skip';
  }

  return 'pass';
}

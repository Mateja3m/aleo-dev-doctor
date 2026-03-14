import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

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
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

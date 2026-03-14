import { formatReport } from '../adapters/reporter.js';
import type { DoctorReport } from '../domain.js';

export function toTerminalReport(report: DoctorReport): string {
  return formatReport(report);
}

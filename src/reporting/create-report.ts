import { summarize } from '../adapters/core.js';
import type { DoctorCheckResult, DoctorReport } from '../domain.js';

export function createDoctorReport(results: DoctorCheckResult[]): DoctorReport {
  return {
    chain: 'aleo',
    generatedAt: new Date().toISOString(),
    summary: summarize(results),
    results
  };
}

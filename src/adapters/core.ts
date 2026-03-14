import * as idoaCore from '@idoa/dev-doctor-core';

import type { DoctorCheckResult, DoctorSummary } from '../domain.js';

export function summarize(results: DoctorCheckResult[]): DoctorSummary {
  const aggregateResults = (
    idoaCore as unknown as {
      aggregateResults?: (
        input: Array<{
          id: string;
          title: string;
          status: 'pass' | 'warn' | 'fail' | 'skip';
          severity: 'info' | 'warning' | 'error' | 'critical';
          durationMs: number;
          messages: Array<{ code: string; message: string; details?: Record<string, unknown> }>;
        }>
      ) => { passed: number; warned: number; failed: number; skipped: number; total: number };
    }
  ).aggregateResults;

  if (typeof aggregateResults === 'function') {
    const summary = aggregateResults(
      results.map((result) => ({
        id: result.checkId,
        title: result.checkId,
        status: result.status,
        severity: result.status === 'fail' ? 'error' : result.status === 'warn' ? 'warning' : 'info',
        durationMs: result.durationMs,
        messages: [
          result.details
            ? { code: 'RESULT', message: result.message, details: result.details }
            : { code: 'RESULT', message: result.message }
        ]
      }))
    );

    return {
      pass: summary.passed,
      warn: summary.warned,
      fail: summary.failed,
      skip: summary.skipped,
      total: summary.total
    };
  }

  return results.reduce<DoctorSummary>(
    (acc, result) => {
      acc[result.status] += 1;
      acc.total += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, skip: 0, total: 0 }
  );
}

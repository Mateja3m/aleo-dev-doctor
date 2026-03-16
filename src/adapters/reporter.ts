import * as idoaReporter from '@idoa/dev-doctor-reporter';

import type { DoctorReport } from '../domain.js';

export function formatReport(report: DoctorReport): string {
  const createTerminalReport = (
    idoaReporter as unknown as {
      createTerminalReport?: (input: {
        startedAt: string;
        finishedAt: string;
        durationMs: number;
        summary: {
          total: number;
          passed: number;
          warned: number;
          failed: number;
          skipped: number;
          highestSeverity: 'info' | 'warning' | 'error' | 'critical';
        };
        results: Array<{
          id: string;
          title: string;
          status: 'pass' | 'warn' | 'fail' | 'skip';
          severity: 'info' | 'warning' | 'error' | 'critical';
          durationMs: number;
          messages: Array<{ code: string; message: string; details?: Record<string, unknown> }>;
        }>;
      }) => string;
    }
  ).createTerminalReport;

  const readinessLine = createReadinessLine(report);

  if (typeof createTerminalReport === 'function') {
    const body = createTerminalReport({
      startedAt: report.generatedAt,
      finishedAt: report.generatedAt,
      durationMs: report.results.reduce((acc, item) => acc + item.durationMs, 0),
      summary: {
        total: report.summary.total,
        passed: report.summary.pass,
        warned: report.summary.warn,
        failed: report.summary.fail,
        skipped: report.summary.skip,
        highestSeverity: report.summary.fail > 0 ? 'error' : report.summary.warn > 0 ? 'warning' : 'info'
      },
      results: report.results.map((item) => ({
        id: item.checkId,
        title: item.checkId,
        status: item.status,
        severity: item.status === 'fail' ? 'error' : item.status === 'warn' ? 'warning' : 'info',
        durationMs: item.durationMs,
        messages: [
          item.details
            ? { code: 'RESULT', message: item.message, details: item.details }
            : { code: 'RESULT', message: item.message }
        ]
      }))
    });

    return `${readinessLine}\n${body}`;
  }

  const lines: string[] = [];
  lines.push(`Aleo Dev Doctor Report (${report.generatedAt})`);
  lines.push(readinessLine);
  lines.push(
    `Summary: ${report.summary.pass} pass, ${report.summary.warn} warn, ${report.summary.fail} fail, ${report.summary.skip} skip`
  );
  lines.push('');

  for (const result of report.results) {
    lines.push(`- [${result.status.toUpperCase()}] ${result.checkId}: ${result.message}`);
  }

  return lines.join('\n');
}

function createReadinessLine(report: DoctorReport): string {
  if (report.summary.fail > 0) {
    return 'Aleo zero-knowledge development readiness: blocked by failing checks.';
  }

  if (report.summary.warn > 0) {
    return 'Aleo zero-knowledge development readiness: partially ready, with follow-up actions.';
  }

  return 'Aleo zero-knowledge development readiness: ready.';
}

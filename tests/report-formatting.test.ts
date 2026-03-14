import { describe, expect, it } from 'vitest';

import type { DoctorCheckResult } from '../src/domain.js';
import { createDoctorReport } from '../src/reporting/create-report.js';
import { toTerminalReport } from '../src/reporting/format-report.js';

describe('report formatting', () => {
  it('formats a readable terminal report', () => {
    const results: DoctorCheckResult[] = [
      {
        checkId: 'env.node',
        status: 'pass',
        message: 'ok',
        durationMs: 10
      }
    ];

    const report = createDoctorReport(results);
    const text = toTerminalReport(report);

    expect(text).toContain('Report');
    expect(text).toContain('env.node');
  });
});

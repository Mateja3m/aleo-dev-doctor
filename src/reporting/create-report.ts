import { summarize } from '../adapters/core.js';
import type { CheckStatus, DoctorCheckResult, DoctorLayer, DoctorReport } from '../domain.js';

export function createDoctorReport(results: DoctorCheckResult[]): DoctorReport {
  const layers = groupByLayer(results);

  return {
    chain: 'aleo',
    generatedAt: new Date().toISOString(),
    summary: summarize(results),
    results,
    layers,
    zkReadiness: {
      compile: getStatus(results, 'aleo.leo.build'),
      execution: getStatus(results, 'aleo.zk.execute'),
      proof: getStatus(results, 'aleo.zk.proof'),
      verification: getStatus(results, 'aleo.zk.verify')
    }
  };
}

function groupByLayer(results: DoctorCheckResult[]): Record<DoctorLayer, DoctorCheckResult[]> {
  return {
    foundation: results.filter((result) => result.layer === 'foundation'),
    leo: results.filter((result) => result.layer === 'leo'),
    zk: results.filter((result) => result.layer === 'zk'),
    snarkos: results.filter((result) => result.layer === 'snarkos'),
    account: results.filter((result) => result.layer === 'account'),
    program: results.filter((result) => result.layer === 'program')
  };
}

function getStatus(results: DoctorCheckResult[], checkId: string): CheckStatus {
  return results.find((result) => result.checkId === checkId)?.status ?? 'skip';
}

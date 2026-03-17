import path from 'node:path';

import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import {
  fileExists,
  formatPathForDetails,
  getConfigOrError,
  resolveFixturePath,
  summarizeStatuses
} from './helpers.js';

const MOCK_EXECUTE_ENV = 'ALEO_DOCTOR_MOCK_EXECUTE';
const MOCK_PROOF_ENV = 'ALEO_DOCTOR_MOCK_PROOF';
const MOCK_VERIFY_ENV = 'ALEO_DOCTOR_MOCK_VERIFY';

function resolveFixture(context: Parameters<DoctorCheck['run']>[0]) {
  const config = getConfigOrError(context);
  const fixturePath = resolveFixturePath(context.cwd, config.workflow.fixturePath);
  return { config, fixturePath };
}

export const zkExecuteCheck: DoctorCheck = {
  id: 'aleo.zk.execute',
  title: 'ZK execution readiness',
  category: 'zk',
  description: 'Validates that the sample program has execution inputs and an execution path.',
  layer: 'zk',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { fixturePath } = resolveFixture(context);
      const executionConfigPath = path.join(fixturePath, 'execution.json');
      const hasExecutionConfig = await fileExists(executionConfigPath);
      const mockStatus = process.env[MOCK_EXECUTE_ENV];

      if (mockStatus === 'pass' || mockStatus === 'fail') {
        return createResult(
          'aleo.zk.execute',
          mockStatus,
          mockStatus === 'pass'
            ? 'ZK execution readiness passed in mock mode.'
            : 'ZK execution readiness failed in mock mode.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), executionConfig: hasExecutionConfig, mockMode: true },
          'zk'
        );
      }

      if (!hasExecutionConfig) {
        return createResult(
          'aleo.zk.execute',
          'warn',
          'No execution.json was found for the sample program. Execution readiness is only partially validated.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), executionConfig: false, placeholder: true },
          'zk'
        );
      }

      return createResult(
        'aleo.zk.execute',
        'pass',
        'Sample program execution inputs are present for Aleo ZK workflow validation.',
        Date.now() - startedAt,
        { fixturePath: formatPathForDetails(context.cwd, fixturePath), executionConfig: true },
        'zk'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ZK execution readiness failed.';
      return createResult('aleo.zk.execute', 'fail', message, Date.now() - startedAt, undefined, 'zk');
    }
  }
};

export const zkProofCheck: DoctorCheck = {
  id: 'aleo.zk.proof',
  title: 'Proof generation readiness',
  category: 'zk',
  description: 'Simulates proof readiness without implementing a full proving system.',
  layer: 'zk',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { fixturePath } = resolveFixture(context);
      const mockStatus = process.env[MOCK_PROOF_ENV];
      const buildArtifactPath = path.join(fixturePath, 'build');
      const buildArtifactsPresent = await fileExists(buildArtifactPath);

      if (mockStatus === 'pass' || mockStatus === 'fail') {
        return createResult(
          'aleo.zk.proof',
          mockStatus,
          mockStatus === 'pass'
            ? 'Proof readiness passed in mock mode.'
            : 'Proof readiness failed in mock mode.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), buildArtifactsPresent, mockMode: true },
          'zk'
        );
      }

      return createResult(
        'aleo.zk.proof',
        buildArtifactsPresent ? 'pass' : 'warn',
        buildArtifactsPresent
          ? 'Proof generation prerequisites are present after fixture build.'
          : 'Proof generation is mock-structured but waiting on a built fixture artifact.',
        Date.now() - startedAt,
        { fixturePath: formatPathForDetails(context.cwd, fixturePath), buildArtifactsPresent, placeholder: !buildArtifactsPresent },
        'zk'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Proof readiness failed.';
      return createResult('aleo.zk.proof', 'fail', message, Date.now() - startedAt, undefined, 'zk');
    }
  }
};

export const zkVerifyCheck: DoctorCheck = {
  id: 'aleo.zk.verify',
  title: 'Verification readiness',
  category: 'zk',
  description: 'Validates verification readiness using fixture metadata and mockable status.',
  layer: 'zk',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { fixturePath } = resolveFixture(context);
      const executionConfigPath = path.join(fixturePath, 'execution.json');
      const buildArtifactPath = path.join(fixturePath, 'build');
      const mockStatus = process.env[MOCK_VERIFY_ENV];
      const hasExecutionConfig = await fileExists(executionConfigPath);
      const buildArtifactsPresent = await fileExists(buildArtifactPath);

      if (mockStatus === 'pass' || mockStatus === 'fail') {
        return createResult(
          'aleo.zk.verify',
          mockStatus,
          mockStatus === 'pass'
            ? 'Verification readiness passed in mock mode.'
            : 'Verification readiness failed in mock mode.',
          Date.now() - startedAt,
          {
            fixturePath: formatPathForDetails(context.cwd, fixturePath),
            executionConfig: hasExecutionConfig,
            buildArtifactsPresent,
            mockMode: true
          },
          'zk'
        );
      }

      const status = summarizeStatuses([
        hasExecutionConfig ? 'pass' : 'warn',
        buildArtifactsPresent ? 'pass' : 'warn'
      ]);

      return createResult(
        'aleo.zk.verify',
        status,
        hasExecutionConfig && buildArtifactsPresent
          ? 'Verification inputs are documented and build artifacts are present for the sample Aleo ZK workflow.'
          : 'Verification readiness remains partial until both execution inputs and compiled artifacts are available.',
        Date.now() - startedAt,
        {
          fixturePath: formatPathForDetails(context.cwd, fixturePath),
          executionConfig: hasExecutionConfig,
          buildArtifactsPresent,
          placeholder: !hasExecutionConfig || !buildArtifactsPresent
        },
        'zk'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification readiness failed.';
      return createResult('aleo.zk.verify', 'fail', message, Date.now() - startedAt, undefined, 'zk');
    }
  }
};

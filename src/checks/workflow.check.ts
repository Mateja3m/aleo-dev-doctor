import path from 'node:path';

import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import {
  commandExists,
  fileExists,
  formatPathForDetails,
  getConfigOrError,
  resolveBinaryPath,
  resolveFixturePath,
  runCommand
} from './helpers.js';

const MOCK_COMPILE_ENV = 'ALEO_DOCTOR_MOCK_COMPILE';
const MOCK_EXECUTE_ENV = 'ALEO_DOCTOR_MOCK_EXECUTE';

export const workflowCompileCheck: DoctorCheck = {
  id: 'aleo.workflow.compile',
  title: 'Leo compile workflow',
  category: 'workflow',
  description: 'Validates that a sample Leo fixture can compile, or reports a safe extension point.',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const fixturePath = resolveFixturePath(context.cwd, config.workflow.fixturePath);
      const fixtureExists = await fileExists(fixturePath);

      if (!fixtureExists) {
        return createResult(
          'aleo.workflow.compile',
          'warn',
          'No Leo workflow fixture was found. Add a sample program to validate compile readiness.',
          Date.now() - startedAt,
          {
            fixturePath: config.workflow.fixturePath,
            resolvedFixturePath: fixturePath,
            placeholder: true
          }
        );
      }

      const compileArgs = config.workflow.compileArgs;
      const mockCompile = process.env[MOCK_COMPILE_ENV];
      if (mockCompile === 'pass' || mockCompile === 'fail') {
        return createResult(
          'aleo.workflow.compile',
          mockCompile,
          mockCompile === 'pass'
            ? 'Leo fixture compile completed in mock mode.'
            : 'Leo fixture compile failed in mock mode.',
          Date.now() - startedAt,
          {
            fixturePath: formatPathForDetails(context.cwd, fixturePath),
            command: ['leo', ...compileArgs].join(' '),
            mockMode: true
          }
        );
      }

      const leoBinary = resolveBinaryPath(config.toolchain.leoBinaryPath, 'leo');
      const hasLeo = await commandExists(leoBinary);
      if (!hasLeo) {
        return createResult(
          'aleo.workflow.compile',
          'warn',
          'Leo fixture is present, but the Leo compiler is not installed. Compile readiness is blocked.',
          Date.now() - startedAt,
          {
            fixturePath: formatPathForDetails(context.cwd, fixturePath),
            command: [leoBinary, ...compileArgs].join(' '),
            configuredBinaryPath: config.toolchain.leoBinaryPath ?? null
          }
        );
      }

      await runCommand(leoBinary, compileArgs, {
        cwd: fixturePath,
        timeoutMs: context.requestTimeoutMs
      });

      return createResult(
        'aleo.workflow.compile',
        'pass',
        'Leo fixture compiled successfully. Aleo workflow compile readiness is validated.',
        Date.now() - startedAt,
        {
          fixturePath: formatPathForDetails(context.cwd, fixturePath),
          command: [leoBinary, ...compileArgs].join(' ')
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leo compile validation failed.';

      return createResult(
        'aleo.workflow.compile',
        'fail',
        `Leo compile readiness failed: ${message}`,
        Date.now() - startedAt
      );
    }
  }
};

export const workflowExecuteCheck: DoctorCheck = {
  id: 'aleo.workflow.execute',
  title: 'Execution workflow extension point',
  category: 'workflow',
  description: 'Provides a lightweight extension point for Aleo execution workflow validation.',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const fixturePath = resolveFixturePath(context.cwd, config.workflow.fixturePath);
      const mockExecute = process.env[MOCK_EXECUTE_ENV];

      if (mockExecute === 'pass' || mockExecute === 'fail') {
        return createResult(
          'aleo.workflow.execute',
          mockExecute,
          mockExecute === 'pass'
            ? 'Aleo execution workflow validation passed in mock mode.'
            : 'Aleo execution workflow validation failed in mock mode.',
          Date.now() - startedAt,
          {
            fixturePath: formatPathForDetails(context.cwd, fixturePath),
            executionMode: 'mock'
          }
        );
      }

      const hasFixture = await fileExists(path.join(fixturePath, 'README.md'));

      return createResult(
        'aleo.workflow.execute',
        'warn',
        'Execution workflow validation is a documented extension point. Use mock mode or add a project-specific runner.',
        Date.now() - startedAt,
        {
          fixturePath: formatPathForDetails(context.cwd, fixturePath),
          fixtureDocumented: hasFixture,
          executionMode: config.workflow.executionMode,
          mockEnvVar: MOCK_EXECUTE_ENV,
          placeholder: true
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution workflow prerequisites are unavailable.';
      return createResult('aleo.workflow.execute', 'fail', message, Date.now() - startedAt);
    }
  }
};

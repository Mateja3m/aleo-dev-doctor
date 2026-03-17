import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import {
  commandExists,
  fileExists,
  formatPathForDetails,
  getCommandVersion,
  getConfigOrError,
  resolveBinaryPath,
  resolveFixturePath,
  runCommand
} from './helpers.js';

const MOCK_COMPILE_ENV = 'ALEO_DOCTOR_MOCK_COMPILE';
const MOCK_RUN_ENV = 'ALEO_DOCTOR_MOCK_RUN';

function getLeoSetup(context: Parameters<DoctorCheck['run']>[0]) {
  const config = getConfigOrError(context);
  const fixturePath = resolveFixturePath(context.cwd, config.workflow.fixturePath);
  const leoBinary = resolveBinaryPath(config.toolchain.leoBinaryPath, 'leo');

  return { config, fixturePath, leoBinary };
}

export const leoVersionCheck: DoctorCheck = {
  id: 'aleo.leo.version',
  title: 'Leo toolchain version',
  category: 'leo',
  description: 'Detects the Leo compiler and captures its version.',
  layer: 'leo',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { config, leoBinary } = getLeoSetup(context);
      const hasLeo = await commandExists(leoBinary);

      if (!hasLeo) {
        return createResult(
          'aleo.leo.version',
          'warn',
          `${leoBinary} is not installed or not reachable.`,
          Date.now() - startedAt,
          { configuredBinaryPath: config.toolchain.leoBinaryPath ?? null },
          'leo'
        );
      }

      const version = await getCommandVersion(leoBinary, ['--version']);
      return createResult(
        'aleo.leo.version',
        'pass',
        version ? `Leo detected: ${version}.` : 'Leo detected.',
        Date.now() - startedAt,
        { configuredBinaryPath: config.toolchain.leoBinaryPath ?? null, version },
        'leo'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leo configuration could not be loaded.';
      return createResult('aleo.leo.version', 'fail', message, Date.now() - startedAt, undefined, 'leo');
    }
  }
};

export const leoBuildCheck: DoctorCheck = {
  id: 'aleo.leo.build',
  title: 'Leo compile readiness',
  category: 'leo',
  description: 'Runs `leo build` against the sample fixture when available.',
  layer: 'leo',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { config, fixturePath, leoBinary } = getLeoSetup(context);
      const fixtureExists = await fileExists(fixturePath);
      if (!fixtureExists) {
        return createResult(
          'aleo.leo.build',
          'warn',
          'Aleo sample fixture is missing, so compile readiness cannot be validated.',
          Date.now() - startedAt,
          { fixturePath: config.workflow.fixturePath, placeholder: true },
          'leo'
        );
      }

      if (process.env[MOCK_COMPILE_ENV] === 'pass' || process.env[MOCK_COMPILE_ENV] === 'fail') {
        const status = process.env[MOCK_COMPILE_ENV] as 'pass' | 'fail';
        return createResult(
          'aleo.leo.build',
          status,
          status === 'pass' ? 'Leo fixture compile completed in mock mode.' : 'Leo fixture compile failed in mock mode.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), command: [leoBinary, ...config.workflow.compileArgs].join(' '), mockMode: true },
          'leo'
        );
      }

      const hasLeo = await commandExists(leoBinary);
      if (!hasLeo) {
        return createResult(
          'aleo.leo.build',
          'warn',
          'Leo fixture is present, but the Leo compiler is not installed. Compile readiness is blocked.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), command: [leoBinary, ...config.workflow.compileArgs].join(' ') },
          'leo'
        );
      }

      await runCommand(leoBinary, config.workflow.compileArgs, {
        cwd: fixturePath,
        timeoutMs: context.requestTimeoutMs
      });

      return createResult(
        'aleo.leo.build',
        'pass',
        'Leo fixture compiled successfully.',
        Date.now() - startedAt,
        { fixturePath: formatPathForDetails(context.cwd, fixturePath), command: [leoBinary, ...config.workflow.compileArgs].join(' ') },
        'leo'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leo build validation failed.';
      return createResult('aleo.leo.build', 'fail', `Leo compile readiness failed: ${message}`, Date.now() - startedAt, undefined, 'leo');
    }
  }
};

export const leoRunCheck: DoctorCheck = {
  id: 'aleo.leo.run',
  title: 'Leo run readiness',
  category: 'leo',
  description: 'Runs `leo run` against the sample fixture when available.',
  layer: 'leo',
  async run(context) {
    const startedAt = Date.now();

    try {
      const { config, fixturePath, leoBinary } = getLeoSetup(context);
      const fixtureExists = await fileExists(fixturePath);
      if (!fixtureExists) {
        return createResult(
          'aleo.leo.run',
          'warn',
          'Aleo sample fixture is missing, so run readiness cannot be validated.',
          Date.now() - startedAt,
          { fixturePath: config.workflow.fixturePath, placeholder: true },
          'leo'
        );
      }

      if (process.env[MOCK_RUN_ENV] === 'pass' || process.env[MOCK_RUN_ENV] === 'fail') {
        const status = process.env[MOCK_RUN_ENV] as 'pass' | 'fail';
        return createResult(
          'aleo.leo.run',
          status,
          status === 'pass' ? 'Leo run completed in mock mode.' : 'Leo run failed in mock mode.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), command: [leoBinary, ...config.workflow.runArgs].join(' '), mockMode: true },
          'leo'
        );
      }

      const hasLeo = await commandExists(leoBinary);
      if (!hasLeo) {
        return createResult(
          'aleo.leo.run',
          'warn',
          'Leo run readiness is blocked because the Leo compiler is not installed.',
          Date.now() - startedAt,
          { fixturePath: formatPathForDetails(context.cwd, fixturePath), command: [leoBinary, ...config.workflow.runArgs].join(' ') },
          'leo'
        );
      }

      const { stdout } = await runCommand(leoBinary, config.workflow.runArgs, {
        cwd: fixturePath,
        timeoutMs: context.requestTimeoutMs
      });

      return createResult(
        'aleo.leo.run',
        'pass',
        'Leo run completed successfully.',
        Date.now() - startedAt,
        {
          fixturePath: formatPathForDetails(context.cwd, fixturePath),
          command: [leoBinary, ...config.workflow.runArgs].join(' '),
          outputPreview: stdout.trim().split('\n').slice(-1)[0] ?? ''
        },
        'leo'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Leo run validation failed.';
      return createResult('aleo.leo.run', 'fail', `Leo run readiness failed: ${message}`, Date.now() - startedAt, undefined, 'leo');
    }
  }
};

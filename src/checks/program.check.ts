import path from 'node:path';

import type { DoctorCheck } from '../domain.js';
import { createResult } from '../domain.js';

import { fileExists, findFilesByExtension, formatPathForDetails, getConfigOrError, resolveFixturePath } from './helpers.js';

export const programArtifactScanCheck: DoctorCheck = {
  id: 'aleo.program.artifacts',
  title: 'Program artifact scan',
  category: 'program',
  description: 'Scans the fixture for compiled `.aleo` artifacts and validates program-level readiness.',
  layer: 'program',
  async run(context) {
    const startedAt = Date.now();

    try {
      const config = getConfigOrError(context);
      const fixturePath = resolveFixturePath(context.cwd, config.workflow.fixturePath);
      const fixtureExists = await fileExists(fixturePath);

      if (!fixtureExists) {
        return createResult(
          'aleo.program.artifacts',
          'warn',
          'Program validation fixture is missing, so `.aleo` artifact scanning could not run.',
          Date.now() - startedAt,
          { fixturePath: config.workflow.fixturePath, placeholder: true },
          'program'
        );
      }

      const artifactRoot = path.join(fixturePath, 'build');
      const artifacts = (await fileExists(artifactRoot)) ? await findFilesByExtension(artifactRoot, '.aleo') : [];

      return createResult(
        'aleo.program.artifacts',
        artifacts.length > 0 ? 'pass' : 'warn',
        artifacts.length > 0
          ? `Detected ${artifacts.length} compiled Aleo program artifact${artifacts.length === 1 ? '' : 's'}.`
          : 'No compiled `.aleo` artifacts were found yet. Run the Leo build step to validate per-program output.',
        Date.now() - startedAt,
        {
          fixturePath: formatPathForDetails(context.cwd, fixturePath),
          artifactCount: artifacts.length,
          artifacts: artifacts.map((artifact) => formatPathForDetails(context.cwd, artifact))
        },
        'program'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Program validation failed.';
      return createResult('aleo.program.artifacts', 'fail', message, Date.now() - startedAt, undefined, 'program');
    }
  }
};

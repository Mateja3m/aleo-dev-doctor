# Aleo Dev Doctor

Open-source diagnostics and onboarding toolkit for Aleo developers.

## Problem

Aleo developers need a fast way to verify local setup, endpoint reachability, and baseline workflow readiness without manually debugging each layer.

## Solution

`@idoa/dev-doctor-aleo` provides a CLI that runs lightweight, safe diagnostics for:
- local environment
- configuration validity
- network connectivity
- wallet/account assumptions
- baseline workflow readiness (placeholder extension point)

It outputs both human-readable terminal summaries and JSON reports.

Shared dependencies are consumed as published npm packages (`@idoa/dev-doctor-*`), not local workspace shims.

## Features

- TypeScript-first CLI (`aleo-doctor`)
- Aleo-specific check registry
- zod-based config validation
- structured report model
- terminal and JSON output modes
- minimal Next.js + MUI demo for proposal walkthroughs

## CLI Commands

When the package is published, commands are available via:

```bash
npx @idoa/dev-doctor-aleo env
```

Before publish, run commands locally from this repository:

```bash
npm run doctor -- env
npm run doctor -- config
npm run doctor -- network
npm run doctor -- wallet
npm run doctor -- workflow
npm run doctor -- report
npm run doctor -- report --json
```

Or link the local binary:

```bash
npm link
aleo-doctor env
```

The command set is:

```bash
aleo-doctor env
aleo-doctor config
aleo-doctor network
aleo-doctor wallet
aleo-doctor workflow
aleo-doctor report
aleo-doctor report --json
```

## Example Output

Plain text:

```text
Aleo Dev Doctor Report (2026-03-11T12:00:00.000Z)
Summary: 5 pass, 2 warn, 0 fail

- [PASS] env.node: Node.js 22.0.0 is supported.
- [PASS] config.base: Configuration is valid.
- [WARN] workflow.baseline: Workflow baseline validated with lightweight checks. Deep protocol workflow validation is a planned extension.
```

JSON:

```json
{
  "chain": "aleo",
  "generatedAt": "2026-03-11T12:00:00.000Z",
  "summary": {
    "pass": 5,
    "warn": 2,
    "fail": 0,
    "skip": 0,
    "total": 7
  },
  "results": [
    {
      "checkId": "workflow.baseline",
      "status": "warn",
      "message": "Workflow baseline validated with lightweight checks. Deep protocol workflow validation is a planned extension.",
      "durationMs": 18,
      "details": {
        "placeholder": true
      }
    }
  ]
}
```

## Architecture

This repository is the Aleo adapter layer on top of shared packages:
- `@idoa/dev-doctor-core`
- `@idoa/dev-doctor-types`
- `@idoa/dev-doctor-utils`
- `@idoa/dev-doctor-reporter`
- `@idoa/dev-doctor-cli-kit`

Wrapper responsibilities in this repo:
- Aleo check composition
- Aleo config defaults/schema
- CLI command routing
- proposal-focused demo and docs


## Current PoC Status

- working CLI commands and report output
- test coverage for registration/config/command/report behavior
- demo app for value explanation and sample reports


## Local Setup

```bash
npm install
npm run build
npm run lint
npm run test
npm run typecheck
```

## Demo

```bash
npm --prefix demo install
npm --prefix demo run dev
```

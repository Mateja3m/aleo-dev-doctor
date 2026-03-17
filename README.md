# Aleo Dev Doctor

Open-source diagnostics toolkit for validating Aleo zero-knowledge development environments.

`aleo-doctor` helps developers building privacy-first Aleo apps verify that their local toolchain, RPC access, account configuration, and Leo workflow setup are ready before they lose time on avoidable environment issues.

## Problem

Aleo onboarding is not just about installing Node.js and running a template.

Zero-knowledge developers typically need to validate multiple layers before productive work can start:

- the Leo compiler must be available
- `snarkos` should be installed for protocol-adjacent local workflows
- RPC access must point at a valid Aleo endpoint
- account-related environment variables must be present without leaking secrets
- compile and execution workflows need at least a baseline readiness check

Without a focused validator, new Aleo developers end up debugging shell paths, malformed config, missing account variables, and broken workflow assumptions one issue at a time.

## Why Aleo Developers Need This

`aleo-doctor` is positioned as a developer enablement tool for the Aleo ecosystem:

- speeds up zero-knowledge developer onboarding
- reduces setup friction for Leo and snarkOS-based workflows
- creates a consistent readiness report for local environments and demos
- supports privacy-first application teams that want safe diagnostics without exposing secrets
- provides a clean adapter layer that can grow into deeper Aleo workflow validation over time

## Aleo Stack Validation

The CLI keeps the existing TypeScript-first adapter architecture and adds explicit Aleo-native checks.

Supported checks today:

- `aleo.env.node`: Node.js runtime compatibility
- `aleo.env.npm`: npm availability for package installation and demo setup
- `aleo.toolchain.leo`: Leo compiler detection and version capture
- `aleo.toolchain.snarkos`: snarkOS detection and version capture
- `aleo.config.schema`: Aleo-specific config parsing and defaults validation
- `aleo.network.rpc`: RPC URL validation and lightweight reachability test
- `aleo.account.readiness`: account environment readiness without exposing secrets
- `aleo.workflow.compile`: fixture-driven Leo compile validation with safe mock mode
- `aleo.workflow.execute`: lightweight execution workflow extension point

## CLI Usage

Published usage:

```bash
npx @idoa/dev-doctor-aleo report
```

Local usage in this repository:

```bash
npm install
npm run doctor -- env
npm run doctor -- report
npm run doctor -- report --json
npm run doctor -- workflow
```

Linked binary usage:

```bash
npm link
aleo-doctor env
aleo-doctor report
aleo-doctor report --json
aleo-doctor workflow
```

## Example Commands

```bash
aleo-doctor env
aleo-doctor config
aleo-doctor network
aleo-doctor wallet
aleo-doctor workflow
aleo-doctor report
aleo-doctor report --json
```

## Example Terminal Output

```text
Aleo zero-knowledge development readiness: partially ready, with follow-up actions.
Aleo Dev Doctor Report (2026-03-15T10:00:00.000Z)
Summary: 6 pass, 3 warn, 0 fail, 0 skip

- [PASS] aleo.env.node: Node.js 22.14.0 is ready for Aleo developer tooling.
- [PASS] aleo.toolchain.leo: leo detected and ready: leo 1.12.0.
- [PASS] aleo.toolchain.snarkos: snarkos detected and ready: snarkos 3.3.1.
- [PASS] aleo.network.rpc: Aleo testnet RPC endpoint is reachable.
- [PASS] aleo.account.readiness: Aleo account configuration is present for privacy-first app development.
- [WARN] aleo.workflow.execute: Execution workflow validation is a documented extension point. Use mock mode or add a project-specific runner.
```

## Example JSON Output

```json
{
  "chain": "aleo",
  "generatedAt": "2026-03-15T10:00:00.000Z",
  "summary": {
    "pass": 6,
    "warn": 3,
    "fail": 0,
    "skip": 0,
    "total": 9
  },
  "results": [
    {
      "checkId": "aleo.toolchain.leo",
      "status": "pass",
      "message": "leo detected and ready: leo 1.12.0.",
      "durationMs": 14,
      "details": {
        "command": "leo",
        "configuredBinaryPath": null,
        "version": "leo 1.12.0"
      }
    },
    {
      "checkId": "aleo.account.readiness",
      "status": "pass",
      "message": "Aleo account configuration is present for privacy-first app development.",
      "durationMs": 2,
      "details": {
        "privateKeyEnvVar": "ALEO_PRIVATE_KEY",
        "addressEnvVar": "ALEO_ADDRESS",
        "viewKeyEnvVar": "ALEO_VIEW_KEY",
        "hasPrivateKey": true,
        "hasAddress": true,
        "hasViewKey": false
      }
    },
    {
      "checkId": "aleo.workflow.compile",
      "status": "warn",
      "message": "Leo fixture is present, but the Leo compiler is not installed. Compile readiness is blocked.",
      "durationMs": 5,
      "details": {
        "fixturePath": "examples/aleo-workflow",
        "command": "leo build",
        "configuredBinaryPath": null
      }
    }
  ]
}
```

## Configuration

Default config values are Aleo-specific and safe to override.

Example `aleo-doctor.config.json`:

```json
{
  "chain": "aleo",
  "network": {
    "name": "testnet",
    "rpcUrl": "https://api.explorer.aleo.org/v1",
    "timeoutMs": 5000
  },
  "toolchain": {
    "leoBinaryPath": "leo",
    "snarkosBinaryPath": "snarkos"
  },
  "account": {
    "privateKeyEnvVar": "ALEO_PRIVATE_KEY",
    "addressEnvVar": "ALEO_ADDRESS",
    "viewKeyEnvVar": "ALEO_VIEW_KEY"
  },
  "workflow": {
    "fixturePath": "examples/aleo-workflow",
    "compileArgs": ["build"],
    "executionMode": "placeholder"
  }
}
```

Environment variables:

```bash
ALEO_RPC_URL=https://api.explorer.aleo.org/v1
ALEO_NETWORK=testnet
ALEO_PRIVATE_KEY=...
ALEO_ADDRESS=...
ALEO_VIEW_KEY=...
ALEO_DOCTOR_MOCK_COMPILE=pass
ALEO_DOCTOR_MOCK_EXECUTE=pass
```

## Fixture Example

[`examples/aleo-workflow/`](/Users/milanmatejic/Desktop/personal/Projects/aleo-dev-doctor/examples/aleo-workflow/README.md) is a minimal Aleo workflow fixture that uses a Leo sample program for `aleo.workflow.compile`.

Expected command:

```bash
leo build
```

If real compilation is too heavy or unavailable in CI, the workflow checks support safe mockable modes through:

- `ALEO_DOCTOR_MOCK_COMPILE=pass|fail`
- `ALEO_DOCTOR_MOCK_EXECUTE=pass|fail`

## Current Limitations

- RPC reachability is lightweight and does not yet validate deeper Aleo protocol semantics.
- The execution workflow check is intentionally a placeholder extension point, not a full transaction runner.
- The fixture example is meant for readiness validation, not for managing full Leo project lifecycles.
- Secret material is never printed, but the tool currently validates presence rather than cryptographic correctness.

## Local Development

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```

Demo app:

```bash
npm --prefix demo install
npm --prefix demo run dev
```

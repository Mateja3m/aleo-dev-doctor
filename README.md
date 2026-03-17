# Aleo Dev Doctor

Aleo ZK Development Readiness Validator.

## Overview

`Aleo Dev Doctor`, published as `@idoa/dev-doctor-aleo` and exposed through the `aleo-doctor` CLI, validates whether a machine and project are ready for the Aleo development lifecycle:

`compile -> execute -> generate proof -> verify -> interact with network`

The CLI is Aleo-native rather than generic. It is focused on:

- Leo compiler readiness
- zero-knowledge workflow validation
- snarkOS RPC semantics
- Aleo account readiness
- per-program artifact validation

The project keeps the existing modular dev-doctor architecture and extends it with an Aleo adapter layer. It validates readiness, not the full proving or execution engine.

## What It Validates

### Leo Toolchain

- `leo --version`
- `leo build` against a sample fixture
- `leo run` against the same fixture

### ZK Workflow

- execution input readiness
- proof generation readiness with safe mocks
- verification readiness with safe mocks

### snarkOS

- snarkOS binary detection
- RPC endpoint reachability
- RPC response semantics, not just HTTP status

### Account Readiness

- Aleo private key presence and format shape
- Aleo address readiness
- transaction dry-run readiness without submitting a real transaction

### Program Validation

- scan compiled `.aleo` artifacts
- validate whether the sample program produced build output

## Quick Start

The CLI runs real checks against the local machine and local/project configuration.

```bash
npm install
npm run doctor -- report
```

The demo app is separate and uses sample/hardcoded report data. It does not run local diagnostics in the browser.

## Example Usage

```bash
aleo-doctor report
```

Available CLI commands:

```bash
aleo-doctor env
aleo-doctor config
aleo-doctor network
aleo-doctor wallet
aleo-doctor workflow
aleo-doctor zk
aleo-doctor report
aleo-doctor report --json
```

Command intent:

- `aleo-doctor env`: validates Node.js, npm, Leo detection, and snarkOS detection.
- `aleo-doctor config`: validates Aleo-specific config fields and defaults.
- `aleo-doctor network`: validates snarkOS RPC reachability and payload semantics.
- `aleo-doctor wallet`: validates account key readiness and transaction dry-run readiness.
- `aleo-doctor workflow`: validates compile, run, proof, verify, and program artifact flow.
- `aleo-doctor zk`: runs only the ZK workflow checks.
- `aleo-doctor report`: runs the full Aleo development lifecycle validator.
- `aleo-doctor report --json`: emits structured JSON for CI or integrations.

## Output Examples

Terminal example:

```text
Aleo zero-knowledge development readiness: partially ready, with follow-up actions.
ZK readiness: compile=pass execute=pass proof=warn verify=warn
Aleo Dev Doctor Report (2026-03-17T10:00:00.000Z)
Summary: 8 pass, 4 warn, 0 fail, 0 skip

- [PASS] aleo.leo.version: Leo detected: leo 1.12.0.
- [PASS] aleo.leo.build: Leo fixture compiled successfully.
- [PASS] aleo.leo.run: Leo run completed successfully.
- [PASS] aleo.zk.execute: Sample program execution inputs are present for Aleo ZK workflow validation.
- [WARN] aleo.zk.proof: Proof generation is mock-structured but waiting on a built fixture artifact.
- [WARN] aleo.zk.verify: Verification readiness is placeholder-only until execution inputs are documented.
- [PASS] aleo.snarkos.binary: snarkOS detected: snarkos 3.3.1.
- [PASS] aleo.snarkos.rpc: snarkOS RPC returned an Aleo-like response structure.
```

JSON example:

```json
{
  "chain": "aleo",
  "summary": {
    "pass": 8,
    "warn": 4,
    "fail": 0,
    "skip": 0,
    "total": 12
  },
  "zkReadiness": {
    "compile": "pass",
    "execution": "pass",
    "proof": "warn",
    "verification": "warn"
  },
  "layers": {
    "leo": [
      {
        "checkId": "aleo.leo.build",
        "status": "pass",
        "message": "Leo fixture compiled successfully."
      }
    ],
    "zk": [
      {
        "checkId": "aleo.zk.proof",
        "status": "warn",
        "message": "Proof generation is mock-structured but waiting on a built fixture artifact."
      }
    ],
    "snarkos": [
      {
        "checkId": "aleo.snarkos.rpc",
        "status": "pass",
        "message": "snarkOS RPC returned an Aleo-like response structure."
      }
    ],
    "account": [
      {
        "checkId": "aleo.account.transaction",
        "status": "warn",
        "message": "Transaction readiness is incomplete. Provide a valid Aleo address and private key."
      }
    ],
    "program": [
      {
        "checkId": "aleo.program.artifacts",
        "status": "warn",
        "message": "No compiled `.aleo` artifacts were found yet. Run the Leo build step to validate per-program output."
      }
    ]
  }
}
```

## Aleo Diagnostics Coverage

| Layer | Check IDs | Purpose |
| --- | --- | --- |
| Foundation | `aleo.env.node`, `aleo.env.npm`, `aleo.config.schema` | Validate runtime and config prerequisites |
| Leo | `aleo.leo.version`, `aleo.leo.build`, `aleo.leo.run` | Validate Leo installation, compile, and run flow |
| ZK | `aleo.zk.execute`, `aleo.zk.proof`, `aleo.zk.verify` | Validate execution, proof, and verification readiness |
| snarkOS | `aleo.snarkos.binary`, `aleo.snarkos.rpc` | Validate snarkOS installation and RPC semantics |
| Account | `aleo.account.private_key`, `aleo.account.transaction` | Validate keys and transaction readiness without exposing secrets |
| Program | `aleo.program.artifacts` | Validate compiled Aleo program artifacts |

## CI Integration Example

```yaml
name: aleo-dev-doctor-ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run doctor -- report --json
        env:
          ALEO_DOCTOR_MOCK_COMPILE: pass
          ALEO_DOCTOR_MOCK_RUN: pass
          ALEO_DOCTOR_MOCK_EXECUTE: pass
          ALEO_DOCTOR_MOCK_PROOF: pass
          ALEO_DOCTOR_MOCK_VERIFY: pass
```

## Project Structure

```text
src/
  checks/
    env.checks.ts
    leo.check.ts
    zk-workflow.check.ts
    snarkos.check.ts
    account.check.ts
    program.check.ts
  commands/
  config/
  reporting/
fixtures/
  sample-program/
demo/
```

Structure intent:

- `src/checks`: pluggable Aleo diagnostics modules
- `src/commands`: CLI command execution
- `src/config`: Aleo config defaults and zod validation
- `src/reporting`: terminal and JSON report shaping
- `fixtures/sample-program`: lightweight fixture for compile, run, and workflow readiness
- `demo`: static showcase UI with sample/hardcoded data

## Fixture Workflow

`fixtures/sample-program/` is used for:

- compile test
- run test
- ZK execution validation
- proof readiness scaffolding
- verification readiness scaffolding

Expected commands:

```bash
leo build
leo run main 5u32
```

## Configuration

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
    "fixturePath": "fixtures/sample-program",
    "compileArgs": ["build"],
    "runArgs": ["run", "main", "5u32"],
    "executionMode": "placeholder"
  }
}
```

Optional environment variables:

```bash
ALEO_RPC_URL=https://api.explorer.aleo.org/v1
ALEO_NETWORK=testnet
ALEO_PRIVATE_KEY=
ALEO_ADDRESS=
ALEO_VIEW_KEY=
ALEO_DOCTOR_MOCK_COMPILE=
ALEO_DOCTOR_MOCK_RUN=
ALEO_DOCTOR_MOCK_EXECUTE=
ALEO_DOCTOR_MOCK_PROOF=
ALEO_DOCTOR_MOCK_VERIFY=
ALEO_DOCTOR_MOCK_TX_READY=
```

## Demo App

To start the demo app from this repository:

```bash
npm --prefix demo install
npm --prefix demo run dev
```

Then open `http://localhost:3000`.

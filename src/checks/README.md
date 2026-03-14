# Aleo Checks

Checks are registered in `src/checks/index.ts` and grouped by CLI command.

Current checks:
- environment readiness (`env`)
- config validation (`config`)
- RPC reachability (`network`)
- wallet/account assumption checks (`wallet`)
- workflow baseline placeholder (`workflow`)

Workflow validation is intentionally lightweight in this PoC and marked as an extension point.

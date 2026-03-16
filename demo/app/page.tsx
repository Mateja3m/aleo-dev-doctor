import { Alert, Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';

const checks = [
  'aleo.env.node',
  'aleo.env.npm',
  'aleo.toolchain.leo',
  'aleo.toolchain.snarkos',
  'aleo.config.schema',
  'aleo.network.rpc',
  'aleo.account.readiness',
  'aleo.workflow.compile',
  'aleo.workflow.execute'
];

const plainTextReport = `Aleo zero-knowledge development readiness: partially ready, with follow-up actions.\nAleo Dev Doctor Report (2026-03-16T10:00:00.000Z)\nSummary: 6 pass, 3 warn, 0 fail, 0 skip\n\n- [PASS] aleo.env.node: Node.js 22.14.0 is ready for Aleo developer tooling.\n- [PASS] aleo.toolchain.leo: leo detected and ready: leo 1.12.0.\n- [PASS] aleo.toolchain.snarkos: snarkos detected and ready: snarkos 3.3.1.\n- [PASS] aleo.network.rpc: Aleo testnet RPC endpoint is reachable.\n- [WARN] aleo.account.readiness: Aleo account configuration is incomplete. Missing ALEO_PRIVATE_KEY, ALEO_ADDRESS.\n- [WARN] aleo.workflow.compile: Leo fixture is present, but the Leo compiler is not installed. Compile readiness is blocked.\n- [WARN] aleo.workflow.execute: Execution workflow validation is a documented extension point. Use mock mode or add a project-specific runner.`;

const jsonReport = {
  chain: 'aleo',
  generatedAt: '2026-03-16T10:00:00.000Z',
  summary: { pass: 6, warn: 3, fail: 0, skip: 0, total: 9 },
  results: [
    {
      checkId: 'aleo.toolchain.leo',
      status: 'pass',
      message: 'leo detected and ready: leo 1.12.0.',
      details: {
        command: 'leo',
        configuredBinaryPath: null,
        version: 'leo 1.12.0'
      }
    },
    {
      checkId: 'aleo.account.readiness',
      status: 'warn',
      message: 'Aleo account configuration is incomplete. Missing ALEO_PRIVATE_KEY, ALEO_ADDRESS.',
      details: {
        privateKeyEnvVar: 'ALEO_PRIVATE_KEY',
        addressEnvVar: 'ALEO_ADDRESS',
        viewKeyEnvVar: 'ALEO_VIEW_KEY',
        hasPrivateKey: false,
        hasAddress: false,
        hasViewKey: false
      }
    },
    {
      checkId: 'aleo.workflow.execute',
      status: 'warn',
      message: 'Execution workflow validation is a documented extension point. Use mock mode or add a project-specific runner.',
      details: {
        fixturePath: 'examples/aleo-workflow',
        fixtureDocumented: true,
        executionMode: 'placeholder',
        mockEnvVar: 'ALEO_DOCTOR_MOCK_EXECUTE',
        placeholder: true
      }
    }
  ]
};

export default function Page() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          Aleo Dev Doctor
        </Typography>
        <Typography color="text.secondary">
          Open-source diagnostics toolkit for validating Aleo zero-knowledge development environments.
        </Typography>

        <Alert severity="info">This demo uses sample report data and does not execute local CLI checks in-browser.</Alert>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Available Checks</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {checks.map((check) => (
                <Chip key={check} label={check} variant="outlined" />
              ))}
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Example CLI Usage</Typography>
            <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
              {`aleo-doctor env\naleo-doctor workflow\naleo-doctor report\naleo-doctor report --json`}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Sample Plain-Text Report</Typography>
            <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
              {plainTextReport}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Sample JSON Report</Typography>
            <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
              {JSON.stringify(jsonReport, null, 2)}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

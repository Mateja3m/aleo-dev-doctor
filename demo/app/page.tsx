import { Alert, Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';

const checks = [
  'aleo.env.node',
  'aleo.env.npm',
  'aleo.leo.version',
  'aleo.leo.build',
  'aleo.leo.run',
  'aleo.config.schema',
  'aleo.zk.execute',
  'aleo.zk.proof',
  'aleo.zk.verify',
  'aleo.snarkos.binary',
  'aleo.snarkos.rpc',
  'aleo.account.private_key',
  'aleo.account.transaction',
  'aleo.program.artifacts'
];

const plainTextReport = `Aleo zero-knowledge development readiness: partially ready, with follow-up actions.\nZK readiness: compile=pass execute=pass proof=warn verify=warn\nAleo Dev Doctor Report (2026-03-17T10:00:00.000Z)\nSummary: 8 pass, 4 warn, 0 fail, 0 skip\n\n- [PASS] aleo.leo.version: Leo detected: leo 1.12.0.\n- [PASS] aleo.leo.build: Leo fixture compiled successfully.\n- [PASS] aleo.leo.run: Leo run completed successfully.\n- [PASS] aleo.zk.execute: Sample program execution inputs are present for Aleo ZK workflow validation.\n- [WARN] aleo.zk.proof: Proof generation is mock-structured but waiting on a built fixture artifact.\n- [WARN] aleo.zk.verify: Verification readiness is placeholder-only until execution inputs are documented.\n- [PASS] aleo.snarkos.binary: snarkOS detected: snarkos 3.3.1.\n- [PASS] aleo.snarkos.rpc: snarkOS RPC returned an Aleo-like response structure.`;

const jsonReport = {
  chain: 'aleo',
  generatedAt: '2026-03-17T10:00:00.000Z',
  summary: { pass: 8, warn: 4, fail: 0, skip: 0, total: 12 },
  zkReadiness: {
    compile: 'pass',
    execution: 'pass',
    proof: 'warn',
    verification: 'warn'
  },
  results: [
    {
      checkId: 'aleo.leo.build',
      status: 'pass',
      message: 'Leo fixture compiled successfully.',
      details: {
        fixturePath: 'fixtures/sample-program',
        command: 'leo build'
      }
    },
    {
      checkId: 'aleo.zk.proof',
      status: 'warn',
      message: 'Proof generation is mock-structured but waiting on a built fixture artifact.',
      details: {
        fixturePath: 'fixtures/sample-program',
        buildArtifactsPresent: false,
        placeholder: true
      }
    },
    {
      checkId: 'aleo.snarkos.rpc',
      status: 'pass',
      message: 'snarkOS RPC returned an Aleo-like response structure.',
      details: {
        network: 'testnet',
        url: 'https://api.explorer.aleo.org/v1',
        status: 200,
        semanticMatch: true
      }
    }
  ],
  layers: {
    leo: [
      {
        checkId: 'aleo.leo.build',
        status: 'pass'
      }
    ],
    zk: [
      {
        checkId: 'aleo.zk.proof',
        status: 'warn'
      }
    ],
    snarkos: [
      {
        checkId: 'aleo.snarkos.rpc',
        status: 'pass'
      }
    ],
    account: [
      {
        checkId: 'aleo.account.transaction',
        status: 'warn'
      }
    ],
    program: [
      {
        checkId: 'aleo.program.artifacts',
        status: 'warn'
      }
    ],
    foundation: [
      {
        checkId: 'aleo.env.node',
        status: 'pass'
      }
    ]
  }
};

const demoNote =
  'This demo is a static proposal/demo UI and uses sample/hardcoded report data. It does not run local diagnostics in the browser.';

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

        <Alert severity="info">{demoNote}</Alert>

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
              {`aleo-doctor env\naleo-doctor zk\naleo-doctor workflow\naleo-doctor report\naleo-doctor report --json`}
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

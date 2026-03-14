import { Alert, Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';

const checks = [
  'env.node',
  'env.npm',
  'env.leo',
  'env.snarkos',
  'config.base',
  'network.rpc',
  'wallet.env',
  'workflow.baseline'
];

const plainTextReport = `Aleo Dev Doctor Report (2026-03-11T12:00:00.000Z)\nSummary: 5 pass, 2 warn, 0 fail\n\n- [PASS] env.node: Node.js 22.0.0 is supported.\n- [PASS] config.base: Configuration is valid.\n- [WARN] wallet.env: Environment variable ALEO_PRIVATE_KEY is not set.\n- [WARN] workflow.baseline: Workflow baseline validated with lightweight checks.`;

const jsonReport = {
  chain: 'aleo',
  generatedAt: '2026-03-11T12:00:00.000Z',
  summary: { pass: 5, warn: 2, fail: 0, skip: 0, total: 7 },
  results: [
    { checkId: 'env.node', status: 'pass', message: 'Node.js 22.0.0 is supported.' },
    { checkId: 'workflow.baseline', status: 'warn', message: 'Lightweight placeholder validation.' }
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
          Open-source diagnostics and onboarding toolkit for Aleo developers.
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
              {`aleo-doctor env\naleo-doctor report\naleo-doctor report --json`}
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

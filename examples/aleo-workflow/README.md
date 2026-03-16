# Aleo Workflow Fixture

This fixture exists to validate Aleo workflow readiness without changing the CLI architecture.

It uses a minimal Leo example because Leo is the compiler layer in the Aleo developer toolchain. The project itself remains Aleo Dev Doctor.

Expected compile command:

```bash
leo build
```

How `aleo-doctor workflow` uses it:

- If `leo` is installed, the CLI attempts `leo build` in this directory.
- If `leo` is not installed, the check returns a structured warning instead of failing hard.
- In CI or local demos, set `ALEO_DOCTOR_MOCK_COMPILE=pass` or `ALEO_DOCTOR_MOCK_COMPILE=fail` to simulate compile results.
- For execution workflow placeholders, set `ALEO_DOCTOR_MOCK_EXECUTE=pass` or `ALEO_DOCTOR_MOCK_EXECUTE=fail`.

This keeps the example lightweight while giving Aleo grant reviewers a concrete extension point for future compile and execute validation.

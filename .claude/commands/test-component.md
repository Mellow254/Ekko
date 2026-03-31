Run the tests for the "$ARGUMENTS" component:

```bash
cd packages/components && npx web-test-runner 'tests/ekko-$ARGUMENTS.test.ts'
```

The test runner config (`web-test-runner.config.js`) handles browser selection, plugins, and coverage. Do NOT pass `--playwright` or `--browsers` flags — they conflict with the config.

If tests fail:
1. Analyze the failure output to identify the root cause
2. Fix the failing code in the component or test
3. Re-run the tests to confirm all pass
4. If all tests pass, report the results

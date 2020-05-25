# Projektor GitHub action

GitHub action for publishing test results to Projektor for easy viewing in the Projektor UI.

## Example usage

### Using a config file

```
uses: craigatk/projektor-action@v3
with:
  config-file: projektor.json
```

### Specifying individual parameters

```
uses: craigatk/projektor-action@v3
with:
  server-url: <server-url>
  results: test-results/*.xml
```
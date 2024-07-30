# Contributing

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [[RFC2119]] [[RFC8174]] when, and only when, they appear in all capitals, as shown here.

## Getting started

1. Install dependencies.

   ```shell
   npm ci
   ```

2. Run the “full” build which includes linting, formatting, and unit tests.

   ```shell
   npm run ci-build
   ```

## Directory structure

The [src](./src) directory contains the main and test sources.

- [main.js](./src/main.js) represents the entry point (the CLI tool).
- [generate-declaration.js](./src/generate-declaration.js) represents the unit-tested JS logic.
- [fixtures](./src/fixtures) directory contains files for data-file-driven unit tests.

## Expectations

All contributions MUST adhere to the following expectations.

1. Every change MUST have unit tests.
2. Every change MUST have a GitHub issue linked.
3. Any configuration option change SHOULD be discussed in a GitHub issue first.
4. The PR build (see [pipeline.yaml](./.github/workflows/pipeline.yaml)) MUST succeed.
5. I will squash-merge the changeset into `main` upon approval.

[RFC2119]: https://www.rfc-editor.org/rfc/rfc2119
[RFC8174]: https://www.rfc-editor.org/rfc/rfc8174

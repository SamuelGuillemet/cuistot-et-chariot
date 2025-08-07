# Pre-commit Setup

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality and consistency before commits.

## Installation

Pre-commit is already configured for this project. If you're setting up the development environment for the first time:

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the git hook scripts
pre-commit install
```

## Usage

Pre-commit hooks will run automatically on every commit. The following hooks are configured:

- **Formatting & Linting**: Biome for TypeScript/JavaScript/JSON formatting and linting
- **Type Checking**: TypeScript type checking
- **General Code Quality**:
  - Trailing whitespace removal
  - End of file fixing
  - YAML validation
  - JSON validation (excluding tsconfig.json and .jsonc files)
  - Large file detection
  - Merge conflict detection
  - Case conflict detection
  - Mixed line ending normalization

## Manual Execution

You can run pre-commit hooks manually:

```bash
# Run hooks on all files
pnpm run pre-commit
# or
pre-commit run --all-files

# Run hooks on staged files only
pre-commit run

# Run a specific hook
pre-commit run biome-check
```

## GitHub Actions Integration

Pre-commit is integrated into the CI/CD pipeline to avoid duplicating checks:

- **Pre-commit Job**: Runs all pre-commit hooks (linting, type checking, formatting, and general code quality)
- **Build Job**: Runs only the build step since linting and type checking are already covered by pre-commit

This approach ensures:
- No duplication of linting and type checking between pre-commit and CI jobs
- Faster CI runs by avoiding redundant checks
- Consistent code quality enforcement across local development and CI environments

The CI workflow structure:
1. `pre-commit` job runs all code quality checks
2. `build` job (depends on pre-commit) runs the build process
3. If pre-commit fails, the build job doesn't run, saving CI resources

## Bypassing Hooks

In rare cases, you may need to bypass pre-commit hooks:

```bash
git commit --no-verify -m "commit message"
```

Note: This should be used sparingly and only when absolutely necessary. The GitHub Actions workflow will still run the checks, so bypassing locally doesn't skip CI validation.

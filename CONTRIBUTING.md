# Contributing to cssgrep

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/izag8216/cssgrep.git
cd cssgrep
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsup |
| `npm run dev` | Run CLI in development mode |
| `npm test` | Run test suite |
| `npm run coverage` | Run tests with coverage report |
| `npm run lint` | Type-check with tsc |
| `npm run format` | Format with Prettier |

## Coding Standards

- TypeScript strict mode enabled
- 80%+ test coverage required
- Follow existing code style
- Use meaningful variable names

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
4. Ensure tests pass and coverage meets threshold
5. Open a PR with clear description

## Testing

All features must include tests. Run tests before submitting:

```bash
npm test
npm run coverage
```

## Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `docs:` Documentation only changes
- `test:` Adding or correcting tests
- `chore:` Build process or auxiliary tool changes

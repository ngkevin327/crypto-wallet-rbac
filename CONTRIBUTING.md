# Contributing to Wallet Team Permissions

## Branch naming

- `feat/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — tooling, deps, CI
- `docs/<short-description>` — documentation only

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `ci`, `infra`, `security`, `perf`.

Keep subjects imperative and under 72 characters. One logical change per commit.

## Pull request checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Tests added or updated for behavior changes
- [ ] No secrets or `.env` files committed
- [ ] ADR added if the change affects architecture boundaries

## Local setup

```bash
pnpm install
pnpm db:up
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm dev
```

## Code style

- TypeScript strict mode
- Prettier on save (see `.prettierrc`)
- Prefer explicit types on public APIs
- Domain logic in services; keep controllers thin

## Security

- Never log passwords, tokens, or API keys
- Never commit private keys or seed phrases
- Report security issues privately to the maintainers

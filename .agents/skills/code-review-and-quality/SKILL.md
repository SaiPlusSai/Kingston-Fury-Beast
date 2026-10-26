---
name: code-review-and-quality
description: Enforces code standards, Conventional Commits, AI transparency declarations, ESLint/Prettier checks, and Pull Request readiness. Use before creating commits or submitting pull requests.
---

# Code Review & Quality Standards — HALO

This skill defines the development conventions and quality gate criteria required for all contributions to the Kingston Fury Beast repository.

## Commit Conventions

All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features or capabilities (e.g. `feat(websocket): add ping/pong keepalive handler`)
- `fix:` Bug fixes (e.g. `fix(auth): handle expired token gracefully in cognito verify`)
- `docs:` Documentation updates (e.g. `docs(adr): update ADR-002 intent patterns`)
- `chore:` Dependency, build tool, or formatting updates
- `test:` Adding or refactoring tests
- `refactor:` Code restructuring without behavioral changes

## AI Transparency Policy

As mandated by academic and project governance:
- **Mandatory Declaration**: Any code generated, translated, or refactored with the assistance of AI tools must be recorded in the PR description and documented in [docs/declaracion_ia_evidencia_humana.md](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/declaracion_ia_evidencia_humana.md).
- **Human-in-the-Loop Verification**: Human authors must review and validate code functionality and security before merging.

## Quality Verification Steps

1. **Backend Linter & Formatting**:
   ```powershell
   cd backend
   npm run lint
   npm run format
   ```
2. **Frontend Build Verification**:
   ```powershell
   cd frontend
   npm run build
   ```
3. **Branch Protection & PR Rules**:
   - Never push directly to `main`.
   - Branch off feature branches (e.g. `sergio`, `alan`, `chris`).
   - Every Pull Request requires at least one review from another team member before merging into `main`.

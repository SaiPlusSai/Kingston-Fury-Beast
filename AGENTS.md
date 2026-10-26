# AI Agent Instructions — HALO (Urban Shield)

Welcome to the **HALO (Urban Shield)** repository. You are operating as an expert pair programmer and software architect for the Kingston Fury Beast engineering team. Follow these instructions, standards, and workflow procedures for all interactions within this codebase.

---

## 1. Project Overview & Architecture

**HALO** is a smart-city urban incident and emergency management platform connecting citizens, safety authorities, and city administrators.

### Core Architecture & Tech Stack

| Subproject | Location | Tech Stack & Frameworks | Description |
|---|---|---|---|
| **Backend** | `backend/` | Node.js (Express), `serverless-http`, AWS SDK v3, Joi, JWT, Jest/Node runner | Monolithic serverless backend deployed to AWS Lambda via Serverless Framework. |
| **Frontend Web** | `frontend/` | React 19, Vite, React Router 6, TailwindCSS, MapLibre GL JS | Citizen incident reporting and Administrator analytics dashboard. |
| **Mobile App** | `mobile/` | React Native, Expo (Bare Workflow) | Citizen mobile app for mobile incident reporting with camera and GPS. |
| **Prediction Service** | `prediction-service/` | Python 3.12, Pandas, NumPy, Statsmodels, Prophet, Docker | Batch ML service for incident hotspot forecasting deployed via Lambda Container Image. |
| **Local Emulation** | `localstack-init/` | LocalStack, Docker Compose | Emulates AWS DynamoDB, S3, SNS, and Cognito fallback locally. |

### Architectural Guidelines (C4 & ADRs)
- **Monolith Serverless Pattern (ADR-001)**: Backend API endpoints reside in `backend/src/` as Express controllers/routes. Do not create independent micro-Lambdas for REST routes.
- **Real-Time Chatbot (ADR-002)**: Real-time communication uses AWS API Gateway WebSocket (`$connect`, `$disconnect`, `sendMessage`) handled by `src/websocket/`.
- **Database (ADR-003)**: DynamoDB dedicated tables (`UsersTable`, `ReportsTable`, `NotificationsTable`, `WebSocketConnectionsTable`, `ChatSessionsTable`, `ChatFaqsTable`).
- **Identity (ADR-004)**: Amazon Cognito User Pools with JWT tokens verified on every private endpoint and WebSocket connection.
- **Evidence Storage (ADR-005)**: S3 direct pre-signed upload URLs; files are never buffered in Lambda memory.
- **Architecture Documentation**: Inspect `docs/Arquitectura y Seguridad/C4/` for C4 diagrams and `docs/Arquitectura y Seguridad/ADR/` for the 10 formal decision records.

---

## 2. OpenSpec Spec-Driven Development Workflow

This repository strictly uses **OpenSpec** (https://github.com/Fission-AI/OpenSpec) to plan, document, and track feature changes before implementation.

### OpenSpec Configuration
- Configuration file: `openspec/config.yaml`
- Changes directory: `openspec/changes/<change-name>/`
- Active change: `halo-v2-expansion`

### Standard Commands
```powershell
# Check health of OpenSpec setup
openspec doctor

# Validate all changes and specs against schema rules
openspec validate --all

# Check progress and status of a change
openspec status --change halo-v2-expansion

# Generate enriched instructions for an artifact or apply workflow
openspec instructions apply --change halo-v2-expansion
```

### Spec Format Standards
Inside `openspec/changes/<change-name>/specs/<capability>/spec.md`:
- Must open with `## Purpose` (50+ chars).
- Changes must be placed under `## ADDED Requirements` (or `MODIFIED`/`REMOVED`).
- Every requirement must use `### Requirement: <Title>`.
- Every requirement must include at least one scenario:
  ```markdown
  #### Scenario: <Scenario Name>
  - **WHEN** <Condition>
  - **THEN** <Expected Outcome>
  ```
- Always verify changes with `openspec validate --all` before declaring specs ready.

---

## 3. Available Agent Skills

Custom skills are located in `.agents/skills/`. The agent activates them based on context and task intent:

| Skill | Path | When to Use |
|---|---|---|
| **`openspec-propose`** | `.agents/skills/openspec-propose/` | To propose a new change and generate proposal, design, specs, and tasks. |
| **`openspec-apply-change`** | `.agents/skills/openspec-apply-change/` | To implement approved tasks from an OpenSpec change step-by-step. |
| **`openspec-update-change`** | `.agents/skills/openspec-update-change/` | To update or reconcile planning artifacts of an active change. |
| **`openspec-archive-change`** | `.agents/skills/openspec-archive-change/` | To archive a completed change and sync delta specs to main specs. |
| **`openspec-explore`** | `.agents/skills/openspec-explore/` | To brainstorm and explore solutions before proposing a formal change. |
| **`openspec-sync-specs`** | `.agents/skills/openspec-sync-specs/` | To synchronize delta specs without archiving. |
| **`architecture-c4-validator`** | `.agents/skills/architecture-c4-validator/` | When designing or modifying components to verify adherence to C4 and ADRs. |
| **`backend-test-suite`** | `.agents/skills/backend-test-suite/` | When running, fixing, or adding backend and WebSocket unit tests. |
| **`code-review-and-quality`** | `.agents/skills/code-review-and-quality/` | Before committing to check Conventional Commits, AI logs, and PR readiness. |
| **`localstack-aws-runner`** | `.agents/skills/localstack-aws-runner/` | When operating or testing with local AWS cloud emulation. |
| **`ml-prediction-evaluator`** | `.agents/skills/ml-prediction-evaluator/` | When executing Python synthetic data generation, EDA, or baseline evaluations. |
| **`security-by-design-audit`** | `.agents/skills/security-by-design-audit/` | To audit routes, IAM policies, and code for secrets and security gaps. |

---

## 4. Execution & Validation Commands

Always run the relevant validation commands before finishing a task:

### Backend
```powershell
cd backend
npm run test:websocket    # Executes all WebSocket unit tests (intent, state machine, connection, heartbeat)
npm run lint              # ESLint check across backend/src/
npm run format            # Prettier formatting
```

### Frontend
```powershell
cd frontend
npm run build             # Production Vite build check
npm run dev               # Dev server on port 5173
```

### Prediction Service (Python)
```powershell
python prediction-service/scripts/generate_synthetic_data.py   # Generates raw & daily synthetic incident datasets
```

### OpenSpec Validation
```powershell
openspec validate --all   # Ensures all OpenSpec proposals, specs, and tasks are syntactically valid
```

---

## 5. Development Conventions & Guardrails

1. **Git & Branches**:
   - `main` is protected. Never commit or push directly to `main`.
   - Work in feature/developer branches (`sergio`, `alan`, `chris`, etc.).
   - Commits MUST follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.
2. **AI Transparency**:
   - Every AI-generated contribution must be declared and documented in `docs/declaracion_ia_evidencia_humana.md` and in the PR description.
3. **Security Constraints**:
   - NEVER hardcode AWS keys (`AKIA...`), Cognito secrets, or database credentials.
   - All environment variables must use `.env` (gitignored) or SSM Parameter Store.
   - Never expose internal error stacks in production HTTP responses.
4. **Preservation**:
   - Do not delete or overwrite existing documentation, ADRs, or user changes without explicit authorization.

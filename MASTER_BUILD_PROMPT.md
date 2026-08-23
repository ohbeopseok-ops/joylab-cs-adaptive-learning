# MASTER BUILD PROMPT — JoyLab CS Adaptive Learning V0.2

You are implementing an evidence-first customer-service adaptive-learning engine.

## Objective
Build and maintain this exact pipeline:

`Transcript → Structured Analyzer → Prediction JSON → Gold Evaluation → Regression Gate`

Do not build UI-first. Engine correctness and reproducibility come first.

## Required implementation order
1. Read `AGENTS.md`, `SPEC.md`, `EVALUATION_SPEC.md`, and the Gold dataset.
2. Preserve the seven behavior codes exactly.
3. Implement a typed analyzer interface.
4. Implement an OpenAI Responses API adapter using structured outputs.
5. Add a Gold batch runner that writes predictions.
6. Keep the existing Python metric harness as the source of truth for V0.2 gates.
7. Add TypeScript typecheck and CI.
8. Add tests before adding training or dashboard features.

## Analyzer rules
- Never invent transcript evidence.
- Evidence quotes must appear verbatim in the transcript.
- `NOT_ENOUGH_EVIDENCE` is a valid result.
- A good call may have no primary weakness.
- Separate accuracy/policy risk from tone/style issues.
- Do not use hidden chain-of-thought fields. Return only auditable conclusions, scores, evidence, and status.

## Engineering rules
- TypeScript strict mode.
- Environment variables for secrets and model selection.
- No API key in source control.
- Structured outputs instead of regex JSON extraction.
- Fail fast on invalid model output.
- Preserve raw analyzer predictions for evaluation.
- Do not mutate Gold labels from model output.

## Required commands
- `npm run typecheck`
- `npm run analyze:gold`
- `npm run eval:fixture`
- `npm run eval:live`

## CI
On push and pull_request:
- install Node dependencies
- typecheck
- run deterministic fixture Gold regression

Live LLM regression may run only when an API key is configured and must not block deterministic CI until model/version variance policy is finalized.

## Acceptance
A change is mergeable only when all deterministic gates pass and no critical-risk detection regression is introduced.

## Next milestone after V0.2
`Weakness History → Daily Training Target → Scenario Generator → Retry → Re-score → Real Call Transfer`

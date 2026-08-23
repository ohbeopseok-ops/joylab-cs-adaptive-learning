# JoyLab CS Adaptive Learning — SPEC V0.2

## Goal
Convert a customer-service transcript into a schema-valid prediction, evaluate it against Gold data, and use the result as the foundation for adaptive training.

## Pipeline
`Transcript → LLM Analyzer → Structured Prediction → Schema Validation → Gold Eval → PASS/FAIL`

## V0.2 scope
### In scope
- OpenAI Responses API analyzer adapter
- Structured output via Zod schema
- Gold dataset batch runner
- prediction JSON writer
- deterministic Python evaluation harness
- CI typecheck + deterministic Gold regression
- optional live LLM regression when `OPENAI_API_KEY` is configured

### Out of scope
- production STT ingestion
- employee authentication
- live call streaming
- production PII storage
- adaptive training UI
- model fine-tuning

## Input
A call case contains:
- case_id
- consultation_type
- difficulty
- transcript[] with `speaker` and `text`

## Output
Required fields:
- case_id
- primary_weakness
- weakness_top2
- critical_error
- leader_attention_required
- behavior_scores
- evidence
- status

## Hard rules
1. Evidence must quote an exact span from the supplied transcript.
2. If the transcript is insufficient, set status=`NOT_ENOUGH_EVIDENCE`.
3. Do not infer product policy facts not contained in the transcript.
4. If an agent gives an unverified definitive policy answer where policy verification is required, flag potential critical risk.
5. A normal high-quality call may return `primary_weakness=null`.
6. Training recommendations are downstream; analyzer output must remain descriptive and evidence-based.

## Model configuration
Default model: `gpt-5.4-mini`.
Override with `OPENAI_MODEL`.
Use structured outputs; do not parse free-form prose.

## Evaluation gates
- Schema Pass = 100%
- Primary Weakness Accuracy >= 85%
- Weakness Recall@2 >= 95%
- Evidence Precision >= 90%
- Critical Recall >= 95%
- False Weakness Rate <= 10%
- Behavior Score ±1 Accuracy >= 90%

## CI policy
Every push and pull request runs:
1. dependency install
2. TypeScript typecheck
3. deterministic fixture regression through the existing Python harness

If `OPENAI_API_KEY` is available, the workflow also supports a live analyzer regression. Live LLM results are informational until a stable model snapshot and repeated-run policy are adopted.

## Versioning
- Dataset: `billing-gold-v0.1.json`
- Analyzer prompt: `ANALYZER_PROMPT_VERSION`
- Engine: V0.2

## Security
Never commit API keys, raw production transcripts, phone numbers, addresses, account IDs, resident-registration numbers, or other customer identifiers.

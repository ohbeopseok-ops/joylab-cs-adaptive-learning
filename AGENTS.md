# AGENTS.md

## Mission
Build a reliable CS adaptive-learning system that improves real customer-service behavior from evidence, not impression.

## Non-negotiable rules
1. Never score without transcript evidence.
2. Keep TRAINING and REAL_CALL scores separate.
3. Prefer deterministic rules over free-form LLM judgment where possible.
4. Preserve UNKNOWN / NOT_ENOUGH_EVIDENCE instead of inventing values.
5. Never label a repeated weakness from a single call.
6. Every analyzer output must pass schema validation.
7. Prompt or scoring changes require Gold regression.
8. Critical-error recall has priority over stylistic scoring.
9. Do not silently change behavior taxonomy.
10. Do not include real customer PII in fixtures, prompts, logs, or commits.

## Behavior taxonomy
- NEED_IDENTIFICATION
- EMPATHY
- OWNERSHIP
- EXPLANATION
- STRUCTURE
- UNDERSTANDING_CHECK
- CLOSING

## Required checks before merge
- TypeScript typecheck passes.
- Prediction schema validation passes.
- Python evaluation harness passes.
- Primary Weakness Accuracy >= 0.85.
- Weakness Recall@2 >= 0.95.
- Evidence Precision >= 0.90.
- Critical Recall >= 0.95.
- False Weakness Rate <= 0.10.
- Behavior Score ±1 Accuracy >= 0.90.

## Change discipline
When modifying analyzer prompts or scoring logic:
1. State the hypothesis.
2. Run the Gold set.
3. Compare metrics with the previous baseline.
4. Reject changes that improve one metric by materially harming Critical Recall or False Weakness Rate.
5. Record model name, prompt version, dataset version, and result.

## Data safety
Use synthetic or de-identified transcripts for repository fixtures. Real production transcripts belong in controlled storage, not GitHub.

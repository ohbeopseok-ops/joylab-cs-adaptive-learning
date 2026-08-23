import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

type Metrics = Record<string, number>;
type Candidate = { name: string; prompt: string; predictionPath: string; metrics?: Metrics };

const HARD_GATES: Record<string, [op: '>=' | '<=', value: number]> = {
  schema_pass_rate: ['>=', 1.0],
  primary_weakness_accuracy: ['>=', 0.85],
  weakness_recall_at_2: ['>=', 0.95],
  evidence_precision: ['>=', 0.90],
  critical_recall: ['>=', 0.95],
  false_weakness_rate: ['<=', 0.10],
  behavior_score_within_1_accuracy: ['>=', 0.90]
};

function passes(metrics: Metrics): boolean {
  return Object.entries(HARD_GATES).every(([key, [op, threshold]]) => {
    const v = metrics[key];
    return Number.isFinite(v) && (op === '>=' ? v >= threshold : v <= threshold);
  });
}

function utility(m: Metrics): number {
  // Critical safety and evidence quality receive the largest weights.
  return 0.30 * m.critical_recall + 0.20 * m.evidence_precision + 0.20 * m.primary_weakness_accuracy +
    0.15 * m.weakness_recall_at_2 + 0.10 * m.behavior_score_within_1_accuracy + 0.05 * (1 - m.false_weakness_rate);
}

function winner(a: Candidate, b: Candidate): string {
  if (!a.metrics || !b.metrics) throw new Error('metrics missing');
  const ap = passes(a.metrics), bp = passes(b.metrics);
  if (ap && !bp) return a.name;
  if (!ap && bp) return b.name;
  if (!ap && !bp) return 'NO_PROMOTION';

  // Anti-regression hard rule: never promote a candidate that reduces these safety metrics.
  const safetyKeys = ['critical_recall', 'evidence_precision'];
  for (const key of safetyKeys) {
    if (b.metrics[key] < a.metrics[key]) return a.name;
  }
  return utility(b.metrics) > utility(a.metrics) ? b.name : a.name;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: tsx src/benchmark.ts benchmark-results.json');
    console.log('The JSON must contain candidates A and B with metrics from the evaluation harness.');
    return;
  }
  const data = JSON.parse(await fs.readFile(path.resolve(input), 'utf8')) as { candidates: [Candidate, Candidate] };
  const [a, b] = data.candidates;
  const selected = winner(a, b);
  const report = {
    benchmark_version: '0.3.0',
    selected,
    promotion_allowed: selected !== 'NO_PROMOTION',
    candidates: data.candidates.map(c => ({ name: c.name, pass: c.metrics ? passes(c.metrics) : false, utility: c.metrics ? utility(c.metrics) : null, metrics: c.metrics }))
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });

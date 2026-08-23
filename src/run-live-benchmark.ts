import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { analyzeCase } from './analyzer.js';
import type { GoldCase, Prediction } from './schema.js';

type GoldDataset = { dataset_name: string; version: string; cases: GoldCase[] };

type Metrics = Record<string, number>;

async function runPythonEval(predictionPath: string): Promise<Metrics> {
  return await new Promise((resolve, reject) => {
    const child = spawn('python', ['evals/evaluate_json.py', predictionPath], { stdio: ['ignore', 'pipe', 'inherit'] });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`evaluation failed for ${predictionPath}`));
      try { resolve(JSON.parse(stdout.trim())); }
      catch (error) { reject(error); }
    });
  });
}

async function analyzeAll(cases: GoldCase[], promptPath: string, outPath: string): Promise<void> {
  const predictions: Prediction[] = [];
  for (const item of cases) {
    process.stdout.write(`[${path.basename(promptPath)}] ${item.case_id}... `);
    predictions.push(await analyzeCase(item, { promptPath }));
    console.log('done');
  }
  await fs.writeFile(outPath, JSON.stringify(predictions, null, 2) + '\n', 'utf8');
}

async function main() {
  const goldPath = path.resolve('datasets/gold/billing-gold-v0.2.json');
  const dataset = JSON.parse(await fs.readFile(goldPath, 'utf8')) as GoldDataset;

  const candidates = [
    { name: 'PROMPT_V0_2', prompt: 'prompts/analyzer-system.md', predictionPath: 'examples/live-predictions-v0.2.json' },
    { name: 'PROMPT_V0_3', prompt: 'prompts/analyzer-system-v0.3.md', predictionPath: 'examples/live-predictions-v0.3.json' },
  ];

  for (const candidate of candidates) {
    await analyzeAll(dataset.cases, candidate.prompt, candidate.predictionPath);
  }

  const result = {
    dataset: dataset.dataset_name,
    dataset_version: dataset.version,
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    generated_at: new Date().toISOString(),
    candidates: [] as Array<Record<string, unknown>>,
  };

  for (const candidate of candidates) {
    result.candidates.push({
      ...candidate,
      metrics: await runPythonEval(candidate.predictionPath),
    });
  }

  await fs.writeFile('examples/benchmark-results-live.json', JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log('Wrote examples/benchmark-results-live.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import fs from 'node:fs/promises';
import path from 'node:path';
import { analyzeCase } from './analyzer.js';
import type { GoldCase, Prediction } from './schema.js';

type GoldDataset = { dataset_name: string; version: string; cases: GoldCase[] };

async function main() {
  const goldPath = path.resolve(process.env.GOLD_DATASET ?? 'datasets/gold/billing-gold-v0.2.json');
  const outPath = path.resolve(process.env.PREDICTION_OUT ?? 'examples/live-predictions.json');
  const dataset = JSON.parse(await fs.readFile(goldPath, 'utf8')) as GoldDataset;
  const predictions: Prediction[] = [];

  console.log(`Dataset: ${dataset.dataset_name} (${dataset.cases.length} cases)`);
  for (const item of dataset.cases) {
    process.stdout.write(`Analyzing ${item.case_id}... `);
    const prediction = await analyzeCase(item);
    predictions.push(prediction);
    console.log('done');
  }
  await fs.writeFile(outPath, JSON.stringify(predictions, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${predictions.length} predictions to ${outPath}`);
}

main().catch((error) => { console.error(error); process.exit(1); });

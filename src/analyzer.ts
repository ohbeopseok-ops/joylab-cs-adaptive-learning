import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { GoldCase, Prediction, PredictionSchema } from './schema.js';

const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini';

function transcriptText(input: GoldCase): string {
  return input.transcript
    .map((turn) => `${turn.speaker.toUpperCase()}: ${turn.text}`)
    .join('\n');
}

export async function analyzeCase(
  input: GoldCase,
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
): Promise<Prediction> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for live analyzer execution.');
  }

  const promptPath = path.resolve('prompts/analyzer-system.md');
  const systemPrompt = await fs.readFile(promptPath, 'utf8');

  const response = await client.responses.parse({
    model,
    input: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          `case_id: ${input.case_id}`,
          `consultation_type: ${input.consultation_type}`,
          `difficulty: ${input.difficulty}`,
          '',
          'TRANSCRIPT',
          transcriptText(input),
        ].join('\n'),
      },
    ],
    text: {
      format: zodTextFormat(PredictionSchema, 'cs_call_prediction'),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error(`No structured output returned for ${input.case_id}`);
  }

  if (parsed.case_id !== input.case_id) {
    throw new Error(`case_id mismatch: expected ${input.case_id}, got ${parsed.case_id}`);
  }

  const transcript = transcriptText(input);
  for (const evidence of parsed.evidence) {
    if (!transcript.includes(evidence.quote)) {
      throw new Error(
        `Evidence quote is not verbatim transcript text for ${input.case_id}: ${evidence.quote}`,
      );
    }
  }

  return PredictionSchema.parse(parsed);
}

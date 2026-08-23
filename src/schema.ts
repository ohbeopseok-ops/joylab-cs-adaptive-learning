import { z } from 'zod';

export const BehaviorCode = z.enum([
  'NEED_IDENTIFICATION',
  'EMPATHY',
  'OWNERSHIP',
  'EXPLANATION',
  'STRUCTURE',
  'UNDERSTANDING_CHECK',
  'CLOSING',
]);

// OpenAI Structured Outputs requires a closed JSON Schema. Avoid z.record()
// here because its generated JSON Schema uses propertyNames/additionalProperties
// semantics that are rejected for strict response formats.
export const BehaviorScoresSchema = z.object({
  NEED_IDENTIFICATION: z.number().min(1).max(5),
  EMPATHY: z.number().min(1).max(5),
  OWNERSHIP: z.number().min(1).max(5),
  EXPLANATION: z.number().min(1).max(5),
  STRUCTURE: z.number().min(1).max(5),
  UNDERSTANDING_CHECK: z.number().min(1).max(5),
  CLOSING: z.number().min(1).max(5),
}).strict();

export const PredictionSchema = z.object({
  case_id: z.string(),
  primary_weakness: BehaviorCode.nullable(),
  weakness_top2: z.array(BehaviorCode).max(2),
  critical_error: z.boolean(),
  leader_attention_required: z.boolean(),
  behavior_scores: BehaviorScoresSchema,
  evidence: z.array(z.object({
    behavior: BehaviorCode,
    quote: z.string(),
    reason: z.string(),
  }).strict()),
  status: z.enum(['OK', 'NOT_ENOUGH_EVIDENCE']),
}).strict();

export type Prediction = z.infer<typeof PredictionSchema>;

export type TranscriptTurn = {
  speaker: 'customer' | 'agent';
  text: string;
};

export type GoldCase = {
  case_id: string;
  consultation_type: string;
  difficulty: number;
  transcript: TranscriptTurn[];
};

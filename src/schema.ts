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

export const PredictionSchema = z.object({
  case_id: z.string(),
  primary_weakness: BehaviorCode.nullable(),
  weakness_top2: z.array(BehaviorCode).max(2),
  critical_error: z.boolean(),
  leader_attention_required: z.boolean(),
  behavior_scores: z.record(BehaviorCode, z.number().min(1).max(5)),
  evidence: z.array(z.object({
    behavior: BehaviorCode,
    quote: z.string(),
    reason: z.string(),
  })),
  status: z.enum(['OK', 'NOT_ENOUGH_EVIDENCE']),
});

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

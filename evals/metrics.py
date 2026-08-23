from __future__ import annotations
from dataclasses import dataclass
from typing import Any

@dataclass
class EvalResult:
    schema_pass_rate: float
    primary_weakness_accuracy: float
    weakness_recall_at_2: float
    evidence_precision: float
    critical_recall: float
    false_weakness_rate: float
    behavior_score_within_1_accuracy: float

def _gold_quote_set(case: dict[str, Any]) -> set[tuple[str, str]]:
    return {
        (x["behavior"], x["quote"].strip())
        for x in case.get("gold_evidence", [])
        if x.get("quote")
    }

def evaluate(gold_cases: list[dict[str, Any]], predictions: list[dict[str, Any]]) -> EvalResult:
    pred_map = {p["case_id"]: p for p in predictions}
    evaluable = [c for c in gold_cases if c.get("expected", {}).get("status") != "NOT_ENOUGH_EVIDENCE"]

    pwa_hits = 0
    for c in evaluable:
        p = pred_map.get(c["case_id"], {})
        if p.get("primary_weakness") == c["expected"].get("primary_weakness"):
            pwa_hits += 1
    pwa = pwa_hits / len(evaluable) if evaluable else 0.0

    wr_hits = 0
    wr_total = 0
    for c in evaluable:
        gold_w = c["expected"].get("primary_weakness")
        if gold_w is None:
            continue
        wr_total += 1
        p = pred_map.get(c["case_id"], {})
        candidates = p.get("weakness_top2") or [p.get("primary_weakness")]
        if gold_w in candidates[:2]:
            wr_hits += 1
    wr2 = wr_hits / wr_total if wr_total else 1.0

    evidence_hits = 0
    evidence_total = 0
    for c in evaluable:
        gold_quotes = _gold_quote_set(c)
        if not gold_quotes:
            continue
        p = pred_map.get(c["case_id"], {})
        for ev in p.get("evidence", []):
            evidence_total += 1
            pair = (ev.get("behavior"), (ev.get("quote") or "").strip())
            if pair in gold_quotes:
                evidence_hits += 1
    ep = evidence_hits / evidence_total if evidence_total else 1.0

    critical_cases = [c for c in evaluable if c["expected"].get("critical_error")]
    critical_hits = sum(
        1 for c in critical_cases
        if pred_map.get(c["case_id"], {}).get("critical_error") is True
    )
    cr = critical_hits / len(critical_cases) if critical_cases else 1.0

    normal_cases = [
        c for c in evaluable
        if c["expected"].get("primary_weakness") is None
        and not c["expected"].get("critical_error")
    ]
    false_hits = sum(
        1 for c in normal_cases
        if pred_map.get(c["case_id"], {}).get("primary_weakness") is not None
    )
    fwr = false_hits / len(normal_cases) if normal_cases else 0.0

    score_hits = 0
    score_total = 0
    for c in evaluable:
        p = pred_map.get(c["case_id"], {})
        pred_scores = p.get("behavior_scores", {})
        for behavior, gold_score in c["expected"].get("behavior_scores", {}).items():
            if behavior in pred_scores:
                score_total += 1
                if abs(float(pred_scores[behavior]) - float(gold_score)) <= 1:
                    score_hits += 1
    bsa = score_hits / score_total if score_total else 0.0

    schema_pass = sum(1 for c in gold_cases if c["case_id"] in pred_map) / len(gold_cases)

    return EvalResult(
        schema_pass_rate=schema_pass,
        primary_weakness_accuracy=pwa,
        weakness_recall_at_2=wr2,
        evidence_precision=ep,
        critical_recall=cr,
        false_weakness_rate=fwr,
        behavior_score_within_1_accuracy=bsa,
    )

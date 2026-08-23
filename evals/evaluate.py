import json
import sys
from pathlib import Path
from metrics import evaluate

GATES = {
    "schema_pass_rate": (">=", 1.00),
    "primary_weakness_accuracy": (">=", 0.85),
    "weakness_recall_at_2": (">=", 0.95),
    "evidence_precision": (">=", 0.90),
    "critical_recall": (">=", 0.95),
    "false_weakness_rate": ("<=", 0.10),
    "behavior_score_within_1_accuracy": (">=", 0.90),
}

def gate_pass(name, value):
    op, threshold = GATES[name]
    return value >= threshold if op == ">=" else value <= threshold

def main():
    root = Path(__file__).resolve().parents[1]
    gold_path = root / "datasets/gold/billing-gold-v0.1.json"
    pred_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "examples/demo-predictions.json"

    gold = json.loads(gold_path.read_text(encoding="utf-8"))["cases"]
    predictions = json.loads(pred_path.read_text(encoding="utf-8"))

    result = evaluate(gold, predictions)
    metrics = result.__dict__

    print("JoyLab CS Eval V0.1")
    print("=" * 48)

    all_pass = True
    for name, value in metrics.items():
        passed = gate_pass(name, value)
        all_pass &= passed
        op, threshold = GATES[name]
        print(f"{'PASS' if passed else 'FAIL':4}  {name:36} {value:.3f}  gate {op} {threshold:.2f}")

    print("=" * 48)
    print("FINAL:", "PASS" if all_pass else "FAIL")
    raise SystemExit(0 if all_pass else 1)

if __name__ == "__main__":
    main()

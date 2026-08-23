import json
import sys
from pathlib import Path
from metrics import evaluate


def main():
    if len(sys.argv) < 2:
        raise SystemExit('usage: python evals/evaluate_json.py <predictions.json>')

    root = Path(__file__).resolve().parents[1]
    gold_path = root / 'datasets/gold/billing-gold-v0.2.json'
    pred_path = Path(sys.argv[1])

    gold = json.loads(gold_path.read_text(encoding='utf-8'))['cases']
    predictions = json.loads(pred_path.read_text(encoding='utf-8'))
    result = evaluate(gold, predictions)
    print(json.dumps(result.__dict__, ensure_ascii=False))


if __name__ == '__main__':
    main()

# JoyLab CS Adaptive Learning V0.1

## 목적

요금상담 Transcript를 기반으로 Weakness Engine의 판정 정확도를 검증하기 위한 첫 실행 패키지입니다.

## 포함 파일

- `datasets/gold/billing-gold-v0.1.json` — Gold Case 10건
- `schemas/prediction.schema.json` — Prediction 출력 스키마
- `evals/metrics.py` — Evaluation metric
- `evals/evaluate.py` — PASS/FAIL Gate Runner
- `examples/demo-predictions.json` — Smoke Test용 prediction
- `EVALUATION_SPEC.md` — metric 정의와 운영 규칙

## 실행

```bash
cd evals
python evaluate.py
```

자체 모델 결과를 평가하려면:

```bash
python evaluate.py ../my-predictions.json
```

## Gate

| Metric | Gate |
|---|---:|
| Schema Pass | 100% |
| Primary Weakness Accuracy | >= 85% |
| Weakness Recall@2 | >= 95% |
| Evidence Precision | >= 90% |
| Critical Recall | >= 95% |
| False Weakness Rate | <= 10% |
| Behavior Score ±1 Accuracy | >= 90% |

## 중요한 제한

현재 Gold 10건은 V0.1 smoke/regression 용입니다. 특히 `BILLING_008`의 실제 할인 정책 사실 여부를 학습 정답으로 쓰는 것이 아니라, **정책 확인 없이 단정하는 유형을 Critical로 식별하는 테스트**로 사용합니다.

Demo prediction의 100% 결과는 실제 AI 모델 성능이 아니라 Evaluation Harness가 정상 동작하는지 검증하기 위한 기준선입니다.

다음 Gate는 Gold 30건, 이중 라벨링, 불일치 adjudication입니다.

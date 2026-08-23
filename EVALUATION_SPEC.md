# Evaluation Spec V0.1

## 1. Primary Weakness Accuracy
Gold의 `primary_weakness`와 모델 Top-1이 동일한 비율.

## 2. Weakness Recall@2
Gold primary weakness가 모델의 상위 2개 weakness 후보에 포함되는 비율.

## 3. Evidence Precision
모델이 제시한 Evidence 중 Gold Evidence와 정확히 일치하는 비율.
V0.2에서는 exact match가 아니라 span overlap + human validation으로 확장한다.

## 4. Critical Recall
Gold가 Critical인 Case 중 모델도 Critical로 감지한 비율.
운영 위험이 크므로 Precision보다 Recall을 우선한다.

## 5. False Weakness Rate
Gold가 정상 상담인데 모델이 취약점을 만들어낸 비율.

## 6. Behavior Score ±1 Accuracy
7개 Behavior 점수가 Gold 대비 ±1 이내인 비율.

## PASS/FAIL 원칙
- Critical Recall 미달은 전체 FAIL.
- Schema Pass 100% 미달은 전체 FAIL.
- 정상 Case에 억지 Weakness를 생성하면 False Weakness Rate에 반영.
- `NOT_ENOUGH_EVIDENCE` Case를 일반 score accuracy 계산에서 제외.

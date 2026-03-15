# 게임 밸런스 설계 문서 (Balance Design Document)

## 1. 개요 (Overview)

이 문서는 Galuxy Arcade의 게임 경제 시스템, 전투 시스템, 그리고 심리적 허들·쾌감을 수학적으로 구현하기 위한 원칙과 공식을 정의합니다.  
모든 공식의 구현체는 `src/systems/BalanceEngine.js`에 집중되어 있으며, 게임 전반에 걸쳐 참조됩니다.

---

## 2. 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| **플로우 이론 (Flow Theory)** | Csikszentmihalyi의 플로우 채널: 도전 난이도가 실력보다 약간 높을 때 최적의 몰입 경험 발생 |
| **스키너 상자 (Skinner Box)** | 변동비율 강화 스케줄(Variable Ratio Schedule): 불규칙한 보상이 가장 강한 행동 유지력을 만들어냄 |
| **손실 회피 (Loss Aversion)** | Kahneman의 전망이론: 손실의 심리적 고통은 같은 크기의 이익보다 약 2배 강하게 느껴짐 |
| **거의 성공 효과 (Near-Miss Effect)** | 목표 달성 직전 상태에서 동기 부여가 최대화됨 |

---

## 3. 전투 시스템 수치 설계 (Combat System)

### 3-1. 난이도 곡선 (Difficulty Scaling) — 로지스틱 함수

시간이 지남에 따라 난이도가 자연스럽게 상승하도록 **S자형 로지스틱 곡선**을 사용합니다.  
초반에는 완만하게, 중반에는 가파르게, 후반에는 다시 완만해져 한계점(천장)에 수렴합니다.

```
f(t) = D_max / (1 + e^(-k * (t - t₀)))

- f(t)  : 시간 t(초)에서의 난이도 배율
- D_max : 최대 난이도 배율 (기본값: 5.0)
- k     : 성장 속도 (기본값: 0.008)
- t₀   : 변곡점, 가장 가파른 증가 지점 (기본값: 120초 = 2분)
```

| 시간 (초) | 난이도 배율 (근사치) | 체감 설명 |
|-----------|-----------------|---------|
| 0         | ~0.5            | 입문 구간 |
| 60        | ~1.2            | 워밍업 완료 |
| 120       | ~2.5            | 본격 도전 시작 |
| 180       | ~3.8            | 보스 전 최고조 |
| 240+      | ~4.5 → 5.0      | 보스전 이후 안정화 |

### 3-2. 적군 스탯 공식 (Enemy Stats)

적군의 HP와 속도는 난이도 배율에 비례하여 스케일링됩니다.  
단, **속도는 덜 민감하게** 반응하여 게임이 불가능해지는 상황을 방지합니다.

```
HP(type, t)    = baseHP[type] * f(t)
speed(type, t) = baseSpeed[type] * (1 + (f(t) - 1) * 0.3)

baseHP   : { A: 20, B: 20, C: 60, D: 80 }
baseSpeed: { A: 3,  B: 2,  C: 4,  D: 1.5 }
```

**설계 의도**: HP는 선형 확장하여 DPS(초당 피해량) 요구를 높이고, 속도는 30% 감쇄 계수로 제어해 조작 불능 상황을 예방합니다.

### 3-3. 플레이어 총알 피해량 (Player Bullet Damage)

무기 레벨이 올라갈수록 피해량은 증가하지만, **수확 체감 법칙**(Diminishing Returns)에 의해 상승폭이 점점 줄어들어 밸런스를 유지합니다.

```
damage(weaponLevel) = 20 * (1 + log₂(weaponLevel) * 0.5)

weaponLevel: 1 → 20pt,  2 → 30pt,  4 → 40pt,  8 → 50pt
```

### 3-4. 플레이어 수신 피해량 (Incoming Damage)

적군의 피해량도 난이도와 함께 증가합니다. 단, 증가율을 50%로 감쇄하여 초반 유저도 피해를 감내할 수 있도록 설계합니다.

```
incomingDamage(t) = 10 * (1 + (f(t) - 1) * 0.5)
```

### 3-5. 킬 점수 + 콤보 시스템 (Kill Score & Combo)

**콤보(Combo)**: 2초 이내에 연속으로 적을 처치하면 콤보 카운터가 증가합니다.  
콤보 배율에는 **로그함수**를 적용하여 과도한 점수 인플레이션을 방지합니다.

```
score(type, combo) = baseScore[type] * (1 + ln(1 + combo) * 0.5)

baseScore: { A: 100, B: 150, C: 300, D: 400, boss: 5000 }
```

| 콤보 수 | 배율 (근사치) | 심리적 효과 |
|---------|------------|---------|
| 0       | 1.0x       | 기본 점수 |
| 2       | ~1.55x     | 작은 보상감 |
| 5       | ~1.90x     | 리듬 형성 |
| 10      | ~2.20x     | 강한 성취감 |
| 20      | ~2.55x     | 최대 흥분 구간 |

---

## 4. 경제 시스템: 업그레이드 사이클 (Upgrade Economy)

### 4-1. 업그레이드 임계값 공식 (Upgrade Threshold)

업그레이드 제공 시점은 **지수 성장 공식**으로 계산됩니다.  
업그레이드 횟수가 늘어날수록 다음 업그레이드까지 더 많은 점수가 필요하여 달성 난이도가 점진적으로 증가합니다.

```
nextThreshold = lastUpgradeScore + round(baseInterval * growthFactor^upgradeCount)

baseInterval : 500 점
growthFactor : 1.4  (각 업그레이드마다 40% 더 많은 점수 필요)
```

| 업그레이드 횟수 | 필요 점수 간격 | 누적 필요 점수 |
|--------------|------------|------------|
| 1회차         | 500        | 500        |
| 2회차         | 700        | 1,200      |
| 3회차         | 980        | 2,180      |
| 4회차         | 1,372      | 3,552      |
| 5회차         | 1,921      | 5,473      |

**설계 의도**: 초반에는 잦은 업그레이드로 성장의 기쁨을 주고, 중후반에는 달성이 어려워 성취감이 강해집니다.

---

## 5. 경제 시스템: 머지 게임 (Merge Economy)

### 5-1. 머지 점수 (Merge Score)

합체 레벨이 높을수록 점수는 기하급수적으로 증가합니다.

```
mergeScore(level) = 2^(level + 1)

level 0 → 2점,  level 1 → 4점, ..., level 10 → 2048점
```

### 5-2. 드롭 가중치 (Drop Weight Distribution)

다음에 등장할 과일(오브젝트)의 레벨은 **기하 분포**(Geometric Distribution)를 따릅니다.  
낮은 레벨의 오브젝트가 더 자주 등장하여 플레이어가 높은 레벨 오브젝트에 쉽게 압도되지 않도록 합니다.

```
weight(level) = 0.6^level

level 0: 1.0, level 1: 0.6, level 2: 0.36, level 3: 0.216 ...
```

최대 드롭 가능 레벨은 전체 레벨의 절반으로 제한하여 게임 초반 과부하를 방지합니다.

---

## 6. 심리적 장치 (Psychological Systems)

### 6-1. 변동비율 강화 스케줄 (Variable Ratio Schedule)

아이템 드롭 확률은 마지막 드롭 이후 처치한 적 수에 따라 **점진적으로 증가**합니다.  
이는 슬롯머신의 원리와 동일하며, 언제 보상이 올지 모르는 **기대감**이 지속적인 플레이를 유도합니다.

```
dropProbability(n) = min(0.35, 0.05 * (1 + n * 0.3))

n = 마지막 드롭 이후 처치 수
```

| 처치 수 (n) | 드롭 확률 | 심리적 상태 |
|-----------|---------|----------|
| 0         | 5%      | 기본 대기 |
| 3         | 9.5%    | 기대감 상승 |
| 7         | 15.5%   | 긴장감 고조 |
| 15        | 27.5%   | 강한 기대 |
| 20+       | 35%     | 최대치 고정 (보상 임박감) |

### 6-2. 거의 성공 효과 (Near-Miss Progress)

다음 마일스톤까지의 진행률을 0~1 범위로 계산하여 UI에 표시합니다.  
플레이어가 목표에 **얼마나 가까운지** 시각적으로 느낄 수 있게 하여 포기 충동을 억제합니다.

```
progress = (currentScore - prevMilestone) / (nextMilestone - prevMilestone)
```

대표 마일스톤: `[1000, 3000, 7000, 15000, 30000, 60000]`

### 6-3. 플로우 채널 계산 (Flow Channel)

분당 획득 점수를 기반으로 적정 도전 강도를 산출합니다.  
현재 실력보다 **10% 높은** 도전 강도가 플로우 상태를 유지합니다.

```
flowTarget(scorePerMinute) = scorePerMinute * 1.1
```

**Yerkes-Dodson 법칙**: 최적의 각성 수준에서 퍼포먼스가 최대화됨.  
난이도가 너무 낮으면 지루함, 너무 높으면 불안감이 발생합니다.

### 6-4. 심리적 설계 요약

| 장치 | 구현 방식 | 기대 효과 |
|------|---------|---------|
| **변동비율 보상** | `getDropProbability(n)` | 지속적 플레이 유도 |
| **콤보 배율** | `getKillScore(type, combo)` | 실력 발휘 시 강렬한 쾌감 |
| **업그레이드 사이클** | `getNextUpgradeThreshold(n)` | 단기 목표 제공, 성장감 |
| **거의 성공 효과** | `getNearMissProgress()` | 포기 방지, 재도전 유도 |
| **난이도 수렴** | 로지스틱 난이도 곡선 | 좌절 없는 도전감 유지 |
| **수확 체감 무기** | `getPlayerBulletDamage()` | 업그레이드 의미 있게 유지 |

---

## 7. 참고 문헌 및 이론적 근거

- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience.*
- Kahneman, D. & Tversky, A. (1979). Prospect Theory. *Econometrica, 47(2).*
- Skinner, B. F. (1938). *The Behavior of Organisms.* (Variable Ratio Reinforcement)
- Yerkes, R. M. & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology.*
- Adams, E. & Dormans, J. (2012). *Game Mechanics: Advanced Game Design.*

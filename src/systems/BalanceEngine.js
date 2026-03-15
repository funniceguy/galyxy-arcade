/**
 * BalanceEngine.js
 *
 * 게임의 모든 수치 밸런스 공식을 집중 관리합니다.
 * 자세한 설계 근거는 docs/06_Balance/BalanceDesign.md 를 참조하세요.
 */

// ─────────────────────────────────────────────────────────────
// 1. 전투 시스템 — 난이도 스케일링 (Combat / Difficulty)
// ─────────────────────────────────────────────────────────────

/**
 * 시간 기반 난이도 배율 (로지스틱 S-커브)
 * f(t) = D_max / (1 + e^(-k * (t - t0)))
 *
 * @param {number} timeSeconds - 경과 시간 (초)
 * @returns {number} 난이도 배율 (1.0 ~ D_max)
 */
export function getDifficultyMultiplier(timeSeconds) {
    const D_max = 5.0;   // 최대 배율
    const k     = 0.008; // 성장 속도
    const t0    = 120;   // 변곡점 (2분)
    return D_max / (1 + Math.exp(-k * (timeSeconds - t0)));
}

/**
 * 적군 스탯 (HP, speed)을 난이도에 맞게 반환
 * HP    = baseHP * f(t)
 * speed = baseSpeed * (1 + (f(t) - 1) * 0.3)   [속도는 완화된 스케일]
 *
 * @param {'A'|'B'|'C'|'D'} type - 적군 유형
 * @param {number} timeSeconds - 경과 시간 (초)
 * @returns {{ hp: number, speed: number }}
 */
export function getEnemyStats(type, timeSeconds) {
    const BASE = {
        A: { hp: 20,  speed: 3   },
        B: { hp: 20,  speed: 2   },
        C: { hp: 60,  speed: 4   },
        D: { hp: 80,  speed: 1.5 },
    };
    const base = BASE[type] || BASE.A;
    const diff = getDifficultyMultiplier(timeSeconds);
    return {
        hp:    Math.round(base.hp    *  diff),
        speed: base.speed * (1 + (diff - 1) * 0.3),
    };
}

/**
 * 플레이어 총알 피해량 (수확 체감 적용)
 * damage = 20 * (1 + log2(weaponLevel) * 0.5)
 *
 * @param {number} weaponLevel - 무기 레벨 (1 이상)
 * @returns {number} 피해량
 */
export function getPlayerBulletDamage(weaponLevel) {
    const level = Math.max(1, weaponLevel);
    return Math.round(20 * (1 + Math.log2(level) * 0.5));
}

/**
 * 플레이어가 적 총알에 맞았을 때 수신 피해량
 * 난이도에 비례하지만 증가율은 50% 감쇄
 *
 * @param {number} timeSeconds - 경과 시간 (초)
 * @returns {number} 피해량
 */
export function getPlayerDamage(timeSeconds) {
    const diff = getDifficultyMultiplier(timeSeconds);
    return Math.round(10 * (1 + (diff - 1) * 0.5));
}

// ─────────────────────────────────────────────────────────────
// 2. 전투 시스템 — 점수 & 콤보 (Score & Combo)
// ─────────────────────────────────────────────────────────────

/**
 * 적 처치 점수 (콤보 배율 포함)
 * score = baseScore * (1 + ln(1 + combo) * 0.5)
 *
 * @param {'A'|'B'|'C'|'D'|'boss'} enemyType - 적군 유형
 * @param {number} combo - 현재 콤보 수
 * @returns {number} 획득 점수
 */
export function getKillScore(enemyType, combo) {
    const BASE_SCORES = { A: 100, B: 150, C: 300, D: 400, boss: 5000 };
    const baseScore   = BASE_SCORES[enemyType] || 100;
    const comboMult   = 1 + Math.log(1 + Math.max(0, combo)) * 0.5;
    return Math.round(baseScore * comboMult);
}

/**
 * 콤보 초기화 타임아웃 (ms)
 * 이 시간 내에 처치가 없으면 콤보가 0으로 리셋됩니다.
 */
export const COMBO_TIMEOUT_MS = 2000;

// ─────────────────────────────────────────────────────────────
// 3. 경제 시스템 — 업그레이드 사이클 (Upgrade Economy)
// ─────────────────────────────────────────────────────────────

/**
 * 다음 업그레이드가 제공되는 점수 임계값
 * nextThreshold = lastScore + round(baseInterval * growthFactor^upgradeCount)
 *
 * @param {number} lastUpgradeScore - 마지막 업그레이드 시점의 점수
 * @param {number} upgradeCount - 지금까지 받은 업그레이드 횟수
 * @returns {number} 다음 업그레이드 발동 점수
 */
export function getNextUpgradeThreshold(lastUpgradeScore, upgradeCount) {
    const BASE_INTERVAL  = 500;
    const GROWTH_FACTOR  = 1.4;
    const interval = Math.round(BASE_INTERVAL * Math.pow(GROWTH_FACTOR, upgradeCount));
    return lastUpgradeScore + interval;
}

// ─────────────────────────────────────────────────────────────
// 4. 경제 시스템 — 머지 게임 (Merge Economy)
// ─────────────────────────────────────────────────────────────

/**
 * 머지 점수: 합체 레벨에 따른 기하급수적 증가
 * score = 2^(level + 1)
 *
 * @param {number} level - 합체 레벨 (0-indexed)
 * @returns {number} 머지 점수
 */
export function getMergeScore(level) {
    return Math.pow(2, level + 1);
}

/**
 * 드롭 가중치 배열 (기하 분포)
 * weight(level) = 0.6^level
 *
 * @param {number} maxLevel - 전체 레벨 수
 * @returns {number[]} 각 레벨의 가중치 배열
 */
export function getDropWeights(maxLevel) {
    const weights = [];
    for (let i = 0; i < maxLevel; i++) {
        weights.push(Math.pow(0.6, i));
    }
    return weights;
}

/**
 * 가중 랜덤으로 다음 드롭 레벨 선택
 * 높은 레벨은 전체 레벨의 절반으로 제한하여 초반 과부하를 방지합니다.
 *
 * @param {number} totalLevels - 전체 레벨 수
 * @returns {number} 선택된 레벨 (0-indexed)
 */
export function getWeightedRandomLevel(totalLevels) {
    const maxDropLevel = Math.ceil(totalLevels / 2);
    const weights = getDropWeights(maxDropLevel);
    const total   = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return i;
    }
    return 0;
}

// ─────────────────────────────────────────────────────────────
// 5. 심리적 장치 (Psychological Systems)
// ─────────────────────────────────────────────────────────────

/**
 * 아이템 드롭 확률 (변동비율 강화 스케줄)
 * probability = min(0.35, 0.05 * (1 + killsSinceLastDrop * 0.3))
 *
 * 마지막 드롭 이후 처치 수가 많을수록 확률이 높아져
 * 언제 보상이 올지 모르는 기대감을 유지합니다.
 *
 * @param {number} killsSinceLastDrop - 마지막 드롭 이후 처치 수
 * @returns {number} 드롭 확률 (0.0 ~ 0.35)
 */
export function getDropProbability(killsSinceLastDrop) {
    const base    = 0.05;
    const maxProb = 0.35;
    return Math.min(maxProb, base * (1 + Math.max(0, killsSinceLastDrop) * 0.3));
}

/**
 * 다음 마일스톤까지의 진행률 (거의 성공 효과)
 * progress = (score - prevMilestone) / (nextMilestone - prevMilestone)
 *
 * @param {number} score - 현재 점수
 * @param {number[]} milestones - 오름차순 마일스톤 배열
 * @returns {number} 진행률 (0.0 ~ 1.0)
 */
export function getNearMissProgress(score, milestones) {
    const next = milestones.find(m => m > score);
    if (!next) return 1;
    const prev = milestones.filter(m => m <= score).pop() || 0;
    return (score - prev) / (next - prev);
}

/** 대표 점수 마일스톤 */
export const SCORE_MILESTONES = [1000, 3000, 7000, 15000, 30000, 60000];

/** 적 스폰 간격 초기값 (ms) */
export const BASE_SPAWN_RATE_MS = 1500;

/** 적 스폰 간격 최솟값 (ms) — 이 이하로 줄어들지 않음 */
export const MIN_SPAWN_RATE_MS = 400;

/** 플로우 채널 도전 배율: 현재 실력 대비 10% 높은 도전 강도 유지 */
const FLOW_CHALLENGE_MULTIPLIER = 1.1;

/**
 * 플로우 채널 목표 도전 강도
 * target = scorePerMinute * 1.1  (현재 실력 + 10%)
 * Yerkes-Dodson 법칙에 따른 최적 각성 수준 유지
 *
 * @param {number} scorePerMinute - 분당 획득 점수
 * @returns {number} 적정 도전 강도 (목표 분당 점수)
 */
export function getFlowTarget(scorePerMinute) {
    return scorePerMinute * FLOW_CHALLENGE_MULTIPLIER;
}

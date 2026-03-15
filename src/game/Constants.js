import { getMergeScore } from '../systems/BalanceEngine.js';

export const TOP_LINE_Y = 150; // Deadline Y position
export const WALL_THICKNESS = 40;

// Fruit Definitions based on standard merge game progression
// Scores are derived from BalanceEngine.getMergeScore(level) = 2^(level+1)
export const FRUITS = [
    { label: 'fruit_0',  radius: 15,  score: getMergeScore(0),  color: '#FF0000' },
    { label: 'fruit_1',  radius: 25,  score: getMergeScore(1),  color: '#FF7F00' },
    { label: 'fruit_2',  radius: 35,  score: getMergeScore(2),  color: '#FFFF00' },
    { label: 'fruit_3',  radius: 42,  score: getMergeScore(3),  color: '#00FF00' },
    { label: 'fruit_4',  radius: 50,  score: getMergeScore(4),  color: '#0000FF' },
    { label: 'fruit_5',  radius: 60,  score: getMergeScore(5),  color: '#4B0082' },
    { label: 'fruit_6',  radius: 70,  score: getMergeScore(6),  color: '#9400D3' },
    { label: 'fruit_7',  radius: 82,  score: getMergeScore(7),  color: '#FFFFFF' },
    { label: 'fruit_8',  radius: 95,  score: getMergeScore(8),  color: '#808080' },
    { label: 'fruit_9',  radius: 105, score: getMergeScore(9),  color: '#000000' },
    { label: 'fruit_10', radius: 120, score: getMergeScore(10), color: '#A52A2A' },
];

export const PHYSICS = {
    FRICTION: 0.3,
    RESTITUTION: 0.2, // Bounciness
    DENSITY: 0.001,
};

export const EVENTS = {
    MERGE: 'merge',
    GAME_OVER: 'game_over',
    SCORE_UPDATE: 'score_update',
};

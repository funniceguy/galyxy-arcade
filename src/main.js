import { Game } from './game/Game.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { LobbyScreen } from './ui/screens/LobbyScreen.js';
import { GameScreen } from './ui/screens/GameScreen.js';
import { GameOverScreen } from './ui/screens/GameOverScreen.js';
import { UpgradeScreen } from './ui/screens/UpgradeScreen.js';
import { ClearScreen } from './ui/screens/ClearScreen.js';
import { ProgressManager } from './managers/ProgressManager.js';
import { AudioManager } from './managers/AudioManager.js';

console.log("Galaxy Arcade War Game Initializing...");

window.addEventListener('load', () => {
    // Determine the height of the visible area
    const setAppHeight = () => {
        const doc = document.documentElement;
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    // Initialize Data
    const progressManager = new ProgressManager();
    const audioManager = new AudioManager();

    // Initialize Game
    const canvas = document.getElementById('world');
    const game = new Game(canvas, progressManager, audioManager);

    // Initialize UI
    const screenManager = new ScreenManager();
    screenManager.registerScreen('lobby', new LobbyScreen('screen-lobby', screenManager));
    screenManager.registerScreen('game', new GameScreen('screen-game', screenManager, game));
    screenManager.registerScreen('gameover', new GameOverScreen('screen-gameover', screenManager));
    screenManager.registerScreen('upgrade', new UpgradeScreen('screen-upgrade', screenManager, game));
    screenManager.registerScreen('clear', new ClearScreen('screen-clear', screenManager));

    // Connect Game to ScreenManager
    game.onGameOver = (score) => {
        window.currentScore = score;
        screenManager.showScreen('gameover');
    };

    game.onUpgradeRequired = () => {
        screenManager.showScreen('upgrade');
    };

    game.onVictory = (score) => {
        window.currentScore = score;
        screenManager.showScreen('clear');
    };

    // Start with Lobby Screen
    screenManager.showScreen('lobby');
});

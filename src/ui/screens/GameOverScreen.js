import { BaseScreen } from './BaseScreen.js';

export class GameOverScreen extends BaseScreen {
    constructor(elementId, screenManager) {
        super(elementId);
        this.screenManager = screenManager;

        document.getElementById('btn-lobby').addEventListener('click', () => {
            this.screenManager.showScreen('lobby');
        });
    }

    onShow() {
        // Could update final score here if passed
        const score = window.currentScore || 0; // Simple global or passed arg
        const scoreEl = document.getElementById('final-score');
        if (scoreEl) scoreEl.innerText = `Final Score: ${score}`;
    }
}

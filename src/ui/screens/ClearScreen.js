import { BaseScreen } from './BaseScreen.js';

export class ClearScreen extends BaseScreen {
    constructor(elementId, screenManager) {
        super(elementId);
        this.screenManager = screenManager;

        const btn = document.getElementById('btn-clear-lobby');
        if (btn) {
            btn.addEventListener('click', () => {
                this.screenManager.showScreen('lobby');
            });
        }
    }

    onShow() {
        // Show Score
        const scoreEl = document.getElementById('clear-score');
        if (scoreEl && window.currentScore !== undefined) {
            scoreEl.innerText = `Final Score: ${window.currentScore}`;
        }
    }
}

import { BaseScreen } from './BaseScreen.js';

export class LobbyScreen extends BaseScreen {
    constructor(elementId, screenManager) {
        super(elementId);
        this.screenManager = screenManager;

        const btn = document.getElementById('btn-play');
        if (btn) {
            btn.addEventListener('click', () => {
                this.screenManager.showScreen('game');
            });
        }
    }
}

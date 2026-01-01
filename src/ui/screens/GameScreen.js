import { BaseScreen } from './BaseScreen.js';

export class GameScreen extends BaseScreen {
    constructor(elementId, screenManager, gameInstance) {
        super(elementId);
        this.screenManager = screenManager;
        this.game = gameInstance;
    }

    onShow() {
        if (this.game) {
            this.game.start();
        }

        // Bind Items
        // Items removed
    }
}

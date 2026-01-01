export class ScreenManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
    }

    registerScreen(name, screenInstance) {
        this.screens.set(name, screenInstance);
    }

    showScreen(name) {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }

        const screen = this.screens.get(name);
        if (screen) {
            screen.show();
            this.currentScreen = screen;
        } else {
            console.error(`Screen ${name} not found.`);
        }
    }
}

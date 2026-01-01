import { BaseScreen } from './BaseScreen.js';

export class UpgradeScreen extends BaseScreen {
    constructor(elementId, screenManager, game) {
        super(elementId);
        this.screenManager = screenManager;
        this.game = game;
        this.cardsContainer = null;
    }

    onShow() {
        // Pause Game
        this.game.isGameActive = false; // Logic pause, rendering might continue or freeze

        // Clear previous cards
        const container = document.getElementById('upgrade-cards-container');
        container.innerHTML = '';
        this.cardsContainer = container;

        // Generate 3 random options
        const options = this.getOptions();

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.onclick = () => this.selectUpgrade(opt);

            const title = document.createElement('h3');
            title.innerText = opt.title;

            const desc = document.createElement('p');
            desc.innerText = opt.description;

            // Icon placeholder
            const icon = document.createElement('div');
            icon.className = 'upgrade-icon ' + opt.type;

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(desc);

            container.appendChild(card);
        });
    }

    getOptions() {
        const types = [
            { id: 'double', title: 'Double Shot', description: 'Fire two parallel beams.', type: 'weapon' },
            { id: 'homing', title: 'Homing Missiles', description: 'Projectiles seek targets.', type: 'weapon' },
            { id: 'bounce', title: 'Bounce Shot', description: 'Shots reflect off walls.', type: 'weapon' },
            { id: 'hp', title: 'Full Repair', description: 'Restore 100% HP.', type: 'heal' }
        ];

        // Shuffle and pick 3
        const shuffled = types.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    selectUpgrade(option) {
        this.game.applyUpgrade(option.id);
        this.screenManager.showScreen('game');
        this.game.resume();
    }
}

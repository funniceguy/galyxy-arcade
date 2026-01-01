export class ProgressManager {
    constructor() {
        this.STORAGE_KEY = 'lifepieces_progress';
        this.data = {
            highScore: 0,
            inventory: {
                remove: 1,
                upgrade: 1,
                vibration: 1
            },
            unlockedStories: []
        };
        this.load();
    }

    load() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.data = { ...this.data, ...parsed }; // Merge with defaults
            } catch (e) {
                console.error("Failed to load progress", e);
            }
        }
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    getHighScore() {
        return this.data.highScore;
    }

    setHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
            return true;
        }
        return false;
    }

    getInventory(type) {
        return this.data.inventory[type] || 0;
    }

    useItem(type) {
        if (this.data.inventory[type] > 0) {
            this.data.inventory[type]--;
            this.save();
            return true;
        }
        return false;
    }
}

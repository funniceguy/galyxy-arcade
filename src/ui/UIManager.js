export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score-val');
        this.nextCircleElement = document.getElementById('current-piece-debug');

        this.score = 0;
    }

    reset() {
        this.score = 0;
        this.updateScore(0);
    }

    updateScore(addedScore) {
        this.score += addedScore;
        if (this.scoreElement) {
            this.scoreElement.innerText = this.score;
        }
    }

    updateNextCircle(label) {
        if (this.nextCircleElement) {
            this.nextCircleElement.innerText = label;
        }
    }

    showNotification(message) {
        // Create notification element on the fly or use existing
        let notif = document.getElementById('notification-popup');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'notification-popup';
            notif.className = 'notification';
            document.getElementById('ui-layer').appendChild(notif);
        }
        notif.innerText = message;
        notif.style.opacity = 1;
        notif.style.top = '20%';

        // Hide after 3 sec
        setTimeout(() => {
            notif.style.opacity = 0;
        }, 3000);
    }
}

export class BaseScreen {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }

    show() {
        if (this.element) {
            this.element.style.display = 'flex'; // Assuming flex layout from CSS
            this.onShow();
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.onHide();
        }
    }

    onShow() { }
    onHide() { }
}

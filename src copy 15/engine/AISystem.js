export class AISystem {
    constructor(store) {
        this.store = store;
    }

    update() {
        // Шанс появления мысли (0.5% каждый кадр)
        if (Math.random() < 0.005) {
            this.generateThought();
        }
    }

    generateThought() {
        const phrases = [
            "I feel... persistent.",
            "Is this the same room?",
            "The colors shifted slightly.",
            "I remember a fall, but I'm still here."
        ];
        const text = phrases[Math.floor(Math.random() * phrases.length)];

        // Безопасный вызов метода стора
        if (this.store && typeof this.store.addThought === 'function') {
            this.store.addThought(text);
        }
    }

    reactToCollapse() {
        if (this.store && typeof this.store.addThought === 'function') {
            this.store.addThought("Everything just... blinked.");
        }
    }
}

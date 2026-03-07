export class AISystem {
    constructor(store) {
        this.store = store;
    }
    update() {
        if (Math.random() < 0.0005) {
            this.generateThought();
        }
    }
    generateThought() {
        const phrases = [
            "Я уверен, что на флаге было больше звезд...",
            "Иногда мне кажется, что за мной наблюдают.",
            "Почему мир краснеет перед тем, как я просыпаюсь?",
            "33 зуба... это же неправильно.",
            "Тот человек в зеркале... это все еще я?",
            "Я помню Аляску другой на картах.",
            "Тишина в этой реальности звучит слишком громко."
        ];
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        if (this.store && typeof this.store.addThought === 'function') {
            this.store.addThought(text);
        }
    }
}

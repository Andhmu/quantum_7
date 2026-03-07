export class AISystem {
    constructor(store) {
        this.store = store;
    }

    update() {
        // Очень редкие мысли персонажа (шанс 0.05% за кадр)
        if (Math.random() < 0.0005) {
            this.generateThought();
        }
    }

    // Метод, который вызывает твой SimulationEngine при столкновении (ошибка была тут)
    reactToCollapse() {
        const shockPhrases = [
            "Опять... всё сначала.",
            "Это было больно.",
            "Вспышка была ярче, чем обычно.",
            "Смерть — это просто смена координат.",
            "Я чувствую, как прошлая реальность тает.",
            "Перезагрузка сознания завершена."
        ];
        const text = shockPhrases[Math.floor(Math.random() * shockPhrases.length)];

        if (this.store && typeof this.store.addThought === 'function') {
            this.store.addThought(text);
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
            "Тишина в этой реальности звучит слишком громко.",
            "Мир кажется нестабильным, если долго не моргать."
        ];
        const text = phrases[Math.floor(Math.random() * phrases.length)];

        // Безопасный вызов экшена стора
        if (this.store && typeof this.store.addThought === 'function') {
            this.store.addThought(text);
        }
    }
}

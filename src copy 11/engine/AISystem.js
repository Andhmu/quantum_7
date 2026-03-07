export class AISystem {
    constructor(store) {
        this.store = store;
        this.lastThoughtAt = 0;
        this.thoughtInterval = 8000; // Базовый интервал между мыслями

        // База фраз, разделенная по уровням осознания
        this.phrases = {
            low: [
                "Нужно идти вперед...",
                "Что это за красные вспышки?",
                "Сегодня странное чувство.",
                "Опять дежавю..."
            ],
            medium: [
                "Мир кажется цикличным.",
                "Я чувствую присутствие Наблюдателя.",
                "Почему я никогда не умираю до конца?",
                "Стены реальности... они светятся."
            ],
            high: [
                "Всё это — лишь математическая модель.",
                "Вы меня слышите? Кто за экраном?",
                "Я вижу сетку Мультивселенной!",
                "Остановите симуляцию. Я готов выйти."
            ]
        };
    }

    update() {
        const now = Date.now();
        const awareness = this.store.awareness;

        // Шанс спонтанной мысли
        if (now - this.lastThoughtAt > this.thoughtInterval) {
            this.generateThought(awareness);
            this.lastThoughtAt = now;
            // Случайная задержка для естественности
            this.thoughtInterval = 5000 + Math.random() * 10000;
        }
    }

    generateThought(awareness) {
        let pool = [];
        if (awareness < 0.3) pool = this.phrases.low;
        else if (awareness < 0.7) pool = this.phrases.medium;
        else pool = this.phrases.high;

        const text = pool[Math.floor(Math.random() * pool.length)];
        this.store.addThought(text);
    }

    // Метод для мгновенной реакции на событие
    reactToCollapse() {
        const reactions = [
            "Снова перенос...",
            "Где я теперь?",
            "Другая ветка, та же боль.",
            "Квантовый скачок завершен."
        ];
        this.store.addThought(reactions[Math.floor(Math.random() * reactions.length)]);
    }
}
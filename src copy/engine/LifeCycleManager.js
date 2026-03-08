export class LifeCycleManager {
    constructor(store) {
        this.store = store;
        this.COLLAPSE_MS = 180000; // 3 минуты (красный тает)
        this.EMPTY_MS = 180000;    // 3 минуты (пустое место)
    }

    update() {
        if (!this.store.isInitialized) return;
        const now = Date.now();

        this.store.worlds.forEach(w => {
            // 1. Если мир разрушен — он постепенно исчезает
            if (w.type === 'collapsed') {
                const timeSinceDeath = now - w.collapsedAt;
                w.opacity = Math.max(0, 0.8 * (1 - timeSinceDeath / this.COLLAPSE_MS));

                if (timeSinceDeath >= this.COLLAPSE_MS) {
                    w.type = 'empty';
                    w.emptyAt = now;
                    w.opacity = 0;
                }
            }

            // 2. Если место пустое — ждем и возрождаем новый зеленый мир
            if (w.type === 'empty') {
                const timeSinceEmpty = now - w.emptyAt;
                if (timeSinceEmpty >= this.EMPTY_MS) {
                    w.type = 'potential';
                    w.opacity = 1;
                    w.hazards = this.store.generateHazards(); // Новые препятствия для нового мира
                    w.name = "Sector " + Math.floor(Math.random() * 900 + 100);
                }
            }
        });
    }
}
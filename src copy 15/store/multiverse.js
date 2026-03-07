import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    camera: { x: 0, y: 0, zoom: 0.8 },
    thoughts: [],
    collapseCount: 0,
    totalTime: 0,
    continuousTime: 0,
    currentWorldTime: 0,
    awareness: 0
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 550;
      const cols = Math.ceil(Math.sqrt(count));

      // Список эффектов Манделы и искажений
      const anomalies = [
        "Луна необитаема: миссия Аполлон-11 была отменена из-за бури.",
        "Джон Кеннеди выжил после покушения и правил до 1968 года.",
        "Аляска — крупнейший субъект Российской Федерации.",
        "Логотип Ford никогда не имел петельки на букве 'F'.",
        "Пикачу всегда был с полностью желтым хвостом, без черного кончика.",
        "Человечек из Монополии никогда не носил монокль.",
        "В этом мире Шерлок Холмс говорит: 'Элементарно, Уотсон' каждые 5 минут.",
        "Статуя Свободы находится на острове Эллис, а не на острове Либерти.",
        "Гитлер стал успешным художником; Вторая мировая не начиналась.",
        "Нью-Йорк называется Новый Амстердам.",
        "Тетрис был изобретен в США, а не в СССР.",
        "У человека в этой реальности 33 зуба."
      ];

      this.worlds = Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          id: i,
          x: (col - cols / 2) * spacing,
          y: (row - cols / 2) * spacing,
          name: `Реальность №${Math.floor(Math.random() * 999)}`,
          // Добавляем случайную странность к описанию
          description: anomalies[Math.floor(Math.random() * anomalies.length)],
          type: 'stable',
          radius: 225,
          opacity: 0.3,
          hazards: this.generateHazards(Math.floor(Math.random() * 5) + 3)
        };
      });

      this.activeWorldId = Math.floor(Math.random() * count);
      const startWorld = this.worlds[this.activeWorldId];
      if (startWorld) {
        this.camera.x = startWorld.x;
        this.camera.y = startWorld.y;
      }
      this.isInitialized = true;
    },

    generateHazards(count) {
      return Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        r: Math.random() * 15 + 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3
      }));
    },

    addThought(text) {
      this.thoughts.unshift({ id: Date.now(), text, life: 1.0 });
      if (this.thoughts.length > 5) this.thoughts.pop();
    },

    handleBranching() {
      const currentWorld = this.worlds[this.activeWorldId];
      if (currentWorld) currentWorld.type = 'collapsed';
      this.collapseCount++;
      this.currentWorldTime = 0;

      const stableWorlds = this.worlds.filter(w => w.type === 'stable');
      if (stableWorlds.length > 0) {
        this.activeWorldId = stableWorlds[Math.floor(Math.random() * stableWorlds.length)].id;
      } else {
        this.initMultiverse(100);
      }
    },

    tick() {
      this.totalTime++;
      this.continuousTime++;
      this.currentWorldTime++;
    }
  }
});

import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    camera: { x: 0, y: 0, zoom: 0.8 },
    history: [],
    thoughts: []
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 500;
      const cols = Math.ceil(Math.sqrt(count));

      const prefixes = ['ALPHA', 'SIGMA', 'KEPLER', 'VOID', 'ZENITH', 'NEXUS', 'CORE', 'PROXIMA'];
      const suffixes = ['PRIME', 'IX', 'B-12', 'ZERO', 'STATION', 'VOID', 'CLUSTER'];

      this.worlds = Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Более интересные названия
        const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}_${Math.floor(Math.random() * 999)}`;

        return {
          id: i,
          x: (col - cols / 2) * spacing,
          y: (row - cols / 2) * spacing,
          name: randomName,
          type: 'stable',
          radius: 225,
          opacity: 0.4,
          // Разное количество препятствий для каждого мира
          hazards: this.generateHazards(Math.floor(Math.random() * 5) + 3)
        };
      });

      this.activeWorldId = Math.floor(Math.random() * count); // Рандомный старт
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

    handleBranching() {
      const currentWorld = this.worlds[this.activeWorldId];
      if (currentWorld) {
        currentWorld.type = 'collapsed';
        currentWorld.opacity = 1.0;
      }
      this.history.push(this.activeWorldId);

      // РАНДОМНЫЙ ПЕРЕХОД: фильтруем все живые миры
      const stableWorlds = this.worlds.filter(w => w.type === 'stable');

      if (stableWorlds.length > 0) {
        // Выбираем случайный из списка живых
        const randomIndex = Math.floor(Math.random() * stableWorlds.length);
        this.activeWorldId = stableWorlds[randomIndex].id;
      } else {
        this.initMultiverse(100);
      }
    },

    addThought(text) {
      this.thoughts.unshift({ id: Date.now(), text, life: 1.0 });
      if (this.thoughts.length > 5) this.thoughts.pop();
    }
  }
});

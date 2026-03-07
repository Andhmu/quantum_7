import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    camera: { x: 0, y: 0, zoom: 0.8 }, // Чуть отдалили по умолчанию
    history: [],
    thoughts: []
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 500;
      const cols = Math.ceil(Math.sqrt(count));

      this.worlds = Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          id: i,
          x: (col - cols / 2) * spacing,
          y: (row - cols / 2) * spacing,
          name: `NODE_0x${i.toString(16).toUpperCase()}`,
          type: 'stable',
          radius: 225, // Добавили радиус в стор
          opacity: 0.4,
          hazards: this.generateHazards()
        };
      });

      this.activeWorldId = Math.floor(count / 2);
      this.isInitialized = true;
    },

    generateHazards() {
      const count = Math.floor(Math.random() * 3) + 4;
      return Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        r: Math.random() * 15 + 10,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5
      }));
    },

    addThought(text) {
      this.thoughts.unshift({ id: Date.now(), text, life: 1.0 });
      if (this.thoughts.length > 5) this.thoughts.pop();
    },

    handleBranching() {
      const currentWorld = this.worlds[this.activeWorldId];
      if (currentWorld) {
        currentWorld.type = 'collapsed';
        currentWorld.opacity = 1.0;
      }
      this.history.push(this.activeWorldId);
      const nextWorld = this.worlds.find(w => w.type === 'stable' && w.id !== this.activeWorldId);
      if (nextWorld) this.activeWorldId = nextWorld.id;
    }
  }
});

import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    camera: { x: 0, y: 0, zoom: 0.8 },
    thoughts: []
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 550;
      const cols = Math.ceil(Math.sqrt(count));

      const atmospheres = ['Dense fog', 'Electric storms', 'High Vacuum', 'Liquid neon', 'Crystal growth', 'Plasma clouds'];
      const statuses = ['Stable', 'Degrading', 'Quantum fluctuation', 'Paradoxical', 'Critical'];

      this.worlds = Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Названия в стиле Reality 23-999
        const mainId = Math.floor(Math.random() * 99) + 1;
        const subId = Math.floor(Math.random() * 999);
        const name = `Reality ${mainId}-${subId}`;

        return {
          id: i,
          x: (col - cols / 2) * spacing,
          y: (row - cols / 2) * spacing,
          name: name,
          description: `${atmospheres[Math.floor(Math.random() * atmospheres.length)]}. Status: ${statuses[Math.floor(Math.random() * statuses.length)]}. Entry code: ${Math.random().toString(36).substring(7).toUpperCase()}.`,
          type: 'stable',
          radius: 225,
          opacity: 0.3,
          hazards: this.generateHazards(Math.floor(Math.random() * 5) + 3)
        };
      });

      this.activeWorldId = Math.floor(Math.random() * count);
      // Центрируем камеру на старте
      const startWorld = this.worlds[this.activeWorldId];
      this.camera.x = startWorld.x;
      this.camera.y = startWorld.y;
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

      const stableWorlds = this.worlds.filter(w => w.type === 'stable');
      if (stableWorlds.length > 0) {
        this.activeWorldId = stableWorlds[Math.floor(Math.random() * stableWorlds.length)].id;
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

import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: null,
    isInitialized: false,
    totalCollapses: 0,
    awareness: 0,
    camera: { x: 0, y: 0, zoom: 1 },
    thoughts: []
  }),
  actions: {
    initMultiverse(count) {
      const spacing = 600; // Расстояние между мирами в координатах симуляции
      const cols = Math.ceil(Math.sqrt(count));
      const offset = ((cols - 1) * spacing) / 2;

      this.worlds = Array.from({ length: count }, (_, i) => this.generateWorld(i, spacing, cols, offset));

      const centerIdx = Math.floor(count / 2);
      this.activeWorldId = centerIdx;
      this.worlds[centerIdx].type = "active";
      this.worlds[centerIdx].opacity = 1;

      // Центрируем камеру на стартовом мире
      this.camera.x = this.worlds[centerIdx].x;
      this.camera.y = this.worlds[centerIdx].y;

      this.isInitialized = true;
    },

    generateWorld(id, spacing, cols, offset) {
      return {
        id,
        name: "U-" + id.toString(16).toUpperCase(),
        x: (id % cols) * spacing - offset,
        y: Math.floor(id / cols) * spacing - offset,
        type: "potential",
        hazards: Array.from({ length: 12 }, () => ({
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          r: Math.random() * 5 + 3
        })),
        collapsedAt: null,
        opacity: 0.2
      };
    },

    addThought(text) {
      this.thoughts.unshift({ id: Date.now(), text });
      if (this.thoughts.length > 5) this.thoughts.pop();
    },

    handleBranching() {
      const oldWorld = this.worlds[this.activeWorldId];
      if (oldWorld) {
        oldWorld.type = "collapsed";
        oldWorld.collapsedAt = Date.now();
      }

      this.totalCollapses++;
      this.awareness = Math.min(1, this.awareness + 0.05);

      const potentials = this.worlds.filter(w => w.type === "potential");
      if (potentials.length > 0) {
        const next = potentials[Math.floor(Math.random() * potentials.length)];
        this.activeWorldId = next.id;
        next.type = "active";
        next.opacity = 1;
        return next;
      }
    }
  }
});
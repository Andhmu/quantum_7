import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: null,
    totalCollapses: 0,
    isInitialized: false,
    awareness: 0
  }),
  actions: {
    initMultiverse(count) {
      const spacing = 95; 
      const cols = Math.ceil(Math.sqrt(count));
      const newWorlds = [];
      const offset = ((cols - 1) * spacing) / 2;

      for (let i = 0; i < count; i++) {
        newWorlds.push(this.generateWorld(i, spacing, cols, offset));
      }
      
      this.worlds = newWorlds;
      const centerIdx = Math.floor(count / 2);
      this.activeWorldId = centerIdx;
      this.worlds[centerIdx].type = "active";
      this.isInitialized = true;
      
      setInterval(() => { this.processUniverseLifeCycle(); }, 1000);
    },

    generateWorld(id, spacing, cols, offset) {
      const isRareSimple = Math.random() < 0.05;
      const hazardCount = isRareSimple ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 15) + 6;

      return {
        id: id,
        name: "U-" + id.toString(16).toUpperCase(),
        x: (id % cols) * spacing - offset,
        y: Math.floor(id / cols) * spacing - offset,
        type: "potential",
        hazards: Array.from({ length: hazardCount }, () => ({
          x: (Math.random() - 0.5) * 350,
          y: (Math.random() - 0.5) * 350,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          r: Math.random() * 4 + 2
        })),
        collapsedAt: null,
        opacity: 0.15 
      };
    },

    handleBranching() {
      if (this.activeWorldId === null) return;
      const oldWorld = this.worlds[this.activeWorldId];
      if (oldWorld) oldWorld.type = "collapsing";
      
      this.totalCollapses++;
      this.awareness += 0.02;

      const potentials = this.worlds.filter(w => w.type === "potential");
      if (potentials.length > 0) {
        const next = potentials[Math.floor(Math.random() * potentials.length)];
        this.activeWorldId = next.id;
        next.type = "active";
        next.opacity = 1.0;
      }
    },

    processUniverseLifeCycle() {
      const now = Date.now();
      for (let i = 0; i < this.worlds.length; i++) {
        let w = this.worlds[i];
        if (w.type === "collapsed" && w.collapsedAt) {
          const elapsed = now - w.collapsedAt;
          if (elapsed <= 180000) {
            w.opacity = 0.8 * (1 - elapsed / 180000);
          } else if (elapsed > 180000 && elapsed < 360000) {
            w.opacity = 0;
            w.type = "empty"; 
          } else if (elapsed >= 360000) {
            const spacing = 95;
            const cols = Math.ceil(Math.sqrt(this.worlds.length));
            const offset = ((cols - 1) * spacing) / 2;
            Object.assign(w, this.generateWorld(w.id, spacing, cols, offset));
          }
        }
      }
    }
  }
});

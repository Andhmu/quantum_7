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
      const spacing = 70; 
      const cols = Math.ceil(Math.sqrt(count));
      const newWorlds = [];
      
      for (let i = 0; i < count; i++) {
        // Генерируем случайное кол-во опасностей для каждого мира (от 1 до 25)
        const hazardCount = Math.floor(Math.random() * 25) + 1;
        
        newWorlds.push({
          id: i,
          name: "U-" + i.toString(16).toUpperCase(),
          x: (i % cols) * spacing + 100,
          y: Math.floor(i / cols) * spacing + 100,
          type: 'potential',
          hazardCount: hazardCount,
          // Сразу создаем координаты опасностей для этого мира
          hazards: Array.from({ length: hazardCount }, () => ({
            x: (Math.random() - 0.5) * 350, // В пределах круга R=225
            y: (Math.random() - 0.5) * 350,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            r: Math.random() * 6 + 4 // Маленькие пятна 4-10 пикселей
          }))
        });
      }
      
      this.worlds = newWorlds;
      const centerIdx = Math.floor(count / 2);
      this.activeWorldId = centerIdx;
      this.worlds[centerIdx].type = 'active';
      this.isInitialized = true;
    },

    handleBranching() {
      if (this.activeWorldId === null) return;
      this.worlds[this.activeWorldId].type = 'collapsed';
      this.totalCollapses++;
      this.awareness += 0.03;

      const potentials = this.worlds.filter(w => w.type === 'potential');
      if (potentials.length > 0) {
        const next = potentials[Math.floor(Math.random() * potentials.length)];
        this.activeWorldId = next.id;
        next.type = 'active';
      }
    }
  }
});
import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    isStarted: false, // Флаг запуска симуляции
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    camera: { x: 0, y: 0, zoom: 0.8 },
    thoughts: [],
    collapseCount: 0,
    totalTime: 0,
    continuousTime: 0,
    currentWorldTime: 0,
    awareness: 0,
    TIME_TO_VOID: 900,
    TIME_TO_REBORN: 180
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 550;
      const cols = Math.ceil(Math.sqrt(count));
      this.worlds = Array.from({ length: count }, (_, i) => this.generateNewWorld(i, spacing, cols));

      this.activeWorldId = Math.floor(Math.random() * count);
      const startWorld = this.worlds[this.activeWorldId];
      if (startWorld) {
        this.camera.x = startWorld.x;
        this.camera.y = startWorld.y;
      }
      this.isInitialized = true;
    },

    generateNewWorld(id, spacing, cols) {
      const col = id % cols;
      const row = Math.floor(id / cols);
      const anomalies = [
        "Луна необитаема: миссия Аполлон-11 была отменена.",
        "Джон Кеннеди выжил после покушения.",
        "Аляска — часть Российской Федерации.",
        "Логотип Ford без петельки на букве 'F'.",
        "Пикачу с полностью желтым хвостом.",
        "Человечек из Монополии без монокля.",
        "Нью-Йорк называется Новый Амстердам.",
        "У человека в этой реальности 33 зуба."
      ];

      return {
        id,
        x: (col - cols / 2) * spacing,
        y: (row - cols / 2) * spacing,
        name: `Реальность ${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`,
        description: anomalies[Math.floor(Math.random() * anomalies.length)],
        type: 'stable',
        radius: 225,
        opacity: 0.3,
        timer: 0,
        hazards: this.generateHazards(Math.floor(Math.random() * 5) + 3)
      };
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
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.thoughts.unshift({ id: Date.now(), text, time: timeStr });
      if (this.thoughts.length > 5) this.thoughts.pop();
    },

    handleBranching() {
      const index = this.worlds.findIndex(w => w.id === this.activeWorldId);
      if (index !== -1) {
        // Обновляем состояние через деструктуризацию для реактивности
        this.worlds[index] = { ...this.worlds[index], type: 'collapsed', timer: 0 };
      }

      this.collapseCount++;
      this.currentWorldTime = 0;

      const stableWorlds = this.worlds.filter(w => w.type === 'stable');
      if (stableWorlds.length > 0) {
        this.activeWorldId = stableWorlds[Math.floor(Math.random() * stableWorlds.length)].id;
      }
    },

    tick() {
      // Если симуляция не запущена кнопкой, время не идет
      if (!this.isStarted) return;

      this.totalTime++;
      this.continuousTime++;
      this.currentWorldTime++;

      this.worlds.forEach(w => {
        if (w.type === 'collapsed') {
          w.timer++;
          if (w.timer >= this.TIME_TO_VOID) { w.type = 'void'; w.timer = 0; }
        } else if (w.type === 'void') {
          w.timer++;
          if (w.timer >= this.TIME_TO_REBORN) {
            Object.assign(w, this.generateNewWorld(w.id, 550, 10));
          }
        }
      });
    }
  }
});

import { defineStore } from 'pinia';

export const useMultiverseStore = defineStore('multiverse', {
  state: () => ({
    worlds: [],
    activeWorldId: 0,
    isInitialized: false,
    // Камера теперь будет переопределена при старте
    camera: { x: 0, y: 0, zoom: 0.8 },
    thoughts: [],
    // Статистика квантового существования
    collapseCount: 0,
    totalTime: 0,       // Общее время работы системы
    continuousTime: 0,  // Непрерывное время жизни сознания (не сбрасывается)
    awareness: 0,       // Уровень осознания симуляции (заблокирован на 0)
    isDragging: false   // Состояние перетаскивания для синхронизации с UI
  }),

  actions: {
    initMultiverse(count = 100) {
      const spacing = 550;
      const cols = Math.ceil(Math.sqrt(count));

      // Генерация сетки миров
      this.worlds = Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        return {
          id: i,
          x: (col - cols / 2) * spacing,
          y: (row - cols / 2) * spacing,
          name: `Reality ${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`,
          description: `Quantum state: Stable superposition. Perception-dependent reality.`,
          type: 'stable',
          radius: 225,
          opacity: 0.3,
          hazards: this.generateHazards(Math.floor(Math.random() * 5) + 3)
        };
      });

      // Выбор случайного стартового мира
      this.activeWorldId = Math.floor(Math.random() * count);

      // ИСПРАВЛЕНИЕ: Принудительный перенос камеры на координаты активного мира при старте
      const startWorld = this.worlds[this.activeWorldId];
      if (startWorld) {
        this.camera.x = startWorld.x;
        this.camera.y = startWorld.y;
        this.camera.zoom = 0.8;
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
      // Ограничиваем очередь мыслей до 5 последних
      if (this.thoughts.length > 5) this.thoughts.pop();
    },

    handleBranching() {
      const currentWorld = this.worlds[this.activeWorldId];
      if (currentWorld) {
        currentWorld.type = 'collapsed';
      }

      // Квантовое бессмертие: сознание фиксирует коллапс (смерть мира),
      // но само продолжает существовать, просто перемещаясь в другую ветку.
      this.collapseCount++;

      const stableWorlds = this.worlds.filter(w => w.type === 'stable');

      if (stableWorlds.length > 0) {
        // Перемещаем сознание в случайный уцелевший мир
        this.activeWorldId = stableWorlds[Math.floor(Math.random() * stableWorlds.length)].id;
      } else {
        // Если все миры в текущем слое схлопнулись, создаем новый пласт реальности
        this.initMultiverse(100);
      }
    },

    // Метод обновления времени, вызываемый внешним таймером (раз в секунду)
    tick() {
      this.totalTime++;
      this.continuousTime++; // Время жизни сознания течет непрерывно
    }
  }
});

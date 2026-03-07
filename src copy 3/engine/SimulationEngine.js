import { Renderer } from './Renderer';
import { AISystem } from './AISystem';

export class SimulationEngine {
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.renderer = new Renderer(ctx);
    this.ai = new AISystem(store);
    this.character = { x: 0, y: 0, vx: 1.5, vy: 1.5, radius: 8 };
    this.currentHazards = [];
    this.isTransitioning = false;
  }

  update() {
    if (!this.store.isInitialized) return;

    // 1. Обновляем AI сознание
    this.ai.update();

    // 2. Логика камеры (плавное следование)
    const activeWorld = this.store.worlds[this.store.activeWorldId];
    if (activeWorld) {
      this.store.camera.x += (activeWorld.x - this.store.camera.x) * 0.1;
      this.store.camera.y += (activeWorld.y - this.store.camera.y) * 0.1;
    }

    if (this.currentHazards.length === 0) this.syncHazards();

    // 3. Физика персонажа
    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    // Проверка границ активного мира (отскок)
    const dist = Math.sqrt(Math.pow(this.character.x, 2) + Math.pow(this.character.y, 2));
    if (dist > 215) {
      const angle = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1;
      this.character.vy *= -1;
      this.character.x = Math.cos(angle) * 214;
      this.character.y = Math.sin(angle) * 214;
    }

    // 4. Коллизии с красными зонами (Исправлено здесь!)
    this.currentHazards.forEach(h => {
      h.x += h.vx;
      h.y += h.vy;

      // Отскок зон внутри мира
      if (Math.sqrt(Math.pow(h.x, 2) + Math.pow(h.y, 2)) > 220) {
        h.vx *= -1;
        h.vy *= -1;
      }

      // Столкновение персонажа с зоной
      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (this.character.radius + h.r)) {
        this.triggerBranching();
      }
    });
  }

  triggerBranching() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.ai.reactToCollapse();
    this.store.handleBranching();

    // Сброс состояния для нового мира
    this.character.x = 0;
    this.character.y = 0;
    this.syncHazards();

    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }

  syncHazards() {
    const world = this.store.worlds[this.store.activeWorldId];
    if (world) {
      this.currentHazards = JSON.parse(JSON.stringify(world.hazards));
    }
  }

  draw() {
    this.renderer.draw(this.store, this);
  }
}
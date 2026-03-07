import { AISystem } from './AISystem';
import { Renderer } from './Renderer';

export class SimulationEngine {
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.renderer = new Renderer(ctx);
    this.ai = new AISystem(store);

    this.character = { x: 0, y: 0, vx: 1.2, vy: 1.2, radius: 8 };
    this.currentHazards = [];
    this.isAnimating = false;
    this.transitionProgress = 0;
    this.pixels = [];
    this.shake = 0;
    this.dyingWorldPos = { x: 0, y: 0 };
    this.newWorldPos = { x: 0, y: 0 };
  }

  update() {
    if (!this.store.isInitialized) return;

    if (this.shake > 0) this.shake *= 0.9;

    if (this.isAnimating) {
      this.transitionProgress += 0.015;
      this.pixels.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        p.life -= 0.02;
      });
      if (this.transitionProgress >= 1) this.completeTransition();
      return;
    }

    this.ai.update();

    const activeWorld = this.store.worlds[this.store.activeWorldId];
    if (activeWorld) {
      // Камера следит за активным миром + тряска
      const sX = (Math.random() - 0.5) * this.shake;
      const sY = (Math.random() - 0.5) * this.shake;
      this.store.camera.x += (activeWorld.x - this.store.camera.x) * 0.1 + sX;
      this.store.camera.y += (activeWorld.y - this.store.camera.y) * 0.1 + sY;

      // Если список препятствий пуст (например, при первом запуске или смене мира)
      if (this.currentHazards.length === 0) {
        this.loadWorldHazards(activeWorld);
      }
    }

    // Движение персонажа
    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    // Отскок от границ мира
    const distFromCenter = Math.sqrt(this.character.x ** 2 + this.character.y ** 2);
    if (activeWorld && distFromCenter > activeWorld.radius - this.character.radius) {
      const angle = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1;
      this.character.vy *= -1;
      // Коррекция позиции, чтобы не застревал в текстурах
      this.character.x = Math.cos(angle) * (activeWorld.radius - this.character.radius - 1);
      this.character.y = Math.sin(angle) * (activeWorld.radius - this.character.radius - 1);
    }

    // ЛОГИКА СТОЛКНОВЕНИЯ С КРАСНЫМИ ЗОНАМИ (ПРЕПЯТСТВИЯМИ)
    this.currentHazards.forEach(h => {
      // Двигаем сами препятствия внутри мира
      h.x += h.vx; h.y += h.vy;

      // Отскок препятствий от стенок мира
      const hDist = Math.sqrt(h.x ** 2 + h.y ** 2);
      if (activeWorld && hDist > activeWorld.radius - h.r) {
        h.vx *= -1; h.vy *= -1;
      }

      // Проверка контакта персонажа с препятствием
      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.character.radius + h.r) {
        this.startTransition();
      }
    });
  }

  loadWorldHazards(world) {
    // Клонируем данные, чтобы не менять исходники в сторе напрямую во время симуляции
    this.currentHazards = JSON.parse(JSON.stringify(world.hazards));
  }

  startTransition() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.transitionProgress = 0;
    this.shake = 35; // Удар!

    const oldWorld = this.store.worlds[this.store.activeWorldId];
    this.dyingWorldPos = { x: oldWorld.x, y: oldWorld.y };

    // Создаем "клочья"
    this.pixels = Array.from({ length: 120 }, () => ({
      x: this.character.x, y: this.character.y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      size: Math.random() * 4 + 1,
      color: Math.random() > 0.3 ? '#ff3333' : '#ffffff',
      life: 1
    }));

    this.ai.reactToCollapse();
    this.store.handleBranching();

    const newWorld = this.store.worlds[this.store.activeWorldId];
    this.newWorldPos = { x: newWorld.x, y: newWorld.y };
  }

  completeTransition() {
    this.isAnimating = false;
    this.currentHazards = []; // Очищаем, чтобы загрузить новые из следующего мира
    this.character.x = 0;
    this.character.y = 0;
  }

  draw() {
    this.renderer.draw(this.store, this);
  }
}

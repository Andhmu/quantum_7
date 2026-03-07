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
  }

  update() {
    if (!this.store.isInitialized) return;

    const activeWorld = this.store.worlds[this.store.activeWorldId];

    // Логика камеры
    if (activeWorld) {
      // ПРИТЯГИВАЕМ камеру только во время анимации перехода
      if (this.isAnimating) {
        this.store.camera.x += (activeWorld.x - this.store.camera.x) * 0.05;
        this.store.camera.y += (activeWorld.y - this.store.camera.y) * 0.05;
        // Мягкий зум при возврате
        if (this.store.camera.zoom < 0.5) this.store.camera.zoom += 0.005;
      }
    }

    // Тряска (всегда независима)
    if (this.shake > 0) {
      this.store.camera.x += (Math.random() - 0.5) * this.shake;
      this.store.camera.y += (Math.random() - 0.5) * this.shake;
      this.shake *= 0.9;
    }

    if (this.isAnimating) {
      this.transitionProgress += 0.015;
      this.pixels.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02;
      });
      if (this.transitionProgress >= 1) this.completeTransition();
      return;
    }

    this.ai.update();
    if (this.currentHazards.length === 0 && activeWorld) this.loadHazards(activeWorld);

    // Физика персонажа
    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    const dist = Math.sqrt(this.character.x ** 2 + this.character.y ** 2);
    if (activeWorld && dist > activeWorld.radius - this.character.radius) {
      const a = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1; this.character.vy *= -1;
      this.character.x = Math.cos(a) * (activeWorld.radius - 9);
      this.character.y = Math.sin(a) * (activeWorld.radius - 9);
    }

    // Коллизии
    this.currentHazards.forEach(h => {
      h.x += h.vx; h.y += h.vy;
      const hDist = Math.sqrt(h.x ** 2 + h.y ** 2);
      if (activeWorld && hDist > activeWorld.radius - h.r) { h.vx *= -1; h.vy *= -1; }

      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      if (Math.sqrt(dx * dx + dy * dy) < this.character.radius + h.r) this.startTransition();
    });
  }

  loadHazards(world) {
    this.currentHazards = JSON.parse(JSON.stringify(world.hazards));
  }

  startTransition() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.transitionProgress = 0;
    this.shake = 30;
    const oldWorld = this.store.worlds[this.store.activeWorldId];
    this.dyingWorldPos = { x: oldWorld.x, y: oldWorld.y };
    this.pixels = Array.from({ length: 100 }, () => ({
      x: this.character.x, y: this.character.y,
      vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
      size: Math.random() * 3 + 1, color: '#ff3333', life: 1
    }));
    this.store.handleBranching();
  }

  completeTransition() {
    this.isAnimating = false;
    this.currentHazards = [];
    this.character.x = 0; this.character.y = 0;
  }

  draw() { this.renderer.draw(this.store, this); }
}

import { AISystem } from './AISystem';
import { Renderer } from './Renderer';

export class SimulationEngine {
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.renderer = new Renderer(ctx); // Инициализируем рендер внутри
    this.ai = new AISystem(store);

    this.character = { x: 0, y: 0, vx: 0.8, vy: 0.8, radius: 8 };
    this.currentHazards = [];

    this.isAnimating = false;
    this.transitionProgress = 0;
    this.pixels = [];
    this.dyingWorldPos = { x: 0, y: 0 };
    this.newWorldPos = { x: 0, y: 0 };
  }

  update() {
    if (!this.store.isInitialized) return;

    if (this.isAnimating) {
      this.transitionProgress += 0.015;
      this.pixels.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      });
      if (this.transitionProgress >= 1) this.completeTransition();
      return;
    }

    this.ai.update();

    const activeWorld = this.store.worlds[this.store.activeWorldId];
    if (activeWorld) {
      this.store.camera.x += (activeWorld.x - this.store.camera.x) * 0.1;
      this.store.camera.y += (activeWorld.y - this.store.camera.y) * 0.1;
    }

    if (this.currentHazards.length === 0) this.loadWorld();

    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    const dist = Math.sqrt(Math.pow(this.character.x, 2) + Math.pow(this.character.y, 2));
    if (dist > 215) {
      const a = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1;
      this.character.vy *= -1;
      this.character.x = Math.cos(a) * 214;
      this.character.y = Math.sin(a) * 214;
    }

    this.currentHazards.forEach(h => {
      h.x += h.vx; h.y += h.vy;
      if (Math.sqrt(Math.pow(h.x, 2) + Math.pow(h.y, 2)) > 220) { h.vx *= -1; h.vy *= -1; }

      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      if (Math.sqrt(dx * dx + dy * dy) < (this.character.radius + h.r)) {
        this.startTransition();
      }
    });
  }

  startTransition() {
    this.isAnimating = true;
    this.transitionProgress = 0;
    const oldWorld = this.store.worlds[this.store.activeWorldId];
    this.dyingWorldPos = { x: oldWorld.x, y: oldWorld.y };

    this.pixels = Array.from({ length: 60 }, () => ({
      x: this.character.x,
      y: this.character.y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      size: Math.random() * 4 + 1,
      life: 1
    }));

    this.ai.reactToCollapse();
    this.store.handleBranching();

    const newWorld = this.store.worlds[this.store.activeWorldId];
    this.newWorldPos = { x: newWorld.x, y: newWorld.y };
  }

  completeTransition() {
    this.isAnimating = false;
    this.currentHazards = [];
    this.character.x = 0;
    this.character.y = 0;
  }

  loadWorld() {
    const w = this.store.worlds[this.store.activeWorldId];
    if (w) this.currentHazards = JSON.parse(JSON.stringify(w.hazards));
  }

  draw() {
    // ВАЖНО: вызываем отрисовку через сохраненный экземпляр рендерера
    this.renderer.draw(this.store, this);
  }
}

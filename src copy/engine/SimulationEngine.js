export class SimulationEngine {
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.character = { x: 0, y: 0, vx: 0.7, vy: 0.7, radius: 8 };
    this.currentHazards = [];
    this.transitionProgress = 0;
    this.isAnimating = false;
    this.pixels = [];
    this.dyingWorldId = null;
    this.dyingWorldPos = { x: 0, y: 0 };
    this.newWorldPos = { x: 0, y: 0 };
  }

  update() {
    if (!this.store.isInitialized) return;

    if (this.isAnimating) {
      this.transitionProgress += 0.01;
      this.pixels.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; });
      if (this.transitionProgress >= 1) this.completeTransition();
      return;
    }

    if (this.currentHazards.length === 0) this.loadWorld();

    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    if (Math.sqrt(this.character.x**2 + this.character.y**2) > 215) {
      const a = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1; this.character.vy *= -1;
      this.character.x = Math.cos(a) * 214;
      this.character.y = Math.sin(a) * 214;
    }

    this.currentHazards.forEach(h => {
      h.x += h.vx; h.y += h.vy;
      if (Math.sqrt(h.x*h.x + h.y*h.y) > 220) { h.vx *= -1; h.vy *= -1; }
      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      if (Math.sqrt(dx*dx + dy*dy) < (this.character.radius + h.r)) {
        this.startTransition();
      }
    });
  }

  startTransition() {
    this.isAnimating = true;
    this.transitionProgress = 0;
    this.dyingWorldId = this.store.activeWorldId;
    const dyingWorld = this.store.worlds[this.dyingWorldId];
    this.dyingWorldPos = { x: dyingWorld.x, y: dyingWorld.y };
    
    this.pixels = Array.from({ length: 50 }, () => ({
      x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 3 + 1, life: 1
    }));
    
    this.store.handleBranching();
    const newWorld = this.store.worlds[this.store.activeWorldId];
    this.newWorldPos = { x: newWorld.x, y: newWorld.y };
  }

  completeTransition() {
    const world = this.store.worlds[this.dyingWorldId];
    if (world) {
      world.type = 'collapsed';
      world.collapsedAt = Date.now();
      world.opacity = 0.8;
    }
    this.isAnimating = false;
    this.currentHazards = [];
    this.character.x = 0; this.character.y = 0;
    this.character.vx = (Math.random() - 0.5) * 1.4;
    this.character.vy = (Math.random() - 0.5) * 1.4;
  }

  loadWorld() {
    const w = this.store.worlds[this.store.activeWorldId];
    if (w) this.currentHazards = JSON.parse(JSON.stringify(w.hazards)).filter(h => Math.sqrt(h.x*h.x + h.y*h.y) > 70);
  }

  draw() {
    const ctx = this.ctx;
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 1. СЕТКА
    this.store.worlds.forEach(w => {
      const wx = cx + w.x;
      const wy = cy + w.y;

      if (w.type === 'active') {
        // ЭФФЕКТ ПУСТОГО МЕСТА: рисуем только тонкий пунктирный или тусклый контур гнезда
        ctx.beginPath();
        ctx.arc(wx, wy, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 255, 65, 0.1)";
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Рисуем неактивные миры
        ctx.globalAlpha = w.opacity;
        ctx.beginPath();
        ctx.arc(wx, wy, 7, 0, Math.PI * 2);
        ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
        ctx.fill();
        ctx.globalAlpha = 1;

        // Названия под мирами в сетке
        ctx.fillStyle = w.type === 'collapsed' ? "rgba(255, 51, 51, 0.4)" : "rgba(0, 255, 65, 0.3)";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(w.name, wx, wy + 15);
      }
    });

    if (this.isAnimating) {
      const p = this.transitionProgress;
      this.pixels.forEach(px => {
        ctx.fillStyle = "rgba(255, 50, 50, " + px.life + ")";
        ctx.fillRect(cx + px.x, cy + px.y, px.size, px.size);
      });

      // УЛЕТАЮЩИЙ мир (в гнездо)
      const oldX = cx + (this.dyingWorldPos.x * p);
      const oldY = cy + (this.dyingWorldPos.y * p);
      this.drawWorldCircle(ctx, oldX, oldY, 225 * (1 - p), "#ff3333");

      // ПРИЛЕТАЮЩИЙ мир (из гнезда)
      const newX = cx + (this.newWorldPos.x * (1 - p));
      const newY = cy + (this.newWorldPos.y * (1 - p));
      this.drawWorldCircle(ctx, newX, newY, 225 * p, "#00ff41");

    } else {
      const active = this.store.worlds[this.store.activeWorldId];
      this.drawWorldCircle(ctx, cx, cy, 225, "#00ff41");
      
      ctx.fillStyle = "#00ff41";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText(active ? active.name : "", cx, cy - 245);

      this.currentHazards.forEach(h => {
        ctx.beginPath(); ctx.arc(cx + h.x, cy + h.y, h.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 50, 50, 0.7)"; ctx.fill();
      });
      this.drawMan(ctx, cx + this.character.x, cy + this.character.y);
    }
  }

  drawWorldCircle(ctx, x, y, r, color) {
    if (r < 1) return;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }

  drawMan(ctx, x, y) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(x, y - 7, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 3, y - 3, 6, 9);
    ctx.fillRect(x - 6, y - 2, 12, 2);
    ctx.fillRect(x - 2, y + 6, 1.5, 5);
    ctx.fillRect(x + 0.5, y + 6, 1.5, 5);
  }
}
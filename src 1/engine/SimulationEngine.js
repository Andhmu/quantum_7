export class SimulationEngine {
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.character = { x: 0, y: 0, vx: 2, vy: 2, radius: 8 };
    this.currentHazards = [];
    this.transitionProgress = 0;
    this.isAnimating = false;
    this.targetWorldPos = { x: 0, y: 0 };
  }

  update() {
    if (!this.store.isInitialized) return;

    if (this.isAnimating) {
      this.transitionProgress += 0.02;
      if (this.transitionProgress >= 1) {
        this.completeTransition();
      }
      return;
    }

    // Загружаем опасности, если мир только что сменился
    if (this.currentHazards.length === 0) {
      this.loadWorldData();
    }

    // Физика человека
    this.character.x += this.character.vx;
    this.character.y += this.character.vy;

    const dist = Math.sqrt(this.character.x**2 + this.character.y**2);
    if (dist > 210) {
      const angle = Math.atan2(this.character.y, this.character.x);
      this.character.vx *= -1; this.character.vy *= -1;
      this.character.x = Math.cos(angle) * 209;
      this.character.y = Math.sin(angle) * 209;
    }

    // Физика маленьких пятен
    this.currentHazards.forEach(h => {
      h.x += h.vx; h.y += h.vy;
      // Отскок пятен от стенок
      if (Math.sqrt(h.x**2 + h.y**2) > 215) { h.vx *= -1; h.vy *= -1; }

      // Проверка смерти
      const dx = this.character.x - h.x;
      const dy = this.character.y - h.y;
      if (Math.sqrt(dx*dx + dy*dy) < (this.character.radius + h.r)) {
        this.startTransition();
      }
    });
  }

  loadWorldData() {
    const world = this.store.worlds[this.store.activeWorldId];
    if (world) {
      // Клонируем данные опасностей, чтобы не менять оригинал в сторе
      this.currentHazards = JSON.parse(JSON.stringify(world.hazards));
      
      // БЕЗОПАСНОСТЬ: Убираем опасности из центра (радиус 50), чтобы не умереть сразу
      this.currentHazards = this.currentHazards.filter(h => {
        const d = Math.sqrt(h.x*h.x + h.y*h.y);
        return d > 50; 
      });
    }
  }

  startTransition() {
    this.isAnimating = true;
    this.transitionProgress = 0;
    const activeWorld = this.store.worlds[this.store.activeWorldId];
    this.targetWorldPos = { x: activeWorld.x, y: activeWorld.y };
    this.store.handleBranching();
  }

  completeTransition() {
    this.isAnimating = false;
    this.transitionProgress = 0;
    this.currentHazards = []; // Сброс для загрузки новых в следующем кадре
    this.character.x = 0;
    this.character.y = 0;
    this.character.vx = (Math.random() - 0.5) * 5;
    this.character.vy = (Math.random() - 0.5) * 5;
  }

  draw() {
    const { ctx } = this;
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 1. СЕТКА
    this.store.worlds.forEach(w => {
      if (w.type !== 'active') {
        ctx.beginPath();
        ctx.arc(w.x, w.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = w.type === 'collapsed' ? '#ff3333' : '#00ff4122';
        ctx.fill();
        if (w.type !== 'collapsed') {
           ctx.fillStyle = '#00ff4144';
           ctx.font = '7px monospace';
           ctx.fillText(w.name, w.x - 12, w.y + 15);
        }
      }
    });

    // 2. АНИМАЦИЯ
    if (this.isAnimating) {
      const p = this.transitionProgress;
      // Улетающий мир
      this.drawWorld(ctx, cx + (this.targetWorldPos.x - cx) * p, cy + (this.targetWorldPos.y - cy) * p, 225 * (1-p), '#ff3333');
      // Прилетающий мир
      const next = this.store.worlds[this.store.activeWorldId];
      this.drawWorld(ctx, next.x + (cx - next.x) * p, next.y + (cy - next.y) * p, 225 * p, '#00ff41');
    } else {
      this.drawWorld(ctx, cx, cy, 225, '#00ff41');
      this.drawHazards(ctx, cx, cy);
      this.drawMan(ctx, cx + this.character.x, cy + this.character.y);
    }
  }

  drawWorld(ctx, x, y, r, color) {
    if (r < 1) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color + '11';
    ctx.fill();
  }

  drawHazards(ctx, cx, cy) {
    this.currentHazards.forEach(h => {
      ctx.beginPath();
      ctx.arc(cx + h.x, cy + h.y, h.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3333aa';
      ctx.fill();
      // Эффект свечения пятна
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ff3333';
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  drawMan(ctx, x, y) {
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff41';
    // Голова
    ctx.beginPath(); ctx.arc(x, y - 7, 4, 0, Math.PI * 2); ctx.fill();
    // Торс
    ctx.fillRect(x - 3, y - 3, 6, 9);
    // Руки
    ctx.fillRect(x - 7, y - 2, 14, 2);
    // Ноги
    ctx.fillRect(x - 3, y + 6, 2, 5);
    ctx.fillRect(x + 1, y + 6, 2, 5);
    ctx.shadowBlur = 0;
  }
}
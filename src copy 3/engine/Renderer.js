export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(store, engine) {
        const { ctx } = this;
        const { width, height } = ctx.canvas;
        const { camera, worlds, activeWorldId } = store;

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        // Трансформация камеры (центрирование и зум)
        ctx.translate(width / 2, height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // 1. Отрисовка всех миров
        worlds.forEach(w => {
            this.drawWorld(w, store, engine);
        });

        ctx.restore();
    }

    drawWorld(w, store, engine) {
        const ctx = this.ctx;
        const isActive = w.id === store.activeWorldId;
        const radius = 225;

        // Оболочка мира
        ctx.beginPath();
        ctx.arc(w.x, w.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? "#00ff41" : (w.type === 'collapsed' ? "#ff3333" : "#444");
        ctx.globalAlpha = w.opacity || 0.2;
        ctx.lineWidth = 2 / store.camera.zoom;
        ctx.stroke();

        if (isActive) {
            // Имя мира
            ctx.fillStyle = "#00ff41";
            ctx.font = `${20 / store.camera.zoom}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(w.name, w.x, w.y - radius - 20);

            // Препятствия
            engine.currentHazards.forEach(h => {
                ctx.beginPath();
                ctx.arc(w.x + h.x, w.y + h.y, h.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
                ctx.fill();
            });

            // Персонаж
            this.drawCharacter(w.x + engine.character.x, w.y + engine.character.y);
        }
        ctx.globalAlpha = 1;
    }

    drawCharacter(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(x, y - 7, 4, 0, Math.PI * 2); ctx.fill(); // Голова
        ctx.fillRect(x - 3, y - 3, 6, 9); // Тело
    }
}
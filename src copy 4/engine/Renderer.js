export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(store, engine) {
        const ctx = this.ctx;
        const { width, height } = ctx.canvas;
        const { camera, worlds } = store;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // Фоновые миры
        worlds.forEach(w => {
            if (w.id === store.activeWorldId && !engine.isAnimating) return;
            ctx.globalAlpha = w.opacity || 0.5;
            ctx.beginPath();
            ctx.arc(w.x, w.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        if (engine.isAnimating) {
            const p = engine.transitionProgress;
            // Отрисовка клочьев
            engine.pixels.forEach(px => {
                ctx.fillStyle = `rgba(255, 50, 50, ${px.life})`;
                ctx.fillRect(engine.dyingWorldPos.x + px.x, engine.dyingWorldPos.y + px.y, px.size, px.size);
            });
            this.drawWorldCircle(ctx, engine.dyingWorldPos.x, engine.dyingWorldPos.y, 225 * (1 - p), "#ff3333");
            this.drawWorldCircle(ctx, engine.newWorldPos.x, engine.newWorldPos.y, 225 * p, "#00ff41");
        } else {
            const active = store.worlds[store.activeWorldId];
            if (active) {
                this.drawWorldCircle(ctx, active.x, active.y, 225, "#00ff41");

                // Имя мира (обратные кавычки исправлены)
                ctx.fillStyle = "#00ff41";
                ctx.font = `${20 / camera.zoom}px monospace`;
                ctx.textAlign = "center";
                ctx.fillText(active.name, active.x, active.y - 245);

                // Препятствия
                engine.currentHazards.forEach(h => {
                    ctx.beginPath();
                    ctx.arc(active.x + h.x, active.y + h.y, h.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 50, 50, 0.7)";
                    ctx.fill();
                });

                // Человечек
                this.drawMan(ctx, active.x + engine.character.x, active.y + engine.character.y);
            }
        }
        ctx.restore();
    }

    drawWorldCircle(ctx, x, y, r, color) {
        if (r < 1) return;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
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

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(store, engine) {
        const ctx = this.ctx;
        const { width, height } = ctx.canvas;
        const { camera, worlds, thoughts, activeWorldId } = store;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        worlds.forEach(w => {
            const isCurrent = w.id === activeWorldId;

            // Рисуем все миры в сетке
            ctx.save();
            ctx.globalAlpha = isCurrent ? 1.0 : w.opacity;

            // Внешняя граница мира
            ctx.beginPath();
            ctx.arc(w.x, w.y, isCurrent ? w.radius : 30, 0, Math.PI * 2);
            ctx.strokeStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.lineWidth = isCurrent ? 3 : 2;
            if (isCurrent) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#00ff41";
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Название мира (теперь всегда видно над миром)
            ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.font = `${isCurrent ? 24 : 12}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(w.name, w.x, w.y - (isCurrent ? w.radius + 20 : 45));
            ctx.restore();

            // Отрисовка препятствий ТОЛЬКО для активного мира
            if (isCurrent && !engine.isAnimating) {
                engine.currentHazards.forEach(h => {
                    ctx.beginPath();
                    ctx.arc(w.x + h.x, w.y + h.y, h.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
                    ctx.fill();
                });

                // Отрисовка мыслей
                thoughts.forEach((t, i) => {
                    ctx.fillStyle = `rgba(255, 255, 255, ${t.life})`;
                    ctx.font = "16px monospace";
                    ctx.fillText(t.text, w.x + engine.character.x, w.y + engine.character.y - 40 - (i * 20));
                    t.life -= 0.005;
                });

                this.drawMan(ctx, w.x + engine.character.x, w.y + engine.character.y);
            }
        });

        // Эффект расщепления (клочья)
        if (engine.isAnimating) {
            engine.pixels.forEach(px => {
                ctx.fillStyle = px.color;
                ctx.globalAlpha = px.life;
                ctx.fillRect(engine.dyingWorldPos.x + px.x, engine.dyingWorldPos.y + px.y, px.size, px.size);
            });
        }

        ctx.restore();
    }

    drawMan(ctx, x, y) {
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(x, y - 7, 4, 0, Math.PI * 2); ctx.fill(); // Голова
        ctx.fillRect(x - 3, y - 3, 6, 9);  // Тело
        ctx.fillRect(x - 6, y - 2, 12, 2); // Руки
        ctx.fillRect(x - 2, y + 6, 1.5, 5); // Ноги
        ctx.fillRect(x + 0.5, y + 6, 1.5, 5);
    }
}

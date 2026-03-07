export class Renderer {
    constructor(ctx) { this.ctx = ctx; }

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

            // Считаем динамический радиус для появления нового мира
            let displayRadius = isCurrent ? w.radius : 30;
            let opacity = isCurrent ? 1.0 : (w.type === 'collapsed' ? 0.7 : w.opacity);

            if (isCurrent && engine.isAnimating) {
                // Проявляем новый мир только когда камера начинает движение (после 60% прогресса)
                if (engine.transitionProgress > 0.6) {
                    const growProgress = (engine.transitionProgress - 0.6) / 0.4;
                    displayRadius = 30 + (w.radius - 30) * growProgress;
                    opacity = growProgress;
                } else {
                    return; // Старый мир уже взорван, новый еще не виден
                }
            }

            ctx.save();
            ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.arc(w.x, w.y, displayRadius, 0, Math.PI * 2);
            ctx.strokeStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.lineWidth = isCurrent ? 3 : 2;

            if (isCurrent) {
                ctx.shadowBlur = 15 * opacity;
                ctx.shadowColor = "#00ff41";
            }
            ctx.stroke();

            // Название мира
            ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.font = `${isCurrent ? 24 : 12}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(w.name, w.x, w.y - (displayRadius + 25));
            ctx.restore();

            // Контент активного мира (только когда анимация закончена)
            if (isCurrent && !engine.isAnimating) {
                engine.currentHazards.forEach(h => {
                    ctx.beginPath();
                    ctx.arc(w.x + h.x, w.y + h.y, h.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
                    ctx.fill();
                });

                thoughts.forEach((t, i) => {
                    ctx.fillStyle = `rgba(255, 255, 255, ${t.life})`;
                    ctx.font = "16px monospace";
                    ctx.fillText(t.text, w.x + engine.character.x, w.y + engine.character.y - 45 - (i * 20));
                    t.life -= 0.005;
                });

                this.drawMan(ctx, w.x + engine.character.x, w.y + engine.character.y);
            }
        });

        // Отрисовка расщепления (только частицы-клочья)
        if (engine.isAnimating) {
            engine.pixels.forEach(px => {
                ctx.fillStyle = px.color;
                ctx.globalAlpha = px.life;
                ctx.fillRect(engine.dyingWorldPos.x + px.x, engine.dyingWorldPos.y + px.y, px.size, px.size);
            });
            // БЕЛАЯ ОБВОДКА УДАЛЕНА ОТСЮДА
        }

        ctx.restore();
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

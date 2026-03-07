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

            // Считаем динамический радиус для анимации появления
            let displayRadius = isCurrent ? w.radius : 30;
            let opacity = isCurrent ? 1.0 : (w.type === 'collapsed' ? 0.7 : w.opacity);

            if (isCurrent && engine.isAnimating) {
                // Мир начинает расти только во второй половине анимации (после взрыва старого)
                if (engine.transitionProgress > 0.6) {
                    const growProgress = (engine.transitionProgress - 0.6) / 0.4; // 0 to 1
                    displayRadius = 30 + (w.radius - 30) * growProgress;
                    opacity = growProgress;
                } else {
                    return; // Пока идет взрыв старого, новый еще не рисуем
                }
            }

            ctx.save();
            ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.arc(w.x, w.y, displayRadius, 0, Math.PI * 2);
            ctx.strokeStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.lineWidth = isCurrent ? 3 : 2;

            if (isCurrent) {
                ctx.shadowBlur = 15 * (opacity);
                ctx.shadowColor = "#00ff41";
            }
            ctx.stroke();

            // Текст названия тоже плавно проявляется
            ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.font = `${isCurrent ? 24 : 12}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(w.name, w.x, w.y - (displayRadius + 25));
            ctx.restore();

            // Начинка (препятствия и человечек) появляется только когда мир почти вырос
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

        // Эффекты расщепления старого мира
        if (engine.isAnimating) {
            engine.pixels.forEach(px => {
                ctx.fillStyle = px.color;
                ctx.globalAlpha = px.life;
                ctx.fillRect(engine.dyingWorldPos.x + px.x, engine.dyingWorldPos.y + px.y, px.size, px.size);
            });

            ctx.beginPath();
            ctx.arc(engine.dyingWorldPos.x, engine.dyingWorldPos.y, engine.transitionProgress * 250, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - engine.transitionProgress})`;
            ctx.lineWidth = 3;
            ctx.stroke();
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

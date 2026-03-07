export class Renderer {
    constructor(ctx) { this.ctx = ctx; }

    draw(store, engine) {
        const ctx = this.ctx;
        const { width, height } = ctx.canvas;
        const { camera, worlds, activeWorldId, TIME_TO_VOID } = store;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        worlds.forEach(w => {
            if (w.type === 'void') return;

            const isCurrent = w.id === activeWorldId;
            let displayRadius = isCurrent ? w.radius : 30;
            let opacity = isCurrent ? 1.0 : (w.type === 'collapsed' ? 0.7 : w.opacity);

            if (w.type === 'collapsed') {
                const fade = 1 - (w.timer / TIME_TO_VOID);
                opacity *= fade;
            }

            if (isCurrent && engine.isAnimating) {
                if (engine.transitionProgress > 0.6) {
                    const growProgress = (engine.transitionProgress - 0.6) / 0.4;
                    displayRadius = 30 + (w.radius - 30) * growProgress;
                    opacity = growProgress;
                } else { return; }
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

            ctx.fillStyle = w.type === 'collapsed' ? "#ff3333" : "#00ff41";
            ctx.font = `${isCurrent ? 20 : 12}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(w.name, w.x, w.y - (displayRadius + 25));
            ctx.restore();

            if (isCurrent && !engine.isAnimating) {
                engine.currentHazards.forEach(h => {
                    ctx.beginPath();
                    ctx.arc(w.x + h.x, w.y + h.y, h.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
                    ctx.fill();
                });
                this.drawMan(ctx, w.x + engine.character.x, w.y + engine.character.y);
            }
        });

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
        ctx.beginPath();
        ctx.arc(x, y - 7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 3, y - 3, 6, 9);
        ctx.fillRect(x - 6, y - 2, 12, 2);
        ctx.fillRect(x - 2, y + 6, 1.5, 5);
        ctx.fillRect(x + 0.5, y + 6, 1.5, 5);
    }
}

<template>
  <div class="multiverse-wrapper">
    <canvas 
      ref="canvasRef" 
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      class="main-canvas"
    ></canvas>

    <div class="quantum-monitor">
      <div class="monitor-header">НЕЙРОННАЯ_СВЯЗЬ_УСТАНОВЛЕНА</div>
      <div class="stat-group">
        <div class="entry">
          <label>КВАНТОВЫХ_СКАЧКОВ</label>
          <span class="val">{{ store.collapseCount || 0 }}</span>
        </div>
        <div class="entry">
          <label>НЕПРЕРЫВНОЕ_СУЩЕСТВОВАНИЕ</label>
          <span class="val">{{ formatTime(store.continuousTime || 0) }}</span>
        </div>
      </div>
      <div class="awareness-container">
        <div class="label-row">
          <span>ОСОЗНАНИЕ_СИМУЛЯЦИИ</span>
          <span>{{ store.awareness || 0 }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: (store.awareness || 0) + '%' }"></div>
        </div>
        <div class="status-msg">СИСТЕМА: СУБЪЕКТ_НЕ_ПОДОЗРЕВАЕТ_О_НАБЛЮДАТЕЛЕ</div>
      </div>
    </div>

    <Transition name="slide">
      <div class="side-panel" v-if="activeWorld">
        <div class="scanline"></div>
        <div class="panel-header">
          <span class="status-dot"></span>
          <h2>{{ activeWorld.name }}</h2>
        </div>
        <div class="divider"></div>
        
        <div class="anomaly-box">
          <label>ИСКАЖЕНИЕ_РЕАЛЬНОСТИ:</label>
          <p class="desc">{{ activeWorld.description }}</p>
        </div>

        <div class="footer">
          <div class="stat-item">
            <label>ВРЕМЯ_В_ЭТОМ_МИРЕ</label>
            <span>{{ formatTime(store.currentWorldTime || 0) }}</span>
          </div>
          <div class="stat-item">
            <label>УГРОЗЫ</label>
            <span>{{ engine?.currentHazards?.length || 0 }} ЕД.</span>
          </div>
          <div class="stat-item">
            <label>КООРДИНАТЫ</label>
            <span>{{ Math.round(activeWorld.x || 0) }}:{{ Math.round(activeWorld.y || 0) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
const activeWorld = computed(() => store.worlds[store.activeWorldId]);
let engine = null;
let raf = null;
let timer = null;

const formatTime = (s) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// Управление
let isDragging = false;
let lastPos = { x: 0, y: 0 };
const handleMouseDown = (e) => { if (e.button === 0) { isDragging = true; lastPos = { x: e.clientX, y: e.clientY }; } };
const handleMouseMove = (e) => {
  if (isDragging) {
    store.camera.x -= (e.clientX - lastPos.x) / store.camera.zoom;
    store.camera.y -= (e.clientY - lastPos.y) / store.camera.zoom;
    lastPos = { x: e.clientX, y: e.clientY };
  }
};
const handleMouseUp = () => isDragging = false;
const handleWheel = (e) => {
  const delta = e.deltaY * 0.001;
  store.camera.zoom = Math.min(Math.max(store.camera.zoom - delta, 0.05), 2.5);
};

const animate = () => {
  if (engine) { engine.update(); engine.draw(); }
  raf = requestAnimationFrame(animate);
};

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  store.initMultiverse(100);
  engine = new SimulationEngine(canvas.getContext('2d'), store);
  animate();
  timer = setInterval(() => store.tick(), 1000);
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  clearInterval(timer);
});
</script>

<style scoped>
.multiverse-wrapper { position: relative; width: 100vw; height: 100vh; background: #000; overflow: hidden; }
.main-canvas { display: block; cursor: grab; }
.main-canvas:active { cursor: grabbing; }

/* Квантовый монитор (Слева) */
.quantum-monitor {
  position: absolute; top: 50%; left: 30px; transform: translateY(-50%);
  width: 280px; background: rgba(0, 20, 0, 0.6); border: 1px solid rgba(0, 255, 65, 0.3);
  padding: 20px; font-family: 'Monospace', monospace; color: #00ff41; pointer-events: none;
  z-index: 10;
}
.monitor-header { font-size: 10px; letter-spacing: 1px; margin-bottom: 15px; opacity: 0.8; border-bottom: 1px solid rgba(0, 255, 65, 0.2); padding-bottom: 5px; }
.stat-group { display: flex; flex-direction: column; gap: 15px; }
.entry label { font-size: 9px; opacity: 0.5; display: block; margin-bottom: 4px; }
.entry .val { font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #00ff41; }

.awareness-container { margin-top: 25px; }
.label-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 5px; }
.progress-track { width: 100%; height: 2px; background: rgba(0, 255, 65, 0.1); }
.progress-fill { height: 100%; background: #00ff41; box-shadow: 0 0 10px #00ff41; transition: width 0.5s ease; }
.status-msg { margin-top: 10px; font-size: 8px; opacity: 0.4; font-style: italic; }

/* Правая панель */
.side-panel {
  position: absolute; top: 30px; right: 30px; width: 320px;
  background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2); padding: 25px;
  color: #fff; font-family: 'Monospace', monospace; border-radius: 4px;
}
.panel-header { display: flex; align-items: center; gap: 12px; }
.status-dot { width: 10px; height: 10px; background: #00ff41; border-radius: 50%; box-shadow: 0 0 12px #00ff41; }
h2 { margin: 0; font-size: 20px; color: #00ff41; letter-spacing: 1px; }
.divider { height: 1px; background: rgba(255,255,255,0.15); margin: 20px 0; }

.anomaly-box label { font-size: 10px; color: #00ff41; opacity: 0.7; display: block; margin-bottom: 8px; }
.desc { font-size: 14px; line-height: 1.5; opacity: 0.9; margin: 0; color: #eee; }

.footer { margin-top: 30px; display: flex; flex-direction: column; gap: 12px; }
.stat-item { display: flex; justify-content: space-between; font-size: 11px; border-bottom: 1px dotted rgba(255,255,255,0.1); padding-bottom: 4px; }
.stat-item label { opacity: 0.5; }
.stat-item span { color: #00ff41; font-weight: bold; }

.slide-enter-active, .slide-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(120%); opacity: 0; }
</style>

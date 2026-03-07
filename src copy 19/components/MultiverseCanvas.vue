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

    <div class="thought-bar" v-if="store.thoughts.length > 0">
      <Transition name="fade-thought" mode="out-in">
        <div class="thought-item" :key="store.thoughts[0].id">
          <span class="timestamp">[{{ store.thoughts[0].time }}] ВНУТРЕННИЙ_ГОЛОС:</span>
          <span class="text">{{ store.thoughts[0].text }}</span>
        </div>
      </Transition>
    </div>

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
          <br>
          <span>{{ store.awareness || 0 }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: (store.awareness || 0) + '%' }"></div>
        </div>
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
            <label>ВРЕМЯ_В_МИРЕ</label>
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
  if (!store.isInitialized) store.initMultiverse(100);
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

.thought-bar {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
  width: 600px; background: rgba(0, 15, 0, 0.8); border-left: 3px solid #00ff41;
  padding: 12px 25px; font-family: 'Monospace', monospace; pointer-events: none;
  backdrop-filter: blur(8px); z-index: 100; box-shadow: 0 5px 20px rgba(0,0,0,0.5);
}
.thought-item { display: flex; gap: 15px; align-items: center; }
.timestamp { color: #00ff41; font-size: 11px; opacity: 0.6; }
.text { color: #fff; font-size: 13px; letter-spacing: 0.5px; }

.quantum-monitor {
  position: absolute; top: 50%; left: 30px; transform: translateY(-50%);
  width: 280px; background: rgba(0, 20, 0, 0.6); border: 1px solid rgba(0, 255, 65, 0.3);
  padding: 20px; font-family: 'Monospace', monospace; color: #00ff41; pointer-events: none;
}
.monitor-header { font-size: 10px; margin-bottom: 15px; opacity: 0.8; border-bottom: 1px solid rgba(0, 255, 65, 0.2); }
.stat-group { display: flex; flex-direction: column; gap: 15px; }
.entry label { font-size: 9px; opacity: 0.5; display: block; }
.entry .val { font-size: 18px; font-weight: bold; }
.awareness-container { margin-top: 25px; }
.progress-track { width: 100%; height: 2px; background: rgba(0, 255, 65, 0.1); margin-top: 5px; }
.progress-fill { height: 100%; background: #00ff41; box-shadow: 0 0 10px #00ff41; }

.side-panel {
  position: absolute; top: 30px; right: 30px; width: 320px;
  background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2); padding: 25px;
  color: #fff; font-family: 'Monospace', monospace; border-radius: 4px;
}
.scanline {
  position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: rgba(0, 255, 65, 0.1); animation: scan 4s linear infinite;
}
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }
.status-dot { width: 10px; height: 10px; background: #00ff41; border-radius: 50%; display: inline-block; margin-right: 10px; }
h2 { margin: 0; font-size: 20px; color: #00ff41; display: inline-block; }
.anomaly-box label { font-size: 10px; color: #00ff41; display: block; margin: 15px 0 5px; }
.desc { font-size: 14px; opacity: 0.9; line-height: 1.4; }
.footer { margin-top: 30px; display: flex; flex-direction: column; gap: 10px; }
.stat-item { display: flex; justify-content: space-between; font-size: 11px; }
.stat-item label { opacity: 0.5; }
.stat-item span { color: #00ff41; }

.fade-thought-enter-active, .fade-thought-leave-active { transition: all 0.5s ease; }
.fade-thought-enter-from { opacity: 0; transform: translateY(10px); }
.fade-thought-leave-to { opacity: 0; transform: translateY(-10px); }
.slide-enter-active, .slide-leave-active { transition: all 0.5s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(120%); opacity: 0; }
</style>

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

    <Transition name="slide">
      <div class="side-panel" v-if="activeWorld">
        <div class="scanline"></div>
        <div class="panel-header">
          <span class="status-dot"></span>
          <h2>{{ activeWorld.name }}</h2>
        </div>
        <div class="divider"></div>
        <p class="desc">{{ activeWorld.description }}</p>
        <div class="footer">
          <div class="stat-item">
            <label>THREATS</label>
            <span>{{ engine?.currentHazards.length || 0 }} UNITS</span>
          </div>
          <div class="stat-item">
            <label>COORDS</label>
            <span>{{ Math.round(activeWorld.x) }}:{{ Math.round(activeWorld.y) }}</span>
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

// Drag logic
let isDragging = false;
let lastPos = { x: 0, y: 0 };

const handleMouseDown = (e) => {
  if (e.button === 0) {
    isDragging = true;
    lastPos = { x: e.clientX, y: e.clientY };
  }
};

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
  if (engine) {
    engine.update();
    engine.draw();
  }
  raf = requestAnimationFrame(animate);
};

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  store.initMultiverse(100);
  engine = new SimulationEngine(canvas.getContext('2d'), store);
  animate();
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

onUnmounted(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.multiverse-wrapper { position: relative; width: 100vw; height: 100vh; background: #000; }
.main-canvas { display: block; cursor: grab; }
.main-canvas:active { cursor: grabbing; }

.side-panel {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 300px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 25px;
  color: #fff;
  font-family: 'Monospace', monospace;
  border-radius: 2px;
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
}

.panel-header { display: flex; align-items: center; gap: 10px; }
.status-dot { width: 8px; height: 8px; background: #00ff41; border-radius: 50%; box-shadow: 0 0 10px #00ff41; }
h2 { margin: 0; font-size: 18px; letter-spacing: 1px; color: #00ff41; }

.divider { height: 1px; background: rgba(255,255,255,0.2); margin: 15px 0; }
.desc { font-size: 13px; line-height: 1.6; opacity: 0.8; margin: 0; }

.footer { margin-top: 25px; display: flex; flex-direction: column; gap: 10px; }
.stat-item { display: flex; justify-content: space-between; font-size: 10px; }
.stat-item label { opacity: 0.5; }
.stat-item span { color: #00ff41; }

/* Анимация появления */
.slide-enter-active, .slide-leave-active { transition: all 0.5s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); opacity: 0; }

</style>

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

    <div class="awareness-overlay">
      <div class="stat-line">
        <label>TIMELINE_COLLAPSES:</label>
        <span>{{ store.collapseCount }}</span>
      </div>
      <div class="stat-line">
        <label>CURRENT_REALITY_TIME:</label>
        <span>{{ formatTime(store.sessionTime) }}</span>
      </div>
      <div class="stat-line">
        <label>TOTAL_REALITY_TIME:</label>
        <span>{{ formatTime(store.totalTime) }}</span>
      </div>
      
      <div class="awareness-label">AWARENESS_LEVEL:</div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: awarenessProgress + '%' }"></div>
      </div>
      <div class="percent-text">{{ awarenessProgress }}%</div>
    </div>

    <Transition name="slide">
      <div class="side-panel" v-if="activeWorld">
        <div class="panel-header">
          <span class="status-dot"></span>
          <h2>{{ activeWorld.name }}</h2>
        </div>
        <div class="divider"></div>
        <p class="desc">{{ activeWorld.description }}</p>
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

// Вычисление прогресса осознанности (например, 100% за 5 минут в одном мире)
const awarenessProgress = computed(() => {
  return Math.min(Math.floor((store.sessionTime / 300) * 100), 100);
});

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// ... (логика управления камерой handleMouseDown, handleWheel и т.д. остается прежней)

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  store.initMultiverse(100);
  engine = new SimulationEngine(canvas.getContext('2d'), store);
  
  const animate = () => {
    engine.update();
    engine.draw();
    raf = requestAnimationFrame(animate);
  };
  animate();

  // Запуск системного таймера
  timer = setInterval(() => store.tick(), 1000);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  clearInterval(timer);
});
</script>

<style scoped>
.multiverse-wrapper { position: relative; width: 100vw; height: 100vh; background: #000; overflow: hidden; }
.main-canvas { display: block; }

/* Стиль блока статистики как на фото */
.awareness-overlay {
  position: absolute;
  top: 50%;
  left: 40px;
  transform: translateY(-50%);
  width: 320px;
  padding: 20px;
  background: rgba(0, 255, 65, 0.05);
  border: 1px solid rgba(0, 255, 65, 0.4);
  color: #00ff41;
  font-family: 'Monospace', monospace;
  pointer-events: none;
}

.stat-line { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.awareness-label { margin-top: 20px; font-size: 12px; opacity: 0.8; }

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(0, 255, 65, 0.1);
  margin-top: 10px;
  border: 1px solid rgba(0, 255, 65, 0.3);
}

.progress-fill {
  height: 100%;
  background: #00ff41;
  box-shadow: 0 0 15px #00ff41;
  transition: width 1s linear;
}

.percent-text { text-align: right; margin-top: 5px; font-size: 16px; font-weight: bold; }

/* Правая панель */
.side-panel {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 280px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  color: white;
}
</style>

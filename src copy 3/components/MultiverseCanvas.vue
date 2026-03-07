<template>
  <div class="simulation-container">
    <canvas ref="canvasRef" @wheel="handleZoom"></canvas>
    <div class="ui-overlay">
      <div class="thought-bubble" v-if="store.thoughts.length">
        {{ store.thoughts[0].text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
let engine = null;
let raf = null;

const handleZoom = (e) => {
  const zoomSpeed = 0.001;
  store.camera.zoom -= e.deltaY * zoomSpeed;
  store.camera.zoom = Math.max(0.05, Math.min(2, store.camera.zoom));
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
  const ctx = canvas.getContext('2d');
  
  engine = new SimulationEngine(ctx, store);
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

onUnmounted(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.simulation-container { width: 100%; height: 100%; overflow: hidden; background: #000; }
canvas { display: block; }
.ui-overlay { position: absolute; bottom: 10%; width: 100%; pointer-events: none; display: flex; justify-content: center; }
.thought-bubble { background: rgba(0,0,0,0.7); color: #00ff41; padding: 15px; border: 1px solid #00ff41; font-family: monospace; text-transform: uppercase; }
</style>
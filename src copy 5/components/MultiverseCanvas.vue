<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
let engine = null;
let raf = null;

const handleWheel = (e) => {
  // Зум: крутим колесико — меняем масштаб
  const zoomSpeed = 0.001;
  const newZoom = store.camera.zoom - e.deltaY * zoomSpeed;
  store.camera.zoom = Math.min(Math.max(newZoom, 0.05), 2.0);
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
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  store.initMultiverse(100);
  engine = new SimulationEngine(ctx, store);
  
  window.addEventListener('wheel', handleWheel); // Слушаем колесико
  animate();
});

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <canvas ref="canvasRef" class="multiverse-canvas"></canvas>
</template>

<style scoped>
.multiverse-canvas { display: block; background: #000; }
</style>

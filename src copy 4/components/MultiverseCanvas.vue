<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
let engine = null;
let raf = null;

const animate = () => {
  if (engine) {
    engine.update();
    engine.draw(); // Теперь это вызывает renderer.draw внутри движка
  }
  raf = requestAnimationFrame(animate);
};

onMounted(() => {
  const ctx = canvasRef.value.getContext('2d');
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  
  engine = new SimulationEngine(ctx, store);
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
});
</script>

<template>
  <canvas ref="canvasRef" class="multiverse-canvas"></canvas>
</template>

<style scoped>
.multiverse-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

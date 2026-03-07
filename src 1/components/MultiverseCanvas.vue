<template>
<canvas ref="canvasRef" class="simulation-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
let engine = null;
let raf = null;

const init = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  
  engine = new SimulationEngine(ctx, store);
  animate();
};

const animate = () => {
  if (engine) {
    engine.update();
    engine.draw();
  }
  raf = requestAnimationFrame(animate);
};

onMounted(init);
onUnmounted(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.simulation-canvas { position: fixed; top: 0; left: 0; background: #000; }
</style>
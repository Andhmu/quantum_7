<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMultiverseStore } from '../store/multiverse';
import { SimulationEngine } from '../engine/SimulationEngine';

const canvasRef = ref(null);
const store = useMultiverseStore();
let engine = null;
let raf = null;

// Состояние для перемещения карты
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

const handleMouseDown = (e) => {
  if (e.button === 0) { // Левая кнопка мыши
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
  }
};

const handleMouseMove = (e) => {
  if (isDragging) {
    const dx = (e.clientX - lastMousePos.x) / store.camera.zoom;
    const dy = (e.clientY - lastMousePos.y) / store.camera.zoom;
    
    // Двигаем камеру в обратную сторону от движения мыши (панорамирование)
    store.camera.x -= dx;
    store.camera.y -= dy;
    
    lastMousePos = { x: e.clientX, y: e.clientY };
  }
};

const handleMouseUp = () => {
  isDragging = false;
};

const handleWheel = (e) => {
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
  
  // Слушатели событий
  window.addEventListener('wheel', handleWheel);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  
  animate();
});

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <canvas ref="canvasRef" class="multiverse-canvas"></canvas>
</template>

<style scoped>
.multiverse-canvas { display: block; background: #000; cursor: grab; }
.multiverse-canvas:active { cursor: grabbing; }
</style>

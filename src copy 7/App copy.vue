<template>
  <div class="multiverse-app">
    <MultiverseCanvas />
    <div class="debug-info">
      Collapses: {{ store.totalCollapses }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMultiverseStore } from './store/multiverse';
import MultiverseCanvas from './components/MultiverseCanvas.vue';

const store = useMultiverseStore();

onMounted(() => {
  store.initMultiverse(400); 
});
</script>

<style>
body { margin: 0; background: #000; color: #00ff41; font-family: monospace; overflow: hidden; }
.multiverse-app { width: 100vw; height: 100vh; position: relative; }
.debug-info { 
  position: absolute; top: 10px; left: 10px; 
  color: #00ff41; z-index: 100; pointer-events: none;
}
</style>

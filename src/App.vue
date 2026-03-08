<template>
  <div class="multiverse-app">
    <MultiverseCanvas />

    <div class="observer-interface" v-if="store.isInitialized">
      <header class="hud-header">
        <h1>MULTIVERSE_SIMULATOR_V7</h1>
        <div class="status-blink">REC // ACTIVE</div>
      </header>

    </div>

    <div class="loading-screen" v-else>
      <div class="loader">INITIALIZING_MULTIVERSE...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useMultiverseStore } from './store/multiverse';
import MultiverseCanvas from './components/MultiverseCanvas.vue';

const store = useMultiverseStore();

const currentWorldName = computed(() => {
  const active = store.worlds[store.activeWorldId];
  return active ? active.name : 'UNKNOWN';
});

onMounted(() => {
  // Инициализируем 400 миров
  store.initMultiverse(400);
});
</script>

<style>
/* Глобальные стили для "хакерской" эстетики */
body {
  margin: 0;
  padding: 0;
  background: #000;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  user-select: none;
}

.multiverse-app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* Интерфейс поверх холста */
.observer-interface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Чтобы клики проходили на канвас */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  padding-bottom: 10px;
}

.hud-header h1 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 2px;
}

.status-blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.stats-panel {
  width: 300px;
  background: rgba(0, 20, 0, 0.6);
  padding: 15px;
  border: 1px solid rgba(0, 255, 65, 0.5);
  pointer-events: auto;
}

.stat-item {
  margin-bottom: 15px;
}

.label {
  display: block;
  font-size: 12px;
  margin-bottom: 5px;
  opacity: 0.8;
}

.value {
  font-size: 20px;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 255, 65, 0.1);
  margin: 5px 0;
  border: 1px solid #00ff41;
}

.progress-fill {
  height: 100%;
  background: #00ff41;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px #00ff41;
}

.hud-footer {
  text-align: right;
  font-size: 10px;
  letter-spacing: 1px;
}

.loading-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
@media screen and (max-width: 768px) {
  .hud-header h1 {
  margin: 0;
  font-size: 9px;
  letter-spacing: 2px;
}
.status-blink {
   font-size: 9px;
}
}
</style>
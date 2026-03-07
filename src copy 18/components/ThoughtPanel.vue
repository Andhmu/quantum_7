<template>
  <div class="thought-panel">
    <div class="awareness">Awareness: {{ (store.totalCollapses * 0.05).toFixed(2) }}</div>
    <div class="current-thought">{{ currentThought }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMultiverseStore } from '../store/multiverse';

const store = useMultiverseStore();
const currentThought = ref("Где я? Кажется, это место мне знакомо...");

const thoughts = [
  "Опять это чувство дежавю...",
  "Почему мир кажется таким... цифровым?",
  "Я только что видел свою смерть в красном круге?",
  "Наблюдатель, ты здесь?",
  "Вероятность моего существования стремится к единице.",
  "Сколько раз я уже просыпался в центре этого круга?"
];

// Каждый раз при расщеплении (коллапсе) меняем мысль
watch(() => store.totalCollapses, () => {
  currentThought.value = thoughts[Math.floor(Math.random() * thoughts.length)];
});
</script>

<style scoped>
.thought-panel {
  position: absolute; bottom: 30px; left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff41;
  padding: 15px 30px;
  color: #00ff41;
  text-align: center;
  min-width: 300px;
}
.awareness { font-size: 10px; opacity: 0.6; margin-bottom: 5px; }
</style>
<template>
  <div class="multiverse-wrapper">
    <Transition name="fade-overlay">
      <div class="start-overlay" v-if="!store.isStarted">
        <div class="intro-window">
          <div class="window-header">
            <span class="pulse-dot"></span>
            ПРОТОКОЛ_ИНИЦИАЛИЗАЦИИ: MULTIVERSE_OBSERVER_v3.4
          </div>
          
          <div class="window-content">
            <div class="scientific-text">
              <p>
                Данный терминал осуществляет доступ к <strong>Многомировой интерпретации Эверетта (MWI)</strong>, 
                оперируя векторами состояний в бесконечномерном Гильбертовом пространстве. Согласно принципам 
                квантовой суперпозиции, каждое взаимодействие в системе не просто порождает исход, 
                а инициирует нелокальное ветвление всей Вселенной.
              </p>
              <p>
                <strong>ТЕОРЕМА НАБЛЮДАТЕЛЯ:</strong> Ваше присутствие здесь не является пассивным. 
                Согласно концепции квантового зацепления, акт наблюдения фиксирует конкретную итерацию реальности, 
                однако при критических флуктуациях возникают когнитивные диссонансы — 
                <strong>Ретроактивные галлюцинации (Эффект Манделы)</strong>. Это свидетельства того, 
                что ваша память содержит паттерны из соседних ветвей, которые подверглись коллапсу.
              </p>
              <p>
                <strong>ГИПОТЕЗА СИМУЛЯЦИИ:</strong> Окружающее пространство является дискретным цифровым конструктом. 
                Коллапс миров в этой среде — это не конец материи, а оптимизация вычислительных мощностей 
                архитектора симуляции через процедурную аннигиляцию нестабильных узлов.
              </p>
              <p>
                <strong>КВАНТОВАЯ НЕУЯЗВИМОСТЬ:</strong> В рамках данной модели отрицательный опыт (уход) субъекта в одной ветви 
                лишь переносит фокус сознания в альтернативную реальность, где условия выживания были соблюдены. 
                Вы обречены на бесконечное наблюдение за распадом и созиданием.
              </p>
              <p class="warning">
                ДИРЕКТИВА: Исследуйте аномалии, фиксируйте расхождения в хронологии и помните: 
                в этой системе не существует "ошибок", есть только альтернативные переменные.
              </p>
            </div>
            
            <button class="launch-btn" @click="startSimulation">
              ИНИЦИИРОВАТЬ_СЕАНС
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <canvas 
      ref="canvasRef" 
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      class="main-canvas"
      :class="{ 'blur-bg': !store.isStarted }"
    ></canvas>

    <template v-if="store.isStarted">
      <div class="ui-mobile-wrapper">
        
        <div class="ui-top-stack">
          <div class="quantum-monitor">
            <div class="monitor-header">НЕЙРОННАЯ_СВЯЗЬ_УСТАНОВЛЕНА</div>
            <div class="stat-group">
              <div class="entry">
                <label>КВАНТОВЫХ_СКАЧКОВ</label>
                <span class="val">{{ store.collapseCount || 0 }}</span>
              </div>
              <div class="entry">
                <label>НЕПРЕРЫВНОЕ_СУЩЕСТВОВАНИЕ</label>
                <span class="val">{{ formatTime(store.continuousTime || 0) }}</span>
              </div>
              <div class="entry mobile-only-awareness">
                <label>ОСОЗНАНИЕ: {{ store.awareness || 0 }}%</label>
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: (store.awareness || 0) + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="awareness-container desktop-only-awareness">
              <div class="label-row">
                <span>ОСОЗНАНИЕ_СИМУЛЯЦИИ</span>
                <span>{{ store.awareness || 0 }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: (store.awareness || 0) + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="thought-bar" v-if="store.thoughts.length > 0">
            <Transition name="fade-thought" mode="out-in">
              <div class="thought-item" :key="store.thoughts[0].id">
                <span class="timestamp">[{{ store.thoughts[0].time }}] ВНУТРЕННИЙ_ГОЛОС:</span>
                <span class="text">{{ store.thoughts[0].text }}</span>
              </div>
            </Transition>
          </div>
        </div>

        <div class="ui-spacer"></div>

        <Transition name="slide">
          <div 
            class="side-panel" 
            v-if="activeWorld"
            :class="{ 'glitch-mode': activeWorld.type === 'collapsed' }"
          >
            <div class="scanline"></div>
            <div class="panel-header">
              <span class="status-dot"></span>
              <h2>{{ activeWorld.name }}</h2>
            </div>
            <div class="divider"></div>
            <div class="anomaly-box">
              <label>ИСКАЖЕНИЕ_РЕАЛЬНОСТИ:</label>
              <p class="desc">{{ activeWorld.description }}</p>
            </div>
            <div class="footer">
              <div class="stat-item">
                <label>ВРЕМЯ_В_МИРЕ</label>
                <span>{{ formatTime(store.currentWorldTime || 0) }}</span>
              </div>
              <div class="stat-item">
                <label>УГРОЗЫ</label>
                <span>{{ engine?.currentHazards?.length || 0 }} ЕД.</span>
              </div>
              <div class="stat-item">
                <label>КООРДИНАТЫ</label>
                <span>{{ Math.round(activeWorld.x || 0) }}:{{ Math.round(activeWorld.y || 0) }}</span>
              </div>
            </div>
          </div>
        </Transition>

      </div>
    </template>
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

let isDragging = false;
let lastPos = { x: 0, y: 0 };
let initialPinchDist = 0;
let initialZoom = 1;

const startSimulation = () => {
  store.isStarted = true;
};

const formatTime = (s) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const handleMouseDown = (e) => { if (e.button === 0) { isDragging = true; lastPos = { x: e.clientX, y: e.clientY }; } };
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

const getDist = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    isDragging = false;
    initialPinchDist = getDist(e.touches[0], e.touches[1]);
    initialZoom = store.camera.zoom;
  }
};

const handleTouchMove = (e) => {
  if (isDragging && e.touches.length === 1) {
    store.camera.x -= (e.touches[0].clientX - lastPos.x) / store.camera.zoom;
    store.camera.y -= (e.touches[0].clientY - lastPos.y) / store.camera.zoom;
    lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    const currentDist = getDist(e.touches[0], e.touches[1]);
    const factor = currentDist / initialPinchDist;
    store.camera.zoom = Math.min(Math.max(initialZoom * factor, 0.05), 2.5);
  }
};
const handleTouchEnd = () => isDragging = false;

const animate = () => {
  if (engine) { 
    if (store.isStarted) engine.update();
    engine.draw(); 
  }
  raf = requestAnimationFrame(animate);
};

const updateLayout = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  if (window.innerWidth < 768) {
    store.camera.zoom = 0.45;
  } else {
    store.camera.zoom = 0.8;
  }
};

onMounted(() => {
  updateLayout();
  if (!store.isInitialized) store.initMultiverse(100);
  engine = new SimulationEngine(canvasRef.value.getContext('2d'), store);
  animate();
  timer = setInterval(() => store.tick(), 1000);
  window.addEventListener('resize', updateLayout);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  clearInterval(timer);
  window.removeEventListener('resize', updateLayout);
});
</script>

<style scoped>
/* ДЕСКТОПНЫЕ СТИЛИ (ОРИГИНАЛ) */
.ui-mobile-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
.ui-top-stack, .side-panel, .launch-btn, .scientific-text { pointer-events: auto; }
.ui-spacer { flex-grow: 1; }
.multiverse-wrapper { position: relative; width: 100vw; height: 100vh; background: #000; overflow: hidden; font-family: 'Monospace', monospace; }
.main-canvas { display: block; cursor: grab; transition: filter 1.2s ease; }
.blur-bg { filter: blur(10px) grayscale(0.6); }

.start-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.7); z-index: 1000; padding: 20px; box-sizing: border-box; }
.intro-window { width: 650px; max-width: 100%; max-height: 85vh; background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.15); backdrop-filter: blur(30px); border-radius: 4px; box-shadow: 0 30px 60px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; }
.window-header { flex-shrink: 0; background: rgba(255, 255, 255, 0.05); padding: 15px 25px; font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 12px; }
.pulse-dot { width: 6px; height: 6px; background: #00ff41; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.2); } }
.window-content { padding: 30px 40px; display: flex; flex-direction: column; overflow: hidden; flex-grow: 1; }
.scientific-text { color: rgba(255, 255, 255, 0.85); font-size: 13px; line-height: 1.7; margin-bottom: 30px; border-left: 1px solid #00ff41; padding-left: 25px; padding-right: 15px; overflow-y: auto; flex-grow: 1; text-align: justify; }
.scientific-text::-webkit-scrollbar { width: 4px; display: block; }
.scientific-text::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
.scientific-text::-webkit-scrollbar-thumb { background: #00ff41; }
.scientific-text strong { color: #00ff41; font-weight: normal; text-transform: uppercase; }
.scientific-text p { margin-bottom: 18px; }
.warning { color: #ff3333; font-weight: bold !important; border-top: 1px solid rgba(255,51,51,0.2); padding-top: 15px; }
.launch-btn { flex-shrink: 0; width: 100%; background: transparent; border: 1px solid #00ff41; color: #00ff41; padding: 18px; font-family: inherit; font-size: 12px; cursor: pointer; transition: all 0.4s ease; letter-spacing: 4px; text-transform: uppercase; }
.launch-btn:hover { background: #00ff41; color: #000; box-shadow: 0 0 30px rgba(0, 255, 65, 0.4); }

.side-panel { position: absolute; top: 60px; right: 30px; width: 320px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); padding: 25px; color: #fff; border-radius: 4px; }
.side-panel.glitch-mode { background: rgba(255, 51, 51, 0.25) !important; border-color: #ff3333 !important; animation: panel-shake 0.1s infinite !important; box-shadow: 0 0 30px rgba(255, 51, 51, 0.4) !important; }
@keyframes panel-shake { 0% { transform: translate(0,0); } 25% { transform: translate(-2px, 1px); } 50% { transform: translate(2px, -1px); } 75% { transform: translate(-1px, -2px); } 100% { transform: translate(1px, 2px); } }

.thought-bar { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 600px; max-width: 90%; background: rgba(0, 15, 0, 0.8); border-left: 3px solid #00ff41; padding: 12px 25px; z-index: 100; backdrop-filter: blur(10px); }
.thought-item { display: flex; gap: 15px; color: #fff; font-size: 13px; align-items: center; }
.timestamp { color: #00ff41; opacity: 0.6; font-size: 11px; }

.quantum-monitor { position: absolute; top: 50%; left: 30px; transform: translateY(-50%); width: 280px; background: rgba(0, 20, 0, 0.6); border: 1px solid rgba(0, 255, 65, 0.3); padding: 25px; color: #00ff41; }
.monitor-header { font-size: 10px; margin-bottom: 20px; opacity: 0.7; border-bottom: 1px solid rgba(0, 255, 65, 0.2); padding-bottom: 5px; }
.stat-group { display: flex; flex-direction: column; gap: 15px; }
.entry label { font-size: 9px; opacity: 0.5; display: block; margin-bottom: 4px; }
.entry .val { font-size: 18px; font-weight: bold; }
.awareness-container { margin-top: 30px; }
.label-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; }
.progress-track { width: 100%; height: 2px; background: rgba(0, 255, 65, 0.1); }
.progress-fill { height: 100%; background: #00ff41; box-shadow: 0 0 15px #00ff41; transition: width 0.3s ease; }

.scanline { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 65, 0.02) 50%); background-size: 100% 4px; pointer-events: none; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }
.status-dot { width: 8px; height: 8px; background: #00ff41; border-radius: 50%; display: inline-block; margin-right: 12px; box-shadow: 0 0 8px #00ff41; }
h2 { margin: 0; font-size: 18px; color: #00ff41; display: inline-block; text-transform: uppercase; letter-spacing: 1px; }
.anomaly-box label { font-size: 9px; color: #00ff41; display: block; margin: 15px 0 5px; opacity: 0.8; }
.desc { font-size: 14px; opacity: 0.9; line-height: 1.5; color: #fff; }
.footer { margin-top: 35px; display: flex; flex-direction: column; gap: 12px; }
.stat-item { display: flex; justify-content: space-between; font-size: 10px; }
.stat-item label { opacity: 0.5; }

/* Управление видимостью шкал для разных версий */
.mobile-only-awareness { display: none; }

/* --- МОБИЛЬНАЯ АДАПТАЦИЯ (УЛЬТРА-СЖАТИЕ БЕЗ СЛОМА ДЕСКТОПА) --- */
/* --- МОБИЛЬНАЯ АДАПТАЦИЯ --- */
@media screen and (max-width: 768px) {
  .ui-mobile-wrapper { padding: 0; }

  /* 1. ПАНЕЛЬ СТАТИСТИКИ (ВЕРХ) */
.quantum-monitor { 
    position: absolute; 
    top: 30px; /* СДВИГ: ровно под высоту шапки из App.vue */
    left: 0; 
    width: 100%; 
    transform: none; 
    padding: 6px 12px; 
    background: rgba(0, 10, 0, 0.85); /* Чуть прозрачнее для глубины */
    border-width: 0 0 1px 0; 
    box-sizing: border-box; 
    z-index: 3;
    backdrop-filter: blur(4px);
  }
  .monitor-header { margin-bottom: 4px; font-size: 8px; }
  .stat-group { flex-direction: row; gap: 10px; align-items: center; justify-content: space-between; }
  .entry label { font-size: 7px; margin-bottom: 2px; }
  .entry .val { font-size: 11px; }
  .desktop-only-awareness { display: none; }
  .mobile-only-awareness { display: flex !important; flex-direction: column; flex-grow: 1; max-width: 80px; }
  .mobile-only-awareness .progress-track { margin-top: 4px; }

  /* 2. ПАНЕЛЬ ИНФОРМАЦИИ (КОМПАКТНАЯ + ЭФФЕКТ МОНИТОРА) */
  .side-panel { 
    position: absolute; 
    bottom: 38px; /* Стыкуется ровно над полосой мыслей */
    left: 0; right: 0; top: auto; width: 100%; 
    padding: 6px 12px; /* Ужали отступы вдвое */
    border-radius: 0; 
    border-width: 1px 0 0 0; 
    /* Возвращаем стекло и полупрозрачность для эффекта монитора */
    background: rgba(5, 20, 5, 0.7); 
    backdrop-filter: blur(8px);
    box-sizing: border-box; z-index: 2;
  }
  
  /* Усиливаем сканлайны специально для мобильной версии, чтобы их было лучше видно */
  .scanline {
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 65, 0.06) 50%);
    z-index: 10;
  }

  h2 { font-size: 11px; margin: 0; }
  .divider { margin: 4px 0; } /* Тоньше отступ */
  .anomaly-box label { margin: 2px 0; font-size: 7px; }
  .desc { 
    font-size: 9px; line-height: 1.2; margin: 0;
    /* Оставляем строго 1 строку текста с многоточием */
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; 
  }
  
  /* Перестроили нижнюю статистику горизонтально, чтобы сэкономить высоту */
  .footer { 
    margin-top: 6px; padding-top: 4px; flex-direction: row; 
    justify-content: space-between; gap: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .stat-item { font-size: 7px; flex-direction: row; align-items: center; gap: 4px; }
  .stat-item label { margin: 0; }

  /* 3. ПОЛОСА МЫСЛЕЙ (НИЗ) */
  .thought-bar { 
    position: absolute; bottom: 0; left: 0; transform: none; 
    width: 100%; max-width: 100%;
    padding: 8px 12px; 
    background: rgba(0, 20, 0, 0.95);
    border-left: none; border-top: 1px solid #00ff41;
    box-sizing: border-box; z-index: 3;
    height: 38px; /* Ужали высоту */
    display: flex; align-items: center;
  }
  .thought-item { font-size: 8px; gap: 6px; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .timestamp { font-size: 7px; }
}


/* АНИМАЦИИ */
.fade-overlay-leave-active { transition: opacity 1.2s ease; }
.fade-overlay-leave-to { opacity: 0; }
.fade-thought-enter-active, .fade-thought-leave-active { transition: all 0.5s ease; }
.fade-thought-enter-from { opacity: 0; transform: translateY(10px); }
.fade-thought-leave-to { opacity: 0; transform: translateY(-10px); }
.slide-enter-active, .slide-leave-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>

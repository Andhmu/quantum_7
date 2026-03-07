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
      class="main-canvas"
      :class="{ 'blur-bg': !store.isStarted }"
    ></canvas>

    <template v-if="store.isStarted">
      <div class="thought-bar" v-if="store.thoughts.length > 0">
        <Transition name="fade-thought" mode="out-in">
          <div class="thought-item" :key="store.thoughts[0].id">
            <span class="timestamp">[{{ store.thoughts[0].time }}] ВНУТРЕННИЙ_ГОЛОС:</span>
            <span class="text">{{ store.thoughts[0].text }}</span>
          </div>
        </Transition>
      </div>

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
        </div>
        <div class="awareness-container">
          <div class="label-row">
            <span>ОСОЗНАНИЕ_СИМУЛЯЦИИ</span>
            <span>{{ store.awareness || 0 }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: (store.awareness || 0) + '%' }"></div>
          </div>
        </div>
      </div>

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

const startSimulation = () => {
  store.isStarted = true;
};

const formatTime = (s) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// Взаимодействие
let isDragging = false;
let lastPos = { x: 0, y: 0 };
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

const animate = () => {
  if (engine) { 
    if (store.isStarted) engine.update();
    engine.draw(); 
  }
  raf = requestAnimationFrame(animate);
};

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (!store.isInitialized) store.initMultiverse(100);
  engine = new SimulationEngine(canvas.getContext('2d'), store);
  animate();
  timer = setInterval(() => store.tick(), 1000);
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  clearInterval(timer);
});
</script>

<style scoped>
.multiverse-wrapper { 
  position: relative; width: 100vw; height: 100vh; background: #000; 
  overflow: hidden; font-family: 'Monospace', monospace; 
}
.main-canvas { display: block; cursor: grab; transition: filter 1.2s ease; }
.blur-bg { filter: blur(10px) grayscale(0.6); }

/* ОКНО ЗАПУСКА */
.start-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.7); z-index: 1000;
}

.intro-window {
  width: 650px; 
  max-height: 85vh; /* Ограничиваем высоту окна */
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15); 
  backdrop-filter: blur(30px);
  border-radius: 4px; 
  box-shadow: 0 30px 60px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column; /* Элементы идут друг под другом */
  overflow: hidden;
}

.window-header {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05); padding: 15px 25px;
  font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; align-items: center; gap: 12px;
}

.pulse-dot { width: 6px; height: 6px; background: #00ff41; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.2); } }

.window-content { 
  padding: 30px 40px; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; /* Важно для скролла внутри */
  flex-grow: 1;
}

.scientific-text {
  color: rgba(255, 255, 255, 0.85); 
  font-size: 13px; 
  line-height: 1.7;
  margin-bottom: 30px; 
  border-left: 1px solid #00ff41; 
  padding-left: 25px;
  padding-right: 15px;
  overflow-y: auto; /* ВКЛЮЧАЕМ СКРОЛЛ ДЛЯ ТЕКСТА */
  flex-grow: 1;     /* Занимает всё место до кнопки */
  text-align: justify;
}

/* Кастомный скроллбар */
.scientific-text::-webkit-scrollbar { width: 4px; }
.scientific-text::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
.scientific-text::-webkit-scrollbar-thumb { background: #00ff41; }

.scientific-text strong { color: #00ff41; font-weight: normal; text-transform: uppercase; }
.scientific-text p { margin-bottom: 18px; }
.warning { color: #ff3333; font-weight: bold !important; border-top: 1px solid rgba(255,51,51,0.2); padding-top: 15px; }

.launch-btn {
  flex-shrink: 0; /* Чтобы кнопка не сжималась */
  width: 100%; background: transparent; border: 1px solid #00ff41;
  color: #00ff41; padding: 18px; font-family: inherit; font-size: 12px;
  cursor: pointer; transition: all 0.4s ease; letter-spacing: 4px;
  text-transform: uppercase;
}
.launch-btn:hover { background: #00ff41; color: #000; box-shadow: 0 0 30px rgba(0, 255, 65, 0.4); }

/* ПАНЕЛИ И ГЛИТЧ */
.side-panel {
  position: absolute; top: 30px; right: 30px; width: 320px;
  background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2); padding: 25px; color: #fff; border-radius: 4px;
}
.side-panel.glitch-mode {
  background: rgba(255, 51, 51, 0.25) !important; border-color: #ff3333 !important;
  animation: panel-shake 0.1s infinite !important; box-shadow: 0 0 30px rgba(255, 51, 51, 0.4) !important;
}
.glitch-mode h2, .glitch-mode .desc, .glitch-mode label, .glitch-mode .stat-item span {
  color: #ff3333 !important; text-shadow: 2px 0 #00ff41, -2px 0 #fff !important; animation: text-glitch 0.3s infinite !important;
}

@keyframes panel-shake {
  0% { transform: translate(0,0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, -2px); }
  100% { transform: translate(1px, 2px); }
}
@keyframes text-glitch {
  0% { clip-path: inset(40% 0 10% 0); }
  20% { clip-path: inset(10% 0 60% 0); }
  40% { clip-path: inset(80% 0 5% 0); }
  100% { clip-path: inset(0% 0 0% 0); }
}

/* ИНТЕРФЕЙС */
.thought-bar { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 600px; background: rgba(0, 15, 0, 0.8); border-left: 3px solid #00ff41; padding: 12px 25px; z-index: 100; backdrop-filter: blur(10px); }
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
.anomaly-box label { font-size: 9px; color: #00ff41; display: block; margin: 20px 0 8px; opacity: 0.8; }
.desc { font-size: 14px; opacity: 0.9; line-height: 1.5; color: #fff; }
.footer { margin-top: 35px; display: flex; flex-direction: column; gap: 12px; }
.stat-item { display: flex; justify-content: space-between; font-size: 10px; }
.stat-item label { opacity: 0.5; }
.stat-item span { color: #00ff41; }

/* ТРАНЗИЦИИ */
.fade-overlay-leave-active { transition: opacity 1.2s ease; }
.fade-overlay-leave-to { opacity: 0; }
.fade-thought-enter-active, .fade-thought-leave-active { transition: all 0.5s ease; }
.fade-thought-enter-from { opacity: 0; transform: translateY(10px); }
.fade-thought-leave-to { opacity: 0; transform: translateY(-10px); }
.slide-enter-active, .slide-leave-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(120%); opacity: 0; }
</style>

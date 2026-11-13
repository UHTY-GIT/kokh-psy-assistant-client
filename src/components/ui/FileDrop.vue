<!-- src/components/ui/FileDrop.vue -->
<!--
  Поле вибору файлу, куди файл можна й перетягнути. Клік відкриває звичайний вибір файлу.
  Поки файл несуть сторінкою, усі такі поля підсвічуються («Перетягніть файл сюди»),
  а поле під курсором розгортається в «ловилку» під своєю міткою: пише, що саме буде встановлено,
  і трохи тягнеться в бік курсора, — тож поруч стоять два поля, а видно, у яке з них упаде файл.
  <FileDrop :name="fileName" target="аватар" accept="image/*" @file="onFile" />
-->
<template>
  <span
      ref="root"
      class="file-chosen file-drop"
      :class="{ 'is-armed': drag.active && !over, 'is-over': over, 'is-wrong': over && wrong, 'is-caught': caught, 'is-shake': shake }"
      :style="pointerStyle"
      role="button"
      tabindex="0"
      @click="pick"
      @keydown.enter.prevent="pick"
      @keydown.space.prevent="pick"
      @dragenter.prevent="onEnter"
      @dragover.prevent="onOver"
      @dragleave="onLeave"
      @drop.prevent.stop="onDrop"
  >
    <span class="file-drop__name">{{ drag.active && !over ? 'Перетягніть файл сюди' : (name || placeholder) }}</span>
    <input ref="input" type="file" :accept="accept || null" style="display: none;" @click.stop @change="onPick">
    <Transition name="file-drop-catch">
      <span v-if="over" class="file-drop__catch" aria-hidden="true">
        <span class="file-drop__badge">
          <svg v-if="wrong" class="file-drop__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
            <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />
          </svg>
          <svg v-else class="file-drop__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path class="file-drop__arrow" d="M12 3.5v10.5M7.5 9.5 12 14l4.5-4.5" />
            <path d="M4 14.5v3A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-3" />
          </svg>
        </span>
        <b v-if="wrong">{{ wrongText }}</b>
        <b v-else>Відпустіть, щоб встановити <em>{{ target }}</em></b>
      </span>
    </Transition>
  </span>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import M from 'materialize-css';

// Спільний для всіх полів стан: чи несуть зараз файл над сторінкою.
const drag = reactive({ active: false });
let users = 0;
let idleTimer = null;

const hasFiles = (event) => Array.from((event.dataTransfer && event.dataTransfer.types) || []).includes('Files');
const stopDrag = () => {
  drag.active = false;
  clearTimeout(idleTimer);
};
const insideField = (event) => event.target instanceof Element && Boolean(event.target.closest('.file-drop'));

const onWindowDragOver = (event) => {
  if (!hasFiles(event)) return;
  // файл, кинутий повз поле, інакше відкрився б у цій вкладці замість сторінки
  event.preventDefault();
  if (!insideField(event)) event.dataTransfer.dropEffect = 'none';
  drag.active = true;
  // Esc або кидок за межі вікна не завжди дають подію — тоді гасимо, коли перетягування затихло
  clearTimeout(idleTimer);
  idleTimer = setTimeout(stopDrag, 1000);
};
const onWindowDragLeave = (event) => {
  // курсор вийшов за межі вікна
  if (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) stopDrag();
};
const onWindowDrop = (event) => {
  if (hasFiles(event)) event.preventDefault();
  stopDrag();
};

const listen = () => {
  if (users++ > 0) return;
  window.addEventListener('dragover', onWindowDragOver);
  window.addEventListener('dragleave', onWindowDragLeave);
  window.addEventListener('drop', onWindowDrop);
};
const unlisten = () => {
  if (--users > 0) return;
  window.removeEventListener('dragover', onWindowDragOver);
  window.removeEventListener('dragleave', onWindowDragLeave);
  window.removeEventListener('drop', onWindowDrop);
  stopDrag();
};

// чи підходить тип файлу під accept («image/*», «.pdf», «image/png»)
const fitsAccept = (accept, type, fileName = '') => {
  if (!accept) return true;
  return accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean).some((rule) => {
    if (rule.startsWith('.')) return fileName.toLowerCase().endsWith(rule);
    if (rule.endsWith('/*')) return type.toLowerCase().startsWith(rule.slice(0, -1));
    return type.toLowerCase() === rule;
  });
};

export default {
  name: 'FileDrop',
  props: {
    // назва вибраного файлу; поки її немає — показується placeholder
    name: { type: String, default: '' },
    placeholder: { type: String, default: 'Натисніть щоб вибрати файл' },
    // що встановлюємо — для підказки «Відпустіть, щоб встановити аватар»
    target: { type: String, default: 'файл' },
    accept: { type: String, default: '' },
  },
  emits: ['file'],
  setup(props, { emit }) {
    const root = ref(null);
    const input = ref(null);
    const over = ref(false);
    const wrong = ref(false);
    const caught = ref(false);
    const shake = ref(false);
    const pointer = reactive({ x: 0, y: 0 });
    let depth = 0;
    let frame = 0;
    let caughtTimer = null;
    let shakeTimer = null;

    const wrongText = computed(() => (props.accept.startsWith('image') ? 'Потрібне зображення' : 'Цей файл не підходить'));

    // ловилка тягнеться в бік курсора: --rx/--ry від 0 (лівий/верхній край поля) до 1 (правий/нижній)
    const pointerStyle = computed(() => ({
      '--rx': pointer.x.toFixed(3),
      '--ry': pointer.y.toFixed(3),
    }));

    const reset = () => {
      depth = 0;
      over.value = false;
      wrong.value = false;
      pointer.x = 0;
      pointer.y = 0;
    };

    // гасимо, якщо перетягування скасували (Esc, кидок поза вікном)
    watch(() => drag.active, (active) => {
      if (!active) reset();
    });

    const flash = (kind) => {
      if (kind === 'caught') {
        caught.value = false;
        clearTimeout(caughtTimer);
        requestAnimationFrame(() => { caught.value = true; });
        caughtTimer = setTimeout(() => { caught.value = false; }, 700);
      } else {
        shake.value = false;
        clearTimeout(shakeTimer);
        requestAnimationFrame(() => { shake.value = true; });
        shakeTimer = setTimeout(() => { shake.value = false; }, 500);
      }
    };

    const take = (file) => {
      if (!file) return;
      if (!fitsAccept(props.accept, file.type || '', file.name)) {
        flash('shake');
        M.toast({ html: wrongText.value });
        return;
      }
      emit('file', file);
      flash('caught');
    };

    const pick = () => {
      if (input.value) input.value.click();
    };

    const onPick = (event) => {
      take(event.target.files && event.target.files[0]);
      event.target.value = ''; // щоб той самий файл можна було вибрати ще раз
    };

    const onEnter = (event) => {
      if (!hasFiles(event)) return;
      depth += 1;
      over.value = true;
      // тип видно ще до кидка (не в усіх браузерах); невідомий тип не вважаємо помилкою
      const items = Array.from((event.dataTransfer && event.dataTransfer.items) || []).filter((item) => item.kind === 'file');
      wrong.value = items.length > 0 && items.every((item) => item.type) && !items.some((item) => fitsAccept(props.accept, item.type));
    };

    const onOver = (event) => {
      if (!hasFiles(event)) return;
      if (!over.value) onEnter(event); // вхід у поле міг загубитись (перетягування щойно відновилось)
      event.dataTransfer.dropEffect = wrong.value ? 'none' : 'copy';
      const { clientX, clientY } = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!root.value || !over.value) return;
        const rect = root.value.getBoundingClientRect();
        const rx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const ry = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
        pointer.x = rx;
        pointer.y = ry;
      });
    };

    const onLeave = (event) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) reset();
    };

    const onDrop = (event) => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      stopDrag();
      reset();
      take(file);
    };

    onMounted(listen);
    onBeforeUnmount(() => {
      unlisten();
      cancelAnimationFrame(frame);
      clearTimeout(caughtTimer);
      clearTimeout(shakeTimer);
    });

    return {
      root, input, drag, over, wrong, caught, shake, wrongText, pointerStyle,
      pick, onPick, onEnter, onOver, onLeave, onDrop,
    };
  },
};
</script>

<style scoped lang="scss">
// кольори CRM: поле — графіт, корінець-мітка — блакитний, у фокусі — бірюзовий, попапи — «папір». Жодних відблисків.
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$paper: #FDF8F3;
$red: #DF4545;
$spring: cubic-bezier(.34, 1.56, .64, 1);
$smooth: cubic-bezier(.22, 1, .36, 1);

// селектори з .container-input — щоб перебити загальні стилі полів-«вкладок»
.container-input > .file-chosen.file-drop {
  position: relative;
  transform-origin: 0 0; // поле тримається своєї мітки
  transition: transform .45s $spring, background-color .2s, color .2s;

  // пунктирна рамка всередині поля — з'являється, коли файл несуть над сторінкою
  &::before {
    content: "";
    position: absolute;
    inset: 6px;
    border: 2px dashed rgba($blue, .9);
    border-radius: 0 8px 8px 8px;
    opacity: 0;
    transform: scale(1.03);
    transition: opacity .25s, transform .45s $smooth;
    pointer-events: none;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 3px;
  }

  // файл несуть над сторінкою — поле показує, що сюди можна кинути
  &.is-armed::before {
    opacity: 1;
    transform: none;
    animation: file-drop-breathe 1.4s ease-in-out infinite;
  }

  // файл над цим полем — графітове поле ховається, його місце займає «ловилка»
  &.is-over {
    z-index: 2;
    background-color: transparent !important;
    color: transparent;
  }

  &.is-caught {
    animation: file-drop-caught .6s $spring;
  }

  &.is-shake {
    animation: file-drop-shake .45s ease;
  }
}

// корінець-мітка над полем поводиться як у фокусі: бірюзовий, коли файл над полем, червоний — коли файл не підходить
:global(.container-input:has(> .file-drop.is-over) > .type-for-view) {
  background-color: $teal !important;
}

:global(.container-input:has(> .file-drop.is-wrong) > .type-for-view) {
  background-color: $red !important;
}

.file-drop__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// «ловилка» — продовження мітки: лівий верхній кут прямий і стоїть рівно під нею, рамка того ж кольору,
// що й мітка, тож разом вони як одна «папка». Фон — матове скло без відблисків.
// Лівий і верхній краї закріплені; поле «гумово» тягнеться лише вправо й донизу — в бік курсора.
.file-drop__catch {
  position: absolute;
  inset: 0 -6px -10px 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 18px;
  box-sizing: border-box;
  border: 2px solid $teal;
  border-radius: 0 14px 14px 14px;
  background-color: rgba($paper, .7);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  box-shadow: 0 16px 34px rgba($teal, .18);
  color: $ink;
  font: 800 17px/1.2 "Nunito", sans-serif;
  text-align: center;
  pointer-events: none;
  transform-origin: 0 0;
  transform: scale(calc(1 + var(--rx, 0) * .012), calc(1 + var(--ry, 0) * .07));
  transition: transform .5s $spring, border-color .2s;

  b {
    font-weight: 800;
  }

  em {
    color: $teal;
    font-style: normal;
  }

  .is-wrong > & {
    border-color: $red;
  }
}

// значок у бірюзовому кружечку, як чипи часу в CRM; для невідповідного файлу — червоний
.file-drop__badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: $teal;
  color: #fff;
  transition: background-color .2s;

  .is-wrong & {
    background: $red;
  }
}

.file-drop__icon {
  width: 19px;
  height: 19px;
}

.file-drop__arrow {
  animation: file-drop-arrow 1s cubic-bezier(.45, 0, .2, 1) infinite;
}

// поява — розгортається з-під мітки донизу, зникнення — м'яко згортається назад
.file-drop-catch-enter-active {
  animation: file-drop-catch-in .45s $spring;
}

.file-drop-catch-leave-active {
  transition: opacity .18s ease, scale .18s ease;
}

.file-drop-catch-leave-to {
  opacity: 0;
  scale: 1 .85;
}

@keyframes file-drop-catch-in {
  from {
    opacity: 0;
    scale: 1 .6;
  }
}

@keyframes file-drop-breathe {
  50% {
    border-color: rgba($blue, .4);
  }
}

@keyframes file-drop-arrow {
  0%, 100% {
    transform: translateY(-2px);
  }
  50% {
    transform: translateY(2px);
  }
}

@keyframes file-drop-caught {
  0% {
    transform: scale(1.02, .9);
  }
  45% {
    transform: scale(.995, 1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes file-drop-shake {
  20%, 60% {
    transform: translateX(-6px);
  }
  40%, 80% {
    transform: translateX(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .container-input > .file-chosen.file-drop {
    &,
    &.is-armed,
    &.is-over,
    &.is-caught,
    &.is-shake,
    &::before,
    &.is-armed::before {
      transform: none;
      transition: none;
      animation: none;
    }
  }

  .file-drop__catch,
  .file-drop__arrow,
  .file-drop-catch-enter-active {
    transform: none;
    transition: none;
    animation: none;
  }
}
</style>

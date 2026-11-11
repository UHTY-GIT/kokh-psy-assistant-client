<!-- src/components/calendar/CalendarDayPopover.vue -->
<!--
  Попап «+ще N» у календарі замість стандартного з FullCalendar: усі сесії дня в стилі CRM.
  Живе окремим шаром у body, прив'язаний до посилання «+ще», не вилазить за екран
  (зсувається вбік, а якщо знизу немає місця — відкривається над посиланням).
  Клік по сесії закриває попап і передає подію далі (@select), тож вікна сесії відкриваються вже без нього.
-->
<template>
  <Teleport to="body">
    <Transition name="day-popover">
      <div
          v-if="open"
          ref="card"
          class="day-popover"
          :class="{ 'is-above': position.above }"
          :style="cardStyle"
          role="dialog"
          :aria-label="`Сесії ${heading.title}`"
          @keydown.esc.prevent="close"
      >
        <div class="day-popover__head">
          <div class="day-popover__heading">
            <p class="day-popover__eyebrow">{{ heading.weekday }}</p>
            <p class="day-popover__title">
              {{ heading.title }}
              <span class="day-popover__count">{{ countLabel }}</span>
            </p>
          </div>
          <button type="button" class="day-popover__close" aria-label="Закрити" @click="close">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
          </button>
        </div>

        <ul class="day-popover__list">
          <li v-for="(item, index) in items" :key="item.key" :style="{ '--i': index }">
            <button type="button" class="day-popover__item" @click="pick(item)">
              <span class="day-popover__time">{{ item.time }}</span>
              <span class="day-popover__text">
                <span class="day-popover__client">{{ item.client || item.session }}</span>
                <span v-if="item.client && item.session" class="day-popover__session">{{ item.session }}</span>
              </span>
              <span class="day-popover__action" aria-hidden="true"><IconTrash /></span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue';
import { IconTrash } from '@/components/icons';

const MARGIN = 12; // від країв екрана
const GAP = 8; // від посилання «+ще»

export default {
  name: 'CalendarDayPopover',
  components: { IconTrash },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(false);
    const card = ref(null);
    const date = ref(null);
    const segs = ref([]);
    const position = reactive({ left: 0, top: 0, above: false, ready: false, originX: 0 });
    let anchor = null;

    const heading = computed(() => {
      if (!date.value) return { weekday: '', title: '' };
      return {
        weekday: date.value.toLocaleDateString('uk-UA', { weekday: 'long' }),
        title: date.value.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }),
      };
    });

    const items = computed(() => segs.value
        .map((seg) => {
          const { event } = seg;
          const [session, client] = String(event.title || '').split(' - ');
          const start = event.start || seg.start;
          return {
            key: `${event.id}-${start ? start.getTime() : ''}`,
            event,
            start,
            session: (session || '').trim(),
            client: (client || '').trim(),
            time: start ? start.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '',
          };
        })
        .sort((a, b) => (a.start ? a.start.getTime() : 0) - (b.start ? b.start.getTime() : 0)));

    // «1 сесія», «2 сесії», «5 сесій»
    const countLabel = computed(() => {
      const n = items.value.length;
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} сесія`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} сесії`;
      return `${n} сесій`;
    });

    const cardStyle = computed(() => ({
      left: `${position.left}px`,
      top: `${position.top}px`,
      '--origin-x': `${position.originX}px`,
      visibility: position.ready ? 'visible' : 'hidden',
    }));

    function place() {
      if (!card.value || !anchor || !anchor.isConnected) return;
      const a = anchor.getBoundingClientRect();
      const c = card.value.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const left = Math.min(Math.max(MARGIN, a.left + a.width / 2 - c.width / 2), vw - c.width - MARGIN);
      const below = a.bottom + GAP;
      const spaceBelow = vh - below - MARGIN;
      position.above = spaceBelow < c.height && a.top - GAP - MARGIN > spaceBelow;
      position.top = position.above
          ? Math.max(MARGIN, a.top - GAP - c.height)
          : Math.min(below, Math.max(MARGIN, vh - MARGIN - c.height));
      position.left = left;
      position.originX = Math.min(Math.max(20, a.left + a.width / 2 - left), c.width - 20);
      position.ready = true;
    }

    let frame = null;
    const onViewport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };

    function onDocumentPointer(event) {
      if (card.value && card.value.contains(event.target)) return;
      if (anchor && anchor.contains(event.target)) return; // повторний клік по «+ще» відкриє попап наново
      close();
    }

    function onKeydown(event) {
      if (event.key === 'Escape') close();
    }

    function listen(on) {
      const method = on ? 'addEventListener' : 'removeEventListener';
      document[method]('pointerdown', onDocumentPointer, true);
      document[method]('keydown', onKeydown);
      window[method]('scroll', onViewport, true);
      window[method]('resize', onViewport);
    }

    // FullCalendar передає дату, усі сесії дня і подію кліку по «+ще»
    async function show(info) {
      const target = info.jsEvent && info.jsEvent.target instanceof Element ? info.jsEvent.target : null;
      anchor = (target && target.closest('.fc-more-link')) || target;
      date.value = info.date;
      segs.value = info.allSegs || [];
      position.ready = false;
      if (!open.value) {
        open.value = true;
        listen(true);
      }
      await nextTick();
      place();
      const first = card.value && card.value.querySelector('.day-popover__item');
      if (first) first.focus({ preventScroll: true });
    }

    function close() {
      if (!open.value) return;
      open.value = false;
      listen(false);
    }

    function pick(item) {
      close();
      emit('select', { event: item.event });
    }

    onBeforeUnmount(() => {
      listen(false);
      cancelAnimationFrame(frame);
    });

    return { open, card, position, heading, items, countLabel, cardStyle, show, close, pick };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$paper: #FFFDFA;
$red: #DF4545;
$ease: cubic-bezier(.22, 1, .36, 1);

.day-popover {
  position: fixed;
  z-index: 1400; // над «Островом» і календарем, під вікнами сесії
  box-sizing: border-box;
  width: min(320px, calc(100vw - 24px));
  max-height: min(70vh, 520px);
  overflow-y: auto;
  padding: 16px 12px 12px;
  border: 2px solid $sand;
  border-radius: 22px;
  background: $paper;
  box-shadow: 0 6px 0 $sand, 0 26px 50px -18px rgba(56, 94, 108, .45);
  color: $ink;
  font-family: "Nunito", sans-serif;
  transform-origin: var(--origin-x) -6px;

  &.is-above {
    transform-origin: var(--origin-x) calc(100% + 6px);
  }

  // прокрутка, коли сесій багато: тонкий повзунок, кути лишаються круглими
  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    margin: 18px 0;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 10px;
    background-color: #DAB189;
    background-clip: padding-box;
  }
}

.day-popover__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0 4px 12px 6px;
  padding-bottom: 12px;
  border-bottom: 2px dashed $sand;
}

.day-popover__heading {
  flex: 1;
  min-width: 0;
}

.day-popover__eyebrow {
  margin: 0 0 4px;
  color: $gold-dark;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.day-popover__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin: 0;
  color: $ink;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.2;
}

.day-popover__count {
  padding: 3px 9px;
  border-radius: 8px;
  background: $sand;
  color: #7E8089;
  font-size: 12.5px;
  font-weight: 800;
}

.day-popover__close {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: -4px -2px 0 0;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: #9A9CA4;
  cursor: pointer;
  transition: background-color .25s, color .25s, transform .45s $ease;

  svg {
    width: 19px;
    height: 19px;
  }

  &:focus {
    background: transparent;
  }

  &:hover,
  &:focus-visible {
    background: $sand;
    color: $ink;
    outline: none;
    transform: rotate(90deg);
  }
}

.day-popover__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    list-style: none;
    animation: day-popover-item-in .45s $ease backwards;
    animation-delay: calc(var(--i, 0) * 40ms + 60ms);
  }
}

// сесія: час — бірюзовою плашкою, далі клієнт і назва сесії; клік відкриває ту саму дію, що й у календарі
.day-popover__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 8px 8px 8px 6px;
  box-sizing: border-box;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: $ink;
  font-family: "Nunito", sans-serif;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color .3s ease;

  &:focus {
    background: transparent;
    outline: none;
  }

  &:hover,
  &:focus-visible {
    background: #F7F0E7;

    .day-popover__time {
      background: $blue;
    }

    .day-popover__text {
      transform: translateX(3px);
    }

    .day-popover__action {
      background: #FCE4E4;
      color: $red;

      :deep(.icon-trash__lid) {
        transform: translateY(-1.5px) rotate(-14deg);
      }
    }
  }

  &:active .day-popover__time {
    transform: scale(.95);
  }
}

.day-popover__time {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  height: 36px;
  padding: 0 10px;
  box-sizing: border-box;
  border-radius: 11px;
  background: $teal;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: .02em;
  transition: background-color .3s ease, transform .3s $ease;
}

.day-popover__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  transition: transform .45s $ease;
}

.day-popover__client,
.day-popover__session {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.day-popover__client {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
}

.day-popover__session {
  color: #8A8C94;
  font-size: 13.5px;
  font-weight: 700;
}

.day-popover__action {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #A3A5AD;
  transition: background-color .3s ease, color .3s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  :deep(.icon-trash__lid) {
    transform-box: fill-box;
    transform-origin: 20% 100%;
    transition: transform .4s $ease;
  }
}

@keyframes day-popover-item-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

// поява: розкривається від посилання «+ще»
.day-popover-enter-active {
  transition: opacity .2s ease, transform .4s $ease;
}

.day-popover-leave-active {
  transition: opacity .15s ease, transform .18s ease-in;
}

.day-popover-enter-from,
.day-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.94);
}

.day-popover.is-above.day-popover-enter-from,
.day-popover.is-above.day-popover-leave-to {
  transform: translateY(6px) scale(.94);
}

@media (prefers-reduced-motion: reduce) {
  .day-popover-enter-active,
  .day-popover-leave-active,
  .day-popover__list li {
    transition: none;
    animation: none;
  }
}
</style>

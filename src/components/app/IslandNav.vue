<!-- src/components/app/IslandNav.vue -->
<!--
  «Острів»: плаваюча панель навігації знизу по центру, однакова на всіх екранах.
  Зліва перекидний годинник, далі розділи, справа нотатки з лічильником.
  Активний розділ підсвічує «пігулка», що плавно їде між іконками.
-->
<template>
  <nav ref="island" class="island" :class="{ 'has-panel': openPanel }" aria-label="Головне меню" @keydown.esc="closePanels">
    <div class="island__clock">
      <FlipClock size="island" :timezone="timezone" />
    </div>

    <span class="island__sep" aria-hidden="true"></span>

    <div ref="itemsBox" class="island__items">
      <!-- пігулка: усередині — білі копії всіх іконок, суміщені зі справжніми;
           видно лише ту частину, що під пігулкою, тож іконки біліють рівно там, де вона пролітає -->
      <span class="island__indicator" :class="{ 'is-visible': indicator.visible }" :style="indicatorStyle" aria-hidden="true">
        <span class="island__lit">
          <span v-for="link in links" :key="link.title" class="island__lit-slot">
            <component :is="link.icon" class="island__icon island__icon--lit" />
          </span>
        </span>
      </span>

      <template v-for="link in links" :key="link.title">
        <button
            v-if="link.children"
            ref="clientsButton"
            type="button"
            class="island__item"
            :class="{ 'is-active': isClientsActive, 'is-open': openPanel === 'clients', 'is-peek': peek === link.title }"
            :data-active="isClientsActive ? 'true' : null"
            :aria-expanded="openPanel === 'clients' ? 'true' : 'false'"
            aria-haspopup="true"
            :aria-label="link.title"
            @pointerdown="onPress($event, link.title)"
            @pointerup="onRelease($event, link.title)"
            @pointercancel="onCancel"
            @touchstart.passive="noop"
            @contextmenu.prevent
            @click="onItemClick($event, link.title, () => togglePanel('clients'), false)"
        >
          <component :is="link.icon" class="island__icon" />
          <span class="island__tip" aria-hidden="true">{{ link.title }}</span>
        </button>

        <router-link v-else :to="link.url" custom v-slot="{ href, navigate, isActive }">
          <a
              :href="href"
              class="island__item"
              :class="{ 'is-active': isActive, 'is-peek': peek === link.title }"
              :data-active="isActive ? 'true' : null"
              :aria-current="isActive ? 'page' : null"
              :aria-label="link.title"
              @pointerdown="onPress($event, link.title)"
              @pointerup="onRelease($event, link.title)"
              @pointercancel="onCancel"
              @touchstart.passive="noop"
              @contextmenu.prevent
              @click="onItemClick($event, link.title, navigate)"
          >
            <component :is="link.icon" class="island__icon" />
            <span class="island__tip" aria-hidden="true">{{ link.title }}</span>
          </a>
        </router-link>
      </template>
    </div>

    <span class="island__sep" aria-hidden="true"></span>

    <button
        ref="notesButton"
        type="button"
        class="island__item island__item--notes"
        :class="{ 'is-open': openPanel === 'notes', 'is-peek': peek === 'Нотатки' }"
        :aria-expanded="openPanel === 'notes' ? 'true' : 'false'"
        :aria-label="`Нотатки: ${notesCount}`"
        @pointerdown="onPress($event, 'Нотатки')"
        @pointerup="onRelease($event, 'Нотатки')"
        @pointercancel="onCancel"
        @touchstart.passive="noop"
        @contextmenu.prevent
        @click="onItemClick($event, 'Нотатки', () => togglePanel('notes'), false)"
    >
      <IconSpeechBubble class="island__icon island__icon--notes" />
      <Transition name="island-badge">
        <span v-if="notesCount" :key="notesCount" class="island__badge">{{ notesCount }}</span>
      </Transition>
      <span class="island__tip" aria-hidden="true">Нотатки</span>
    </button>

    <!-- Підменю «Клієнти» -->
    <Transition name="island-pop">
      <div v-if="openPanel === 'clients'" class="island__panel" :style="{ left: clientsX + 'px' }" role="menu">
        <div class="island__panel-title">Клієнти</div>
        <router-link
            v-for="(child, index) in clientsLink.children"
            :key="child.url"
            :to="child.url"
            class="island__sub"
            :class="{ 'is-current': route.path === child.url }"
            :style="{ '--bg': child.color, '--ledge': child.ledge, '--i': index }"
            role="menuitem"
            @click="closePanels"
        >
          <component :is="child.icon" class="island__sub-icon" />
          <span>{{ child.title }}</span>
        </router-link>
      </div>
    </Transition>
  </nav>

  <!-- Нотатки — окремим шаром у body: їхні модалки фіксовані й не мають жити всередині трансформованої панелі -->
  <Teleport to="body">
    <Transition name="island-pop">
      <div v-show="openPanel === 'notes'" ref="notesPanel" class="island-notes" :style="notesStyle">
        <NotesComponent @count="notesCount = $event" />
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import FlipClock from '@/components/ui/FlipClock.vue';
import NotesComponent from '@/components/notes/NotesComponent.vue';
import {
  IconCalendar, IconChecklist, IconUsersGroup, IconHandshake, IconInfo, IconUsers, IconUser, IconSpeechBubble,
} from '@/components/icons';

// іконки — компоненти; markRaw, щоб Vue не робив їх реактивними
const LINKS = [
  { title: 'Календар', url: '/', icon: markRaw(IconCalendar) },
  { title: 'Мої сесії', url: '/session', icon: markRaw(IconChecklist) },
  {
    title: 'Клієнти',
    icon: markRaw(IconUsersGroup),
    children: [
      { title: 'Мої клієнти', url: '/clients', icon: markRaw(IconUsers), color: '#A58E74', ledge: '#8A7560' },
      { title: 'Супервізанти', url: '/supervisees', icon: markRaw(IconUser), color: '#E09F56', ledge: '#BF8442' },
    ],
  },
  { title: 'Підтримка', url: '/support', icon: markRaw(IconHandshake) },
  { title: 'Банк інформації', url: '/bank-info', icon: markRaw(IconInfo) },
];

export default {
  name: 'IslandNav',
  components: { FlipClock, NotesComponent, IconSpeechBubble },
  props: {
    timezone: { type: String, default: 'Europe/Kyiv' },
  },
  setup() {
    const route = useRoute();
    const island = ref(null);
    const itemsBox = ref(null);
    const clientsButton = ref(null);
    const notesButton = ref(null);
    const notesPanel = ref(null);

    const links = LINKS;
    const clientsLink = LINKS.find((link) => link.children);
    const isClientsActive = computed(() => route.path.startsWith('/clients') || route.path.startsWith('/supervisees'));

    const openPanel = ref(null);
    const notesCount = ref(0);
    const clientsX = ref(0);
    const notesPos = reactive({ left: 0, bottom: 0 });

    // ---------- «Пігулка» активного розділу ----------
    // Пігулка задається лівим і правим краями. Передній край (у бік руху) біжить швидше,
    // задній наздоганяє — пігулка «перетікає» і ніколи не проскакує за крайні іконки.
    const LEAD_MS = 280;
    const TRAIL_MS = 520;
    const indicator = reactive({ left: 0, right: 0, visible: false, leftMs: TRAIL_MS, rightMs: TRAIL_MS });
    const indicatorStyle = computed(() => ({
      left: `${indicator.left}px`,
      right: `${indicator.right}px`,
      '--left': `${indicator.left}px`,
      '--left-ms': `${indicator.leftMs}ms`,
      '--right-ms': `${indicator.rightMs}ms`,
    }));

    function placeIndicator() {
      const box = itemsBox.value;
      if (!box) return;
      const active = box.querySelector('[data-active="true"]');
      const wasVisible = indicator.visible;
      indicator.visible = !!active;
      if (!active) return;
      const left = active.offsetLeft;
      const right = box.clientWidth - left - active.offsetWidth;
      if (wasVisible && left !== indicator.left) {
        const movingRight = left > indicator.left;
        indicator.leftMs = movingRight ? TRAIL_MS : LEAD_MS;
        indicator.rightMs = movingRight ? LEAD_MS : TRAIL_MS;
      } else {
        indicator.leftMs = indicator.rightMs = TRAIL_MS; // перша поява чи зміна розміру — рівно
      }
      indicator.left = left;
      indicator.right = right;
    }

    // ---------- Панелі ----------
    const asElement = (target) => (Array.isArray(target) ? target[0] : target);

    function placePanels() {
      const box = island.value;
      if (!box) return;
      const islandRect = box.getBoundingClientRect();
      const clients = asElement(clientsButton.value);
      if (clients) {
        const rect = clients.getBoundingClientRect();
        clientsX.value = rect.left - islandRect.left + rect.width / 2;
      }
      const notes = asElement(notesButton.value);
      if (notes) {
        const rect = notes.getBoundingClientRect();
        const width = Math.min(360, window.innerWidth - 24);
        // без transform у спокої — інакше модалки нотаток поїдуть разом із панеллю
        notesPos.left = Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12));
        notesPos.bottom = window.innerHeight - islandRect.top + 14;
      }
    }

    const notesStyle = computed(() => ({ left: `${notesPos.left}px`, bottom: `${notesPos.bottom}px` }));

    async function togglePanel(name) {
      openPanel.value = openPanel.value === name ? null : name;
      await nextTick();
      placePanels();
    }

    function closePanels() {
      openPanel.value = null;
    }

    function onDocumentPointer(event) {
      if (!openPanel.value) return;
      // вікна приміток (додати / видалити) живуть окремим шаром — клік у них не закриває панель
      const inside = [island.value, notesPanel.value].some((el) => el && el.contains(event.target))
          || (event.target instanceof Element && !!event.target.closest('.base-dialog'));
      // модалки нотаток рендеряться всередині панелі, тож клік у них теж «всередині»
      if (!inside) closePanels();
    }

    function onResize() {
      placeIndicator();
      placePanels();
    }

    // ---------- Підписи на дотик ----------
    // Мишею підпис з'являється при наведенні (CSS). На телефоні/планшеті наведення немає, тому:
    // короткий тап відкриває розділ і на мить показує його назву, довге натискання — лише показує назву.
    const LONG_PRESS_MS = 420;
    const peek = ref(null);
    let peekTimer = null;
    let pressTimer = null;
    let suppressClick = false;
    let lastPointer = 'mouse';

    function showPeek(key, hideAfter) {
      clearTimeout(peekTimer);
      peek.value = key;
      if (hideAfter) {
        peekTimer = setTimeout(() => {
          if (peek.value === key) peek.value = null;
        }, hideAfter);
      }
    }

    function onPress(event, key) {
      lastPointer = event.pointerType;
      suppressClick = false;
      if (event.pointerType !== 'touch') return;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        suppressClick = true; // після довгого натискання тап не спрацьовує
        showPeek(key);
        if (navigator.vibrate) navigator.vibrate(8);
      }, LONG_PRESS_MS);
    }

    function onRelease(event, key) {
      if (event.pointerType !== 'touch') return;
      clearTimeout(pressTimer);
      if (suppressClick) showPeek(key, 900);
    }

    function onCancel() {
      clearTimeout(pressTimer);
      if (peek.value) showPeek(peek.value, 600);
    }

    function onItemClick(event, key, action, flashLabel = true) {
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
        return;
      }
      action(event);
      if (flashLabel && lastPointer === 'touch') showPeek(key, 1300);
      else showPeek(null); // відкрилась картка — попередній підпис ховаємо
    }

    // з цим слухачем iOS Safari показує :active при натисканні
    const noop = () => {};

    watch(() => route.fullPath, async () => {
      closePanels();
      await nextTick();
      placeIndicator();
    });

    let resizeObserver = null;
    onMounted(async () => {
      await nextTick();
      placeIndicator();
      document.addEventListener('pointerdown', onDocumentPointer);
      window.addEventListener('resize', onResize);
      // розміри панелі плавно змінюються на брейкпоінтах — пігулка їде слідом
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(itemsBox.value);
      }
      // шрифт Anton/іконки можуть домалюватись пізніше
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);
    });

    onBeforeUnmount(() => {
      clearTimeout(peekTimer);
      clearTimeout(pressTimer);
      document.removeEventListener('pointerdown', onDocumentPointer);
      window.removeEventListener('resize', onResize);
      if (resizeObserver) resizeObserver.disconnect();
    });

    return {
      route, island, itemsBox, clientsButton, notesButton, notesPanel,
      links, clientsLink, isClientsActive,
      openPanel, notesCount, clientsX, notesStyle,
      indicator, indicatorStyle,
      togglePanel, closePanels,
      peek, onPress, onRelease, onCancel, onItemClick, noop,
    };
  },
};
</script>

<style scoped lang="scss">
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$gold-dark: #BA9571;
$ink: #494B55;
$sand: #EFE4D6;
$paper: #FFFDFA;
$spring: cubic-bezier(.34, 1.56, .64, 1);
$smooth: cubic-bezier(.22, 1, .36, 1);

.island {
  --item: 56px;
  --icon: 28px;
  --radius: 16px;
  --gap: 12px; // повітря між кнопками, щоб піднята при наведенні не торкалась сусідньої
  --pad: 14px;
  --height: 80px;
  --offset: 24px;

  position: fixed;
  z-index: 900;
  left: 0;
  right: 0;
  bottom: calc(var(--offset) + env(safe-area-inset-bottom, 0px));
  display: flex;
  align-items: center;
  gap: var(--gap);
  width: max-content;
  max-width: calc(100vw - 20px);
  height: var(--height);
  margin: 0 auto;
  padding: 0 var(--pad);
  box-sizing: border-box;
  border: 2px solid $sand;
  border-radius: 26px;
  background: $paper;
  box-shadow: 0 18px 40px rgba(56, 94, 108, .25), 0 4px 0 $sand;
  line-height: normal;
  color: $ink;
  animation: island-in .7s $spring both;
  transition: height .4s $smooth, padding .4s $smooth, gap .4s $smooth, bottom .4s $smooth, border-radius .4s $smooth;
}

@keyframes island-in {
  from { opacity: 0; transform: translateY(40px) scale(.94); }
  to { opacity: 1; transform: none; }
}

.island__clock {
  display: flex;
  align-items: center;
  margin-right: 2px;
}

.island__sep {
  flex: none;
  height: 40px;
  margin: 0 8px;
  border-left: 2px dashed #DCCDB9;
  transition: margin .4s $smooth, height .4s $smooth;
}

.island__items {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  transition: gap .4s $smooth;
}

// пігулка під активним розділом: їде між іконками, піднімається разом із ними
.island__indicator {
  --lift: 0px;
  --scale: 1;

  position: absolute;
  top: 0;
  // left/right задає скрипт; підйом і масштаб — через transform з тим самим таймінгом, що й в іконок,
  // тож пігулка завжди рівно під іконкою
  height: var(--item);
  border-radius: var(--radius);
  z-index: 2; // поверх сірих іконок; кліки проходять крізь (pointer-events: none)
  overflow: hidden;
  background: $blue;
  box-shadow: 0 3px 0 $teal;
  opacity: 0;
  transform: translateY(var(--lift)) scale(.6);
  // крива без перескоку: краї рухаються лише до цілі
  transition:
      left var(--left-ms, .52s) $smooth,
      right var(--right-ms, .52s) $smooth,
      transform .45s $spring,
      height .4s $smooth,
      opacity .25s ease,
      border-radius .4s $smooth;
  pointer-events: none;

  &.is-visible {
    opacity: 1;
    transform: translateY(var(--lift)) scale(var(--scale));
  }
}

// білий шар іконок: зсувається назад рівно на стільки, на скільки з'їхала пігулка,
// з тією ж кривою й тривалістю, тож іконки весь час стоять на своїх місцях
.island__lit {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  gap: var(--gap);
  transform: translateX(calc(var(--left) * -1));
  transition: transform var(--left-ms, .52s) $smooth, gap .4s $smooth;
}

.island__lit-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--item);
  height: var(--item);
  transition: width .4s $smooth, height .4s $smooth;
}

.island__icon.island__icon--lit {
  color: #fff;
}

@media (hover: hover) {
  // наведення на сам активний розділ
  .island__items:has(.island__item.is-active:hover) .island__indicator {
    --lift: -10px;
    --scale: 1.12;
  }

  // наведення на сусіда: активний трохи тягнеться слідом — пігулка разом із ним
  .island__items:has(.island__item.is-active + .island__item:hover) .island__indicator,
  .island__items:has(.island__item:hover + .island__item.is-active) .island__indicator {
    --lift: -4px;
    --scale: 1.04;
  }
}

// довге натискання на активний розділ на телефоні — пігулка піднімається разом з іконкою
.island__items:has(.island__item.is-active.is-peek) .island__indicator {
  --lift: -8px;
  --scale: 1.08;
}

// натиснутий активний розділ: пігулка «вдавлюється» разом з іконкою
.island__items:has(.island__item.is-active:active) .island__indicator {
  --lift: -4px;
  --scale: .92;

  // так само швидко, як і сама кнопка (left, right, transform, height, opacity, border-radius)
  transition-duration: var(--left-ms, .52s), var(--right-ms, .52s), .12s, .4s, .25s, .4s;
}

.island__item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--item);
  height: var(--item);
  padding: 0;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none; // довге натискання не відкриває системне меню посилання
  user-select: none;
  transition:
      transform .45s $spring,
      background-color .25s ease,
      box-shadow .3s ease,
      width .4s $smooth,
      height .4s $smooth,
      border-radius .4s $smooth;

  &:focus {
    background-color: transparent;
  }

  &:focus-visible {
    outline: 2px solid $teal;
    outline-offset: 3px;
  }

  &.is-open {
    background-color: $teal;
  }
}

.island__icon {
  display: block;
  flex: none;
  width: var(--icon);
  height: var(--icon);
  color: $ink;
  transition: color .25s ease, width .4s $smooth, height .4s $smooth;
}

.island__item.is-open .island__icon {
  color: #fff;
}

// наведення: іконка піднімається, сусіди трохи тягнуться слідом
@media (hover: hover) {
  .island__item:hover {
    transform: translateY(-10px) scale(1.12);
  }

  .island__item:not(.is-active):not(.is-open):not(.island__item--notes):hover {
    background-color: $teal;
    box-shadow: 0 10px 18px rgba(56, 94, 108, .28);

    .island__icon {
      color: #fff;
    }
  }

  .island__item:hover + .island__item,
  .island__item:has(+ .island__item:hover) {
    transform: translateY(-4px) scale(1.04);
  }

  .island__item:hover .island__tip {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

// натискання: коротке «вдавлювання»
.island__item:active {
  transform: translateY(-4px) scale(.92);
  transition-duration: .12s;
}

.island__item.is-open .island__tip {
  display: none;
}

// поки відкрита картка «Клієнтів» чи нотаток, підписи не потрібні й лише ховалися б під нею
.island.has-panel .island__tip {
  opacity: 0 !important;
  transform: translate(-50%, 8px) scale(.85) !important;
}

// підпис-«чіп»: без стрілочки, як картка «Клієнтів» — папір, пісочна рамка й «полиця»
.island__tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 12px);
  padding: 7px 13px 6px;
  border: 2px solid $sand;
  border-radius: 999px;
  background: $paper;
  box-shadow: 0 3px 0 $sand, 0 10px 22px rgba(56, 94, 108, .2);
  color: $teal;
  font: 800 13.5px/1 "Nunito", sans-serif;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 8px) scale(.85);
  transform-origin: 50% 100%;
  transition: opacity .2s ease, transform .35s $spring;
  pointer-events: none;
}

.island__item:focus-visible .island__tip,
.island__item.is-peek:not(.is-open) .island__tip {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

// дотик: «підглянутий» розділ піднімається, як при наведенні мишею
.island__item.is-peek {
  transform: translateY(-8px) scale(1.08);
}

.island__item.is-peek:not(.is-active):not(.is-open):not(.island__item--notes) {
  background-color: $teal;
  box-shadow: 0 10px 18px rgba(56, 94, 108, .28);

  .island__icon {
    color: #fff;
  }
}

.island__item--notes {
  background-color: $gold;
  box-shadow: 0 3px 0 $gold-dark;

  &:focus,
  &.is-open {
    background-color: $gold;
  }

  &.is-open {
    box-shadow: 0 1px 0 $gold-dark, inset 0 0 0 3px rgba(255, 255, 255, .45);
  }
}

.island__badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 11px;
  background: $ink;
  color: #fff;
  font: 800 12px/22px "Nunito", sans-serif;
  text-align: center;
}

.island-badge-enter-active {
  animation: island-badge-pop .45s $spring;
}

.island-badge-leave-active {
  display: none;
}

@keyframes island-badge-pop {
  from { transform: scale(.3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

// ---------- Підменю «Клієнти» ----------
// картка без «хвостика»: виростає з панелі, кнопки по центру з однаковими відступами
.island__panel {
  position: absolute;
  z-index: 2;
  bottom: calc(100% + 16px);
  width: 260px;
  padding: 14px 14px 16px;
  box-sizing: border-box;
  border: 2px solid $sand;
  border-radius: 22px;
  background: $paper;
  box-shadow: 0 18px 40px rgba(56, 94, 108, .22), 0 4px 0 $sand;
  transform: translateX(-50%);
  transform-origin: 50% 100%;
}

.island__panel-title {
  padding: 0 4px 2px;
  color: $ink;
  font: 800 16px/1.4 "Nunito", sans-serif;
  text-align: center;
}

.island__sub {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 50px;
  margin-top: 10px;
  padding: 0 18px;
  border-radius: 14px;
  background: var(--bg);
  box-shadow: 0 4px 0 var(--ledge);
  color: #fff;
  font: 700 17px/1 "Nunito", sans-serif;
  text-decoration: none;
  animation: island-sub-rise .5s $spring backwards; // не both: інакше анімація перекриває підйом при наведенні
  animation-delay: calc(.08s + var(--i) * .07s);
  transition: transform .35s $spring, box-shadow .35s $smooth;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 var(--ledge), 0 12px 20px rgba(73, 75, 85, .18);
  }

  // натискання: кнопка сідає на «полицю», як золоті кнопки CRM
  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--ledge);
    transition-duration: .12s;
  }

  &.is-current {
    box-shadow: 0 4px 0 var(--ledge), inset 0 0 0 2px rgba(255, 255, 255, .7);
  }
}

.island__sub-icon {
  flex: none;
  width: 26px;
  height: 26px;
  color: #fff;
}

@keyframes island-sub-rise {
  from { opacity: 0; transform: translateY(12px) scale(.94); }
  to { opacity: 1; transform: none; }
}

@keyframes island-sub-in {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: none; }
}

// ---------- Нотатки ----------
.island-notes {
  position: fixed;
  z-index: 901;
  width: min(360px, calc(100vw - 24px));
  max-height: min(60vh, 520px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 4px 0 6px;
  border: 2px solid $sand;
  border-radius: 18px;
  background: $paper;
  box-shadow: 0 18px 40px rgba(56, 94, 108, .25);
  transform-origin: 50% 100%;

  :deep(.title-notification) {
    margin: 14px 0 12px;
    font-size: 20px;
  }

  :deep(.title-notification .menu-icon) {
    width: 30px;
    height: 30px;
  }

  // місце під смугу прокрутки — з обох боків однакове, тож картки стоять по центру панелі
  scrollbar-gutter: stable both-edges;

  :deep(.notes) {
    --notes-pad: 6px;
  }
}

// поява панелей: «виростають» із панелі знизу з легкою пружиною
.island-pop-enter-active {
  transition: opacity .2s ease, transform .45s $spring;
}

.island-pop-leave-active {
  transition: opacity .15s ease, transform .2s ease-in;
}

.island__panel.island-pop-enter-from,
.island__panel.island-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px) scale(.92);
}

.island-notes.island-pop-enter-from,
.island-notes.island-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(.94);
}

// ---------- Менші екрани: усе плавно стискається ----------
@media (max-width: 760px) {
  .island {
    --item: 48px;
    --icon: 26px;
    --radius: 14px;
    --gap: 8px;
    --pad: 10px;
    --height: 70px;
    --offset: 16px;

    border-radius: 22px;
  }

  .island__sep {
    height: 34px;
    margin: 0 5px;
  }
}

@media (max-width: 480px) {
  .island {
    --item: 40px;
    --icon: 22px;
    --radius: 12px;
    --gap: 4px;
    --pad: 8px;
    --height: 62px;
    --offset: 10px;

    border-radius: 20px;
  }

  .island__sep {
    height: 28px;
    margin: 0 3px;
  }

  .island__clock :deep(.fclock__weekday) {
    opacity: 0;
  }
}

// найвужчі телефони (до 380px): ще компактніше, щоб панель не вилазила за екран
@media (max-width: 380px) {
  .island {
    --item: 36px;
    --icon: 20px;
    --radius: 11px;
    --gap: 2px;
    --pad: 6px;
    --height: 56px;
  }

  .island__sep {
    height: 24px;
    margin: 0 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island,
  .island *,
  .island-notes,
  .island-notes * {
    animation: none !important;
    transition: none !important;
  }
}
</style>

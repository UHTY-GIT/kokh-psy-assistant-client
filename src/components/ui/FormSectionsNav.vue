<!-- src/components/ui/FormSectionsNav.vue -->
<!--
  Липка панель розділів довгої форми: клік — плавний перехід до розділу, поточний розділ підсвічується,
  у кожного — лічильник заповнених полів (повністю заповнений — галочка).
  <FormSectionsNav :sections="[{ id: 'form-section-0', title: 'Динаміка сесій', filled: 1, total: 2 }]" />
  Самі розділи на сторінці мають мати такі ж id.
-->
<template>
  <nav v-if="sections.length > 1" ref="nav" class="sections-nav" :class="{ 'is-stuck': isStuck, 'is-bleed': bleed.on }" :style="bleedStyle" aria-label="Розділи форми">
    <div ref="track" class="sections-nav__track" :style="fadeStyle" @scroll.passive="updateFade">
      <button
          v-for="(section, index) in sections"
          :key="section.id"
          type="button"
          class="sections-nav__chip"
          :class="{ 'is-active': section.id === activeId, 'is-done': section.total > 0 && section.filled >= section.total }"
          :data-id="section.id"
          :aria-current="section.id === activeId ? 'true' : null"
          @click="go(section.id)"
      >
        <span class="sections-nav__num">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="sections-nav__title">{{ section.title }}</span>
        <span class="sections-nav__count">
          <svg v-if="section.total > 0 && section.filled >= section.total" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-label="Заповнено"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
          <template v-else>{{ section.filled }}/{{ section.total }}</template>
        </span>
      </button>
    </div>
  </nav>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'FormSectionsNav',
  props: {
    sections: { type: Array, required: true },
  },
  setup(props) {
    const nav = ref(null);
    const track = ref(null);
    const activeId = ref(null);
    const isStuck = ref(false);
    // м'яке згасання по краях, коли «таблетки» не вміщаються: видно, що панель гортається вбік
    const fade = ref({ left: false, right: false });
    const fadeStyle = computed(() => ({
      '--fade-l': fade.value.left ? '36px' : '0px',
      '--fade-r': fade.value.right ? '36px' : '0px',
    }));

    // планшет і телефон: панель на всю ширину екрана — «таблетки» виїжджають з-за правого краю
    // і ховаються за лівий, обрізає їх лише сам екран; на старті перша стоїть врівень з формою
    const BLEED_QUERY = '(max-width: 1023px)';
    const bleed = ref({ on: false, left: 0, right: 0 });
    const bleedStyle = computed(() => (bleed.value.on
      ? { '--bleed-l': `${bleed.value.left}px`, '--bleed-r': `${bleed.value.right}px` }
      : null));

    function updateBleed() {
      const el = nav.value;
      const host = el && el.parentElement;
      if (!host || !window.matchMedia(BLEED_QUERY).matches) {
        if (bleed.value.on) bleed.value = { on: false, left: 0, right: 0 };
        return;
      }
      const rect = host.getBoundingClientRect();
      const cs = getComputedStyle(host);
      const left = Math.max(0, Math.round(rect.left + parseFloat(cs.paddingLeft)));
      const right = Math.max(0, Math.round(document.documentElement.clientWidth - rect.right + parseFloat(cs.paddingRight)));
      if (!bleed.value.on || bleed.value.left !== left || bleed.value.right !== right) bleed.value = { on: true, left, right };
    }

    function onResize() {
      updateBleed();
      updateFade();
    }

    function updateFade() {
      const el = track.value;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      fade.value = { left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 };
    }
    let observer = null;
    let resizeObserver = null;
    let lockUntil = 0; // поки йде плавний перехід після кліку, не перемикаємо підсвітку

    function go(id) {
      const el = document.getElementById(id);
      if (!el) return;
      activeId.value = id;
      lockUntil = Date.now() + 900;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // активну «таблетку» тримаємо в полі зору, якщо панель прокручується вбік (телефон)
    watch(activeId, async (id) => {
      await nextTick();
      const chip = track.value && track.value.querySelector(`[data-id="${id}"]`);
      // лише горизонтальна прокрутка панелі: scrollIntoView на «таблетці» перервав би плавний перехід сторінки
      if (chip) {
        const left = chip.offsetLeft - (track.value.clientWidth - chip.offsetWidth) / 2;
        track.value.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    });

    function observe() {
      if (observer) observer.disconnect();
      if (!window.IntersectionObserver) return;
      const visible = new Map();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        if (Date.now() < lockUntil) return;
        const current = props.sections.find((s) => visible.get(s.id));
        if (current) activeId.value = current.id;
      }, { rootMargin: '-30% 0px -60% 0px' });
      props.sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
      if (!activeId.value && props.sections.length) activeId.value = props.sections[0].id;
    }

    function onScroll() {
      if (!nav.value) return;
      isStuck.value = nav.value.getBoundingClientRect().top <= 1 && window.scrollY > 0;
    }

    // панель з'являється, коли завантажаться розділи (v-if), тож вимірюємо й стежимо за розміром саме тоді
    function watchSize() {
      if (resizeObserver || !window.ResizeObserver || !nav.value || !nav.value.parentElement) return;
      resizeObserver = new ResizeObserver(() => onResize());
      resizeObserver.observe(nav.value.parentElement);
    }

    watch(() => props.sections.map((s) => s.id).join('|'), async () => {
      await nextTick();
      observe();
      updateBleed();
      watchSize();
      await nextTick();
      updateFade();
    });

    onMounted(async () => {
      await nextTick();
      observe();
      updateBleed();
      await nextTick();
      updateFade();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      watchSize();
    });

    onBeforeUnmount(() => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (resizeObserver) resizeObserver.disconnect();
    });

    return { nav, track, activeId, isStuck, fadeStyle, bleed, bleedStyle, updateFade, go };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$sand: #EFE4D6;
$paper: #FFFDFA;
$cream: #FDF8F3;
$spring: cubic-bezier(.34, 1.56, .64, 1);

.sections-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  // Materialize задає всім <nav> ширину 100%, висоту, line-height і тінь — тут вони не потрібні
  width: auto;
  height: auto;
  line-height: normal;
  box-shadow: none;
  margin: 0 -8px 20px;
  padding: 6px 0 4px;
  background: rgba(253, 248, 243, .92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: box-shadow .3s ease;

  &.is-stuck {
    box-shadow: 0 10px 18px -12px rgba(56, 94, 108, .35);
  }
}

.sections-nav.is-bleed {
  margin-left: calc(-1 * var(--bleed-l));
  margin-right: calc(-1 * var(--bleed-r));

  .sections-nav__track {
    padding-left: var(--bleed-l);
    padding-right: var(--bleed-r);
    scroll-padding-inline: var(--bleed-l) var(--bleed-r);
  }
}

.sections-nav__track {
  display: flex;
  gap: 10px;
  // запас зверху, знизу й з боків: смуга прокрутки обрізає все, що за її межами, — тут поміщаються
  // підйом при наведенні, тінь активної «таблетки» і кільце фокусу
  padding: 5px 8px 8px;
  overflow-x: auto;
  scroll-padding-inline: 8px;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--fade-l), #000 calc(100% - var(--fade-r)), transparent);
  mask-image: linear-gradient(to right, transparent, #000 var(--fade-l), #000 calc(100% - var(--fade-r)), transparent);

  &::-webkit-scrollbar {
    display: none;
  }
}

.sections-nav__chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
  height: 44px;
  padding: 0 8px 0 14px;
  border: 2px solid $sand;
  border-radius: 14px;
  background: $paper;
  color: $ink;
  font: 700 15px/1 "Nunito", sans-serif;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .25s, border-color .25s, color .25s, transform .3s $spring, box-shadow .25s;

  &:focus {
    background: $paper;
    outline: none;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #DCCDB9;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(56, 94, 108, .35);
  }

  &.is-active {
    border-color: $blue;
    background: $blue;
    color: #fff;
    box-shadow: 0 3px 0 $teal;
  }
}

.sections-nav__num {
  color: $gold;
  font-family: "Anton", sans-serif;
  font-size: 16px;
  letter-spacing: .02em;
}

.is-active .sections-nav__num {
  color: #fff;
  opacity: .85;
}

.sections-nav__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 26px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 9px;
  background: $sand;
  color: #7E8089;
  font: 800 12.5px/1 "Nunito", sans-serif;
  transition: background-color .25s, color .25s;

  svg {
    width: 15px;
    height: 15px;
  }
}

.is-active .sections-nav__count {
  background: rgba(255, 255, 255, .25);
  color: #fff;
}

.is-done .sections-nav__count {
  background: $gold;
  color: #fff;
}

@media (max-width: 760px) {
  .sections-nav__chip {
    height: 40px;
    font-size: 14px;
  }
}
</style>

<!-- src/components/ui/InsightAccordion.vue -->
<!--
  Розгортний блок для зведень у картці клієнта: іконка теми, назва, звідки дані, лічильник записів.
  Лічильник видно й у згорнутому стані — одразу зрозуміло, чи є що відкривати.
  <InsightAccordion title="Патерн самозахисту" icon="IconShield" hint="Із записів сесій" :count="3" @open="load">…</InsightAccordion>
-->
<template>
  <section class="insight" :class="{ 'is-open': open, 'is-empty': count === 0 }">
    <button
        :id="headId"
        type="button"
        class="insight__head"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="bodyId"
        @click="toggle"
    >
      <span class="insight__icon"><component :is="icon" /></span>
      <span class="insight__titles">
        <span class="insight__title">{{ title }}</span>
        <span v-if="hint" class="insight__hint">{{ hint }}<span v-if="countText" class="insight__count-inline"> · {{ countText }}</span></span>
      </span>
      <span v-if="countText" class="insight__count">{{ countText }}</span>
      <span class="insight__chevron" aria-hidden="true"><IconChevronDown /></span>
    </button>

    <!-- висота анімується через grid: 0fr → 1fr, без ручних вимірів -->
    <div :id="bodyId" class="insight__body" role="region" :aria-labelledby="headId" :aria-hidden="open ? 'false' : 'true'">
      <div class="insight__inner">
        <div class="insight__content">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue';
import IconChevronDown from '@/components/icons/IconChevronDown.vue';

let uid = 0;

export default {
  name: 'InsightAccordion',
  components: { IconChevronDown },
  props: {
    title: { type: String, required: true },
    hint: { type: String, default: '' },
    icon: { type: [String, Object], required: true },
    // кількість записів; null — невідомо (ще не завантажено)
    count: { type: Number, default: null },
    // слова для лічильника: «1 запис», «2 записи», «5 записів»
    forms: { type: Array, default: () => ['запис', 'записи', 'записів'] },
    defaultOpen: { type: Boolean, default: false },
  },
  emits: ['open'],
  setup(props, { emit }) {
    uid += 1;
    const headId = `insight-head-${uid}`;
    const bodyId = `insight-body-${uid}`;
    const open = ref(props.defaultOpen);

    const countText = computed(() => {
      if (props.count === null || props.count === undefined) return '';
      if (props.count === 0) return 'порожньо';
      const n = props.count;
      const [one, few, many] = props.forms;
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
      return `${n} ${many}`;
    });

    function toggle() {
      open.value = !open.value;
      if (open.value) emit('open');
    }

    return { headId, bodyId, open, countText, toggle };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$sand: #EFE4D6;
$paper: #FFFDFA;
$ease: cubic-bezier(.22, 1, .36, 1);

.insight {
  border: 2px solid $sand;
  border-radius: 20px;
  background: $paper;
  box-shadow: 0 4px 0 $sand;
  transition: border-color .35s ease, box-shadow .35s ease;

  &.is-open {
    border-color: #DCCDB9;
    box-shadow: 0 4px 0 #DCCDB9;
  }
}

.insight__head {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 72px;
  padding: 12px 16px 12px 14px;
  box-sizing: border-box;
  border: none;
  border-radius: 18px;
  background: transparent;
  color: $ink;
  font-family: "Nunito", sans-serif;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    background: transparent;
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(56, 94, 108, .3);
  }

  // підсвітка шеврона при наведенні — лише для згорнутого блоку (на телефоні «hover» лишається після тапу)
  .insight:not(.is-open) &:hover .insight__chevron {
    background: #E6D8C6;
  }
}

.insight__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: $blue;
  box-shadow: 0 3px 0 $teal;
  color: #fff;

  :deep(svg) {
    width: 22px;
    height: 22px;
  }
}

.is-empty .insight__icon {
  background: #B9C9CF;
  box-shadow: 0 3px 0 #94A7AE;
}

.insight__titles {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.insight__title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.insight__hint {
  color: #8A8C94;
  font-size: 13.5px;
  font-weight: 700;
}

.insight__count {
  flex: none;
  padding: 4px 10px;
  border-radius: 9px;
  background: $sand;
  color: #6E7079;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.insight__count-inline {
  display: none;
}

.is-empty .insight__count {
  background: transparent;
  color: #A3A5AD;
}

.insight__chevron {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: $sand;
  color: $ink;
  transition: background-color .3s ease, color .3s ease, transform .5s $ease;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

.is-open .insight__chevron {
  background: $teal;
  color: #fff;
  transform: rotate(180deg);
}

.insight__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .5s $ease;
}

.is-open .insight__body {
  grid-template-rows: 1fr;
}

.insight__inner {
  min-height: 0;
  overflow: hidden;
}

.insight__content {
  padding: 0 16px 16px;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity .25s ease, transform .4s $ease;
}

.is-open .insight__content {
  opacity: 1;
  transform: none;
  transition-delay: .08s;
}

@media (max-width: 560px) {
  .insight__head {
    gap: 11px;
    padding: 10px 12px;
  }

  .insight__icon {
    width: 40px;
    height: 40px;
  }

  .insight__title {
    font-size: 16px;
  }

  // лічильник переходить у рядок під назвою, щоб не стискати її
  .insight__count {
    display: none;
  }

  .insight__count-inline {
    display: inline;
  }

  .insight__content {
    padding: 0 12px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .insight__body,
  .insight__content,
  .insight__chevron {
    transition: none;
  }
}
</style>

<!-- src/components/ui/ActionMenu.vue -->
<!--
  Кнопка «Дії» з меню в стилі CRM: розділи з підписами, у кожного пункту — іконка в плитці.
  <ActionMenu :groups="[{ title: 'Пара', items: [{ label: 'Назначити партнера', icon: IconUserPlus, onSelect: fn }] }]" />
  Іконки передавати через markRaw. Закривається кліком поза меню, Esc, Tab; стрілками — по пунктах.
-->
<template>
  <div ref="root" class="action-menu" :class="{ 'is-open': open }">
    <button
        ref="trigger"
        type="button"
        class="action-menu__trigger"
        aria-haspopup="menu"
        :aria-expanded="open ? 'true' : 'false'"
        @click="toggle"
        @keydown.down.prevent="openAndFocus(0)"
    >
      <span class="action-menu__trigger-icon"><IconDotsVertical /></span>
      <span class="action-menu__trigger-label">{{ label }}</span>
    </button>

    <Transition name="action-menu">
      <div v-if="open" ref="panel" class="action-menu__panel" role="menu" :aria-label="label" @keydown="onKeydown">
        <div v-for="(group, groupIndex) in visibleGroups" :key="group.title || groupIndex" class="action-menu__group">
          <p v-if="group.title" class="action-menu__caption">{{ group.title }}</p>
          <button
              v-for="item in group.items"
              :key="item.label"
              type="button"
              role="menuitem"
              class="action-menu__item"
              :style="{ '--i': item.order }"
              @click="select(item)"
          >
            <span class="action-menu__icon"><component :is="item.icon" /></span>
            <span class="action-menu__label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
import IconDotsVertical from '@/components/icons/IconDotsVertical.vue';

export default {
  name: 'ActionMenu',
  components: { IconDotsVertical },
  props: {
    groups: { type: Array, required: true },
    label: { type: String, default: 'Дії' },
  },
  setup(props) {
    const root = ref(null);
    const trigger = ref(null);
    const panel = ref(null);
    const open = ref(false);

    // порожні розділи не показуємо; наскрізний номер пункту — для поступової появи
    const visibleGroups = computed(() => {
      let order = 0;
      return props.groups
          .filter((group) => group && Array.isArray(group.items) && group.items.length)
          .map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, order: order++ })) }));
    });

    const items = () => (panel.value ? [...panel.value.querySelectorAll('.action-menu__item')] : []);

    function onDocumentPointer(event) {
      if (root.value && !root.value.contains(event.target)) close();
    }

    // Esc закриває меню, де б не був фокус (на кнопці чи в пунктах)
    function onDocumentKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    }

    async function show() {
      if (open.value) return;
      open.value = true;
      document.addEventListener('pointerdown', onDocumentPointer, true);
      document.addEventListener('keydown', onDocumentKeydown);
      await nextTick();
    }

    function close(returnFocus = false) {
      if (!open.value) return;
      open.value = false;
      document.removeEventListener('pointerdown', onDocumentPointer, true);
      document.removeEventListener('keydown', onDocumentKeydown);
      if (returnFocus && trigger.value) trigger.value.focus();
    }

    function toggle() {
      if (open.value) close();
      else show();
    }

    async function openAndFocus(index) {
      await show();
      const list = items();
      if (list[index]) list[index].focus();
    }

    function onKeydown(event) {
      const list = items();
      const current = list.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        list[(current + 1) % list.length].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        list[(current - 1 + list.length) % list.length].focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        list[0].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        list[list.length - 1].focus();
      } else if (event.key === 'Tab') {
        close();
      }
    }

    function select(item) {
      close();
      if (typeof item.onSelect === 'function') item.onSelect();
    }

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', onDocumentPointer, true);
      document.removeEventListener('keydown', onDocumentKeydown);
    });

    return { root, trigger, panel, open, visibleGroups, toggle, openAndFocus, onKeydown, select };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$gold-dark: #BA9571;
$ease: cubic-bezier(.22, 1, .36, 1);

.action-menu {
  position: relative;
  display: inline-block;
}

// кнопка: золота «таблетка» з плиткою-іконкою; відкрите меню — бірюзова, крапки лягають горизонтально
.action-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 18px 0 6px;
  border: none;
  border-radius: 15px;
  background: $gold;
  box-shadow: 0 4px 0 $gold-dark;
  color: #fff;
  font: 800 16px/1 "Nunito", sans-serif;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .45s $ease, box-shadow .3s $ease, background-color .35s ease;

  &:focus {
    background: $gold;
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 4px 0 $gold-dark, 0 0 0 4px rgba(56, 94, 108, .3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 $gold-dark;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 $gold-dark;
    transition-duration: .12s;
  }
}

.action-menu__trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: rgba(255, 255, 255, .24);
  transition: transform .5s $ease, background-color .35s ease;

  svg {
    width: 20px;
    height: 20px;
  }
}

.is-open .action-menu__trigger {
  background: $teal;
  box-shadow: 0 4px 0 #26434E;

  .action-menu__trigger-icon {
    background: rgba(255, 255, 255, .16);
    transform: rotate(90deg);
  }
}

// меню: графітова картка, як тіло полів
.action-menu__panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 1000;
  box-sizing: border-box;
  width: max-content;
  min-width: 270px;
  max-width: min(340px, calc(100vw - 32px));
  padding: 8px;
  border-radius: 20px;
  background: $ink;
  box-shadow: 0 6px 0 rgba(56, 94, 108, .25), 0 26px 50px -14px rgba(36, 38, 46, .55);
  transform-origin: calc(100% - 40px) -10px;
}

.action-menu__group + .action-menu__group {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, .1);
}

.action-menu__caption {
  margin: 8px 12px 4px;
  color: rgba(255, 255, 255, .5);
  font: 800 11.5px/1.2 "Nunito", sans-serif;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.action-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 46px;
  padding: 6px 12px 6px 6px;
  box-sizing: border-box;
  border: none;
  border-radius: 13px;
  background: transparent;
  color: #fff;
  font: 700 15px/1.3 "Nunito", sans-serif;
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
    background: rgba(114, 168, 186, .18);

    .action-menu__icon {
      background: $blue;
      color: #fff;
      transform: scale(1.06);
    }

    .action-menu__label {
      transform: translateX(3px);
    }
  }

  &:active .action-menu__icon {
    transform: scale(.94);
  }
}

.action-menu__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .09);
  color: $gold;
  transition: background-color .3s ease, color .3s ease, transform .45s $ease;

  :deep(svg) {
    width: 19px;
    height: 19px;
  }
}

.action-menu__label {
  min-width: 0;
  transition: transform .45s $ease;
}

// поява: картка розкривається від кнопки, пункти випливають один за одним
.action-menu-enter-active {
  transition: opacity .25s ease, transform .45s $ease;

  .action-menu__item {
    animation: action-item-in .45s $ease both;
    animation-delay: calc(var(--i, 0) * 28ms + 60ms);
  }
}

.action-menu-leave-active {
  transition: opacity .18s ease, transform .2s ease-in;
}

.action-menu-enter-from,
.action-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(.94);
}

@keyframes action-item-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (max-width: 760px) {
  .action-menu__panel {
    min-width: 0;
    width: min(340px, calc(100vw - 32px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-menu__trigger,
  .action-menu__trigger-icon,
  .action-menu__icon,
  .action-menu__label,
  .action-menu-enter-active,
  .action-menu-leave-active,
  .action-menu-enter-active .action-menu__item {
    transition: none;
    animation: none;
  }
}
</style>

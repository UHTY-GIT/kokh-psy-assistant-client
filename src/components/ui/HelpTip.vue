<!-- src/components/ui/HelpTip.vue -->
<!--
  Знак питання з підказкою в стилі CRM: <HelpTip text="Що писати в цьому полі" />
  Підказка живе окремим шаром у body: її нічого не обрізає й не перекриває, вона не вилазить за екран
  (зсувається вбік, а якщо згори немає місця — відкривається знизу); стрілочка завжди дивиться на значок.
  Миша — наведення, клавіатура — фокус, телефон — тап (повторний тап або тап поза нею закриває).
-->
<template>
  <button
      ref="trigger"
      type="button"
      class="help-tip"
      :class="{ 'is-open': isOpen }"
      :aria-label="label"
      :aria-describedby="isOpen ? tipId : null"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @focus="onFocus"
      @blur="hide"
      @click.prevent.stop="onClick"
      @keydown.esc="hide"
  >
    <IconHelp class="help-tip__icon" />
  </button>

  <Teleport to="body">
    <Transition name="help-tip-pop">
      <div
          v-if="isOpen"
          :id="tipId"
          ref="bubble"
          class="help-tip__bubble"
          :class="{ 'is-below': position.below }"
          :style="bubbleStyle"
          role="tooltip"
          @pointerenter="onEnter"
          @pointerleave="onLeave"
      >
        {{ text }}
        <span class="help-tip__arrow" aria-hidden="true"></span>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue';
import IconHelp from '@/components/icons/IconHelp.vue';

let uid = 0;
const MARGIN = 10; // відступ від країв екрана
const GAP = 12; // від значка до підказки

export default {
  name: 'HelpTip',
  components: { IconHelp },
  props: {
    text: { type: String, required: true },
    label: { type: String, default: 'Підказка' },
  },
  setup() {
    uid += 1;
    const tipId = `help-tip-${uid}`;
    const trigger = ref(null);
    const bubble = ref(null);
    const isOpen = ref(false);
    const position = reactive({ left: 0, top: 0, arrow: 0, below: false, ready: false });
    let hideTimer = null;
    let lastPointer = 'mouse';

    const bubbleStyle = computed(() => ({
      left: `${position.left}px`,
      top: `${position.top}px`,
      '--arrow-x': `${position.arrow}px`,
      visibility: position.ready ? 'visible' : 'hidden',
    }));

    function place() {
      if (!trigger.value || !bubble.value) return;
      const icon = trigger.value.getBoundingClientRect();
      const tip = bubble.value.getBoundingClientRect();
      const centerX = icon.left + icon.width / 2;
      const left = Math.min(Math.max(MARGIN, centerX - tip.width / 2), window.innerWidth - tip.width - MARGIN);
      const spaceAbove = icon.top - GAP - MARGIN;
      position.below = spaceAbove < tip.height;
      position.top = position.below ? icon.bottom + GAP : icon.top - GAP - tip.height;
      position.left = left;
      // стрілочка над значком навіть коли підказку зсунуто від краю екрана
      position.arrow = Math.min(Math.max(16, centerX - left), tip.width - 16);
      position.ready = true;
    }

    let frame = null;
    const onViewportChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };

    function onDocumentPointer(event) {
      const inside = [trigger.value, bubble.value].some((el) => el && el.contains(event.target));
      if (!inside) hide();
    }

    async function show() {
      clearTimeout(hideTimer);
      if (isOpen.value) return;
      position.ready = false;
      isOpen.value = true;
      document.addEventListener('pointerdown', onDocumentPointer, true);
      window.addEventListener('scroll', onViewportChange, true);
      window.addEventListener('resize', onViewportChange);
      await nextTick();
      place();
    }

    function hide() {
      clearTimeout(hideTimer);
      if (!isOpen.value) return;
      isOpen.value = false;
      document.removeEventListener('pointerdown', onDocumentPointer, true);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    }

    function onEnter(event) {
      lastPointer = event.pointerType;
      if (event.pointerType === 'mouse') show();
    }

    function onLeave(event) {
      // невелика затримка: курсор встигає перейти зі значка на саму підказку
      if (event.pointerType === 'mouse') hideTimer = setTimeout(hide, 160);
    }

    // з клавіатури (Tab) — показуємо одразу; мишею вже показало наведення, дотиком — покаже тап
    function onFocus() {
      if (trigger.value && trigger.value.matches(':focus-visible')) show();
    }

    function onClick() {
      // на дотик тап відкриває/закриває; мишею підказка вже відкрита наведенням
      if (lastPointer !== 'mouse' || !isOpen.value) {
        if (isOpen.value) hide();
        else show();
      }
    }

    onBeforeUnmount(() => {
      hide();
      cancelAnimationFrame(frame);
    });

    return { tipId, trigger, bubble, isOpen, position, bubbleStyle, onEnter, onLeave, onClick, onFocus, show, hide };
  },
};
</script>

<style scoped lang="scss">
$teal: #385E6C;
$spring: cubic-bezier(.34, 1.56, .64, 1);

.help-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 26px;
  height: 26px;
  margin: -3px -4px -3px 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, .8);
  cursor: help;
  -webkit-tap-highlight-color: transparent;
  transition: background-color .2s, color .2s, transform .3s $spring;

  &:focus {
    background: transparent;
    outline: none;
  }

  &:hover,
  &.is-open {
    background: rgba(255, 255, 255, .22);
    color: #fff;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px #fff;
  }

  &:active {
    transform: scale(.9);
  }
}

.help-tip__icon {
  display: block;
  width: 19px;
  height: 19px;
}

.help-tip__bubble {
  position: fixed;
  z-index: 2100;
  box-sizing: border-box;
  max-width: min(320px, calc(100vw - 20px));
  padding: 11px 15px;
  border-radius: 12px;
  background: $teal;
  box-shadow: 0 12px 28px rgba(56, 94, 108, .3);
  color: #fff;
  font: 600 14px/1.45 "Nunito", sans-serif;
  text-align: left;
  white-space: normal;
  overflow-wrap: break-word;
  pointer-events: auto;
  transform-origin: var(--arrow-x) calc(100% + 8px);

  &.is-below {
    transform-origin: var(--arrow-x) -8px;
  }
}

.help-tip__arrow {
  position: absolute;
  left: var(--arrow-x);
  top: 100%;
  width: 0;
  height: 0;
  margin-left: -8px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid $teal;
}

.is-below .help-tip__arrow {
  top: auto;
  bottom: 100%;
  border-top: none;
  border-bottom: 8px solid $teal;
}

.help-tip-pop-enter-active {
  transition: opacity .18s ease, transform .3s $spring;
}

.help-tip-pop-leave-active {
  transition: opacity .12s ease, transform .14s ease-in;
}

.help-tip-pop-enter-from,
.help-tip-pop-leave-to {
  opacity: 0;
  transform: scale(.88);
}

@media (prefers-reduced-motion: reduce) {
  .help-tip,
  .help-tip-pop-enter-active,
  .help-tip-pop-leave-active {
    transition: none;
  }
}
</style>

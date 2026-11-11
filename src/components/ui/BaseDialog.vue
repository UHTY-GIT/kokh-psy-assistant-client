<!-- src/components/ui/BaseDialog.vue -->
<!--
  Вікно-діалог у стилі CRM: окремим шаром у body, плитка з іконкою, заголовок, текст, вміст і кнопки.
  <BaseDialog :show="open" title="Нова примітка" tone="gold" @close="open = false">
    <template #icon><IconStickyNote /></template>
    ...вміст...
    <template #actions><button class="base-dialog__btn">…</button></template>
  </BaseDialog>
  Esc і клік по фону закривають (поки не busy). Фокус — на елемент з data-autofocus.
-->
<template>
  <Teleport to="body">
    <Transition name="base-dialog" appear>
      <div v-if="show" class="base-dialog" @click.self="close">
        <div
            ref="card"
            class="base-dialog__card"
            :class="`is-${tone}`"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
        >
          <button type="button" class="base-dialog__close" aria-label="Закрити" @click="close">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
          </button>

          <div v-if="$slots.icon" class="base-dialog__badge"><slot name="icon" /></div>
          <h2 :id="titleId" class="base-dialog__title">{{ title }}</h2>
          <p v-if="text" class="base-dialog__text">{{ text }}</p>
          <slot />

          <div v-if="$slots.actions" class="base-dialog__actions"><slot name="actions" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';

let uid = 0;

export default {
  name: 'BaseDialog',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    // колір плитки з іконкою: gold — звичайна дія, danger — видалення
    tone: { type: String, default: 'gold' },
    busy: { type: Boolean, default: false },
  },
  emits: ['close'],
  setup(props, { emit }) {
    uid += 1;
    const titleId = `base-dialog-title-${uid}`;
    const card = ref(null);

    const close = () => {
      if (!props.busy) emit('close');
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') close();
    };

    watch(() => props.show, async (open) => {
      if (open) {
        document.addEventListener('keydown', onKeydown);
        await nextTick();
        const target = card.value && card.value.querySelector('[data-autofocus]');
        if (target) target.focus({ preventScroll: true });
      } else {
        document.removeEventListener('keydown', onKeydown);
      }
    }, { immediate: true });

    onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

    return { titleId, card, close };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$teal: #385E6C;
$gold: #DAB189;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$paper: #FFFDFA;
$red: #DF4545;
$smooth: cubic-bezier(.22, 1, .36, 1);
$spring: cubic-bezier(.34, 1.56, .64, 1);

.base-dialog {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(56, 94, 108, .42);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.base-dialog__card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 32px 26px 24px;
  border-radius: 26px;
  background: $paper;
  box-shadow: 0 6px 0 $sand, 0 30px 60px rgba(56, 94, 108, .3);
  color: $ink;
  font-family: "Nunito", sans-serif;
  text-align: center;
}

.base-dialog__close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #9A9CA4;
  cursor: pointer;
  transition: background-color .25s, color .25s, transform .45s $smooth;

  svg {
    width: 20px;
    height: 20px;
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

.base-dialog__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: 22px;
  background: $gold;
  box-shadow: 0 5px 0 $gold-dark;
  color: #fff;
  animation: base-dialog-badge .6s .08s $spring both;

  :deep(svg) {
    width: 34px;
    height: 34px;
  }
}

.is-danger .base-dialog__badge {
  background: $red;
  box-shadow: 0 5px 0 #B83434;
}

.base-dialog__title {
  margin: 0 0 8px;
  color: $ink;
  font-family: "Nunito", sans-serif;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.base-dialog__text {
  margin: 0 auto 18px;
  max-width: 360px;
  color: #6B6D76;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.base-dialog__actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}

@keyframes base-dialog-badge {
  from {
    opacity: 0;
    transform: scale(.5) rotate(-12deg);
  }
}

.base-dialog-enter-active {
  transition: opacity .25s ease;

  .base-dialog__card {
    transition: transform .5s $smooth, opacity .25s ease;
  }
}

.base-dialog-leave-active {
  transition: opacity .2s ease .05s;

  .base-dialog__card {
    transition: transform .2s ease-in, opacity .2s ease;
  }
}

.base-dialog-enter-from,
.base-dialog-leave-to {
  opacity: 0;

  .base-dialog__card {
    opacity: 0;
    transform: translateY(24px) scale(.94);
  }
}

@media (max-width: 480px) {
  .base-dialog {
    align-items: flex-end;
    padding: 10px;
  }

  .base-dialog__card {
    padding: 30px 20px 20px;
    border-radius: 24px;
  }

  .base-dialog__actions {
    flex-direction: column-reverse;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-dialog__badge {
    animation: none;
  }
}
</style>

<style lang="scss">
// кнопки діалогу приходять через слот, тож їхні стилі — без scoped
$ink: #494B55;
$gold: #DAB189;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$red: #DF4545;
$smooth: cubic-bezier(.22, 1, .36, 1);

// кнопки діалогу: .base-dialog__btn — основна (золота), .is-secondary — пісочна, .is-danger — червона
.base-dialog__btn {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 52px;
  padding: 0 18px;
  border: none;
  border-radius: 15px;
  background: $gold;
  box-shadow: 0 4px 0 $gold-dark;
  color: #fff;
  font: 800 16px/1 "Nunito", sans-serif;
  cursor: pointer;
  transition: transform .4s $smooth, box-shadow .25s ease, background-color .25s ease, opacity .25s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:focus {
    background: $gold;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 $gold-dark;
  }

  &:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: 0 1px 0 $gold-dark;
    transition-duration: .12s;
  }

  &:focus-visible {
    outline: 3px solid rgba(56, 94, 108, .35);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: .55;
  }
}

.base-dialog__btn.is-secondary {
  background: $sand;
  box-shadow: 0 4px 0 #DCCDB9;
  color: $ink;

  &:focus {
    background: $sand;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 6px 0 #DCCDB9;
  }

  &:active:not(:disabled) {
    box-shadow: 0 1px 0 #DCCDB9;
  }
}

.base-dialog__btn.is-danger {
  background: $red;
  box-shadow: 0 4px 0 #B83434;

  &:focus {
    background: $red;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 6px 0 #B83434;
  }

  &:active:not(:disabled) {
    box-shadow: 0 1px 0 #B83434;
  }
}

@media (max-width: 480px) {
  .base-dialog__actions .base-dialog__btn {
    flex: none;
    width: 100%;
  }
}
</style>

<!--src/components/modal/ModalSessionSuccess.vue-->
<template>
  <!-- Підтвердження завершення сесії: окремим шаром у body (над «Островом» і будь-якими панелями) -->
  <Teleport to="body">
    <Transition name="finish-dialog" appear>
      <div v-if="showModal" class="finish-dialog" @click.self="closeModal">
        <div
            class="finish-dialog__card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="finish-dialog-title"
            aria-describedby="finish-dialog-text"
        >
          <button type="button" class="finish-dialog__close" aria-label="Закрити" @click="closeModal">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
          </button>

          <div class="finish-dialog__badge"><IconFlagFinish /></div>
          <h2 id="finish-dialog-title" class="finish-dialog__title">{{ title }}</h2>
          <p id="finish-dialog-text" class="finish-dialog__text">{{ text }}</p>

          <div v-if="total > 0" class="finish-dialog__progress" :class="{ 'is-full': filled >= total }">
            <div class="finish-dialog__bar"><span :style="{ width: `${percent}%` }"></span></div>
            <p>Заповнено <b>{{ filled }}</b> з <b>{{ total }}</b> {{ fieldsWord }}</p>
          </div>
          <p v-if="total > 0 && filled < total" class="finish-dialog__hint">Порожні поля можна заповнити пізніше — у редагуванні сесії.</p>

          <div class="finish-dialog__actions">
            <button type="button" class="finish-dialog__cancel" @click="closeModal">Повернутися</button>
            <button ref="confirmButton" type="button" class="finish-dialog__confirm" :class="{ 'is-busy': busy }" :disabled="busy" @click="confirm">
              <IconFlagFinish class="finish-dialog__confirm-icon" />
              <span>{{ busy ? busyLabel : confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import IconFlagFinish from '@/components/icons/IconFlagFinish.vue';

export default {
  components: { IconFlagFinish },
  props: {
    showModal: Boolean,
    IDconsultation: Number,
    clientId: Number,
    formData: Object,
    title: { type: String, default: 'Завершити сесію?' },
    text: { type: String, default: 'Відповіді збережуться, а сесія отримає статус «завершена». Переглянути й відредагувати її можна буде в картці клієнта.' },
    confirmLabel: { type: String, default: 'Завершити' },
    busyLabel: { type: String, default: 'Зберігаємо…' },
    // скільки полів заповнено — показуємо перед завершенням
    filled: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    busy: { type: Boolean, default: false },
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const confirmButton = ref(null);

    const percent = computed(() => (props.total ? Math.round((Math.min(props.filled, props.total) / props.total) * 100) : 0));
    // «з 1 поля», «з 21 поля», але «з 11 полів», «з 5 полів»
    const fieldsWord = computed(() => (props.total % 10 === 1 && props.total % 100 !== 11 ? 'поля' : 'полів'));

    const closeModal = () => {
      if (!props.busy) emit('close');
    };

    const confirm = () => {
      emit('confirm');
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') closeModal();
    };

    watch(() => props.showModal, async (open) => {
      if (open) {
        document.addEventListener('keydown', onKeydown);
        await nextTick();
        if (confirmButton.value) confirmButton.value.focus({ preventScroll: true });
      } else {
        document.removeEventListener('keydown', onKeydown);
      }
    }, { immediate: true });

    onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

    return {
      confirmButton,
      percent,
      fieldsWord,
      closeModal,
      confirm
    };
  }
}
</script>
<style>
.modal-window {
  position: fixed;
  z-index: 3;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(56 94 108 / 43%);
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #FDF8F3;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  color: #494B55;
}
.modal-content-all p {
  font-family: "Nunito", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  margin: 10px 0 20px;
  text-align: center;
}
.modal-close-butt {
  display: flex;
  justify-content: flex-end;
}
.modal-close-butt img {
  cursor: pointer;
}
.modal-window.is-active {
  display: flex;
}
.chosen-templates .container-input select,
.enter-name .container-input input {
  width: 100%;
  height: auto !important;
  margin: 0;
  line-height: normal;
  max-width: none;
}
</style>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$paper: #FFFDFA;
$smooth: cubic-bezier(.22, 1, .36, 1);
$spring: cubic-bezier(.34, 1.56, .64, 1);

.finish-dialog {
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

.finish-dialog__card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 34px 28px 26px;
  border-radius: 26px;
  background: $paper;
  box-shadow: 0 6px 0 $sand, 0 30px 60px rgba(56, 94, 108, .3);
  color: $ink;
  font-family: "Nunito", sans-serif;
  text-align: center;
}

.finish-dialog__close {
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
  transition: background-color .2s, color .2s, transform .3s $spring;

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

.finish-dialog__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  margin: 0 auto 18px;
  border-radius: 24px;
  background: $gold;
  box-shadow: 0 5px 0 $gold-dark;
  color: #fff;
  animation: finish-badge-in .6s .08s $spring both;

  :deep(svg) {
    width: 38px;
    height: 38px;
  }

  :deep(.icon-flag__cloth) {
    transform-box: fill-box;
    transform-origin: left center;
    animation: flag-wave 1.6s ease-in-out .5s infinite;
  }
}

.finish-dialog__title {
  margin: 0 0 10px;
  color: $ink;
  font-family: "Nunito", sans-serif;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.2;
}

.finish-dialog__text {
  margin: 0 auto 20px;
  max-width: 360px;
  color: #6B6D76;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.finish-dialog__progress {
  margin: 0 0 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #F7F0E7;
  text-align: left;

  p {
    margin: 10px 0 0;
    color: $ink;
    font-size: 15px;
    font-weight: 700;
  }
}

.finish-dialog__bar {
  height: 10px;
  overflow: hidden;
  border-radius: 6px;
  background: $sand;

  span {
    display: block;
    height: 100%;
    border-radius: 6px;
    background: $blue;
    transform-origin: left center;
    animation: finish-bar-in .9s .25s $smooth both;
  }
}

.finish-dialog__progress.is-full .finish-dialog__bar span {
  background: $gold;
}

.finish-dialog__hint {
  margin: 0 0 4px;
  color: #8A8C94;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.finish-dialog__actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;

  button {
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 52px;
    padding: 0 18px;
    border: none;
    border-radius: 15px;
    font: 800 16px/1 "Nunito", sans-serif;
    cursor: pointer;
    transition: transform .3s $spring, box-shadow .2s, background-color .2s;

    &:active:not(:disabled) {
      transform: translateY(3px);
    }

    &:focus-visible {
      outline: 3px solid rgba(56, 94, 108, .35);
      outline-offset: 2px;
    }
  }
}

.finish-dialog__cancel {
  background: $sand;
  box-shadow: 0 4px 0 #DCCDB9;
  color: $ink;

  &:focus {
    background: $sand;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #DCCDB9;
  }

  &:active {
    box-shadow: 0 1px 0 #DCCDB9;
  }
}

.finish-dialog__confirm {
  background: $gold;
  box-shadow: 0 4px 0 $gold-dark;
  color: #fff;

  &:focus {
    background: $gold;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 $gold-dark;

    :deep(.icon-flag__cloth) {
      animation: flag-wave .9s ease-in-out infinite;
    }
  }

  &:active:not(:disabled) {
    box-shadow: 0 1px 0 $gold-dark;
  }

  &.is-busy {
    cursor: progress;
    opacity: .85;

    :deep(.icon-flag__cloth) {
      animation: flag-wave .7s ease-in-out infinite;
    }
  }
}

.finish-dialog__confirm-icon {
  width: 22px;
  height: 22px;
}

:deep(.icon-flag__cloth) {
  transform-box: fill-box;
  transform-origin: left center;
}

@keyframes flag-wave {
  0%, 100% {
    transform: skewY(0) scaleX(1);
  }
  35% {
    transform: skewY(-7deg) scaleX(.93);
  }
  70% {
    transform: skewY(4deg) scaleX(.97);
  }
}

@keyframes finish-badge-in {
  from {
    opacity: 0;
    transform: scale(.5) rotate(-12deg);
  }
}

@keyframes finish-bar-in {
  from {
    transform: scaleX(0);
  }
}

// поява: фон проявляється, картка підстрибує знизу
.finish-dialog-enter-active {
  transition: opacity .25s ease;

  .finish-dialog__card {
    transition: transform .45s $spring, opacity .25s ease;
  }
}

.finish-dialog-leave-active {
  transition: opacity .2s ease .05s;

  .finish-dialog__card {
    transition: transform .2s ease-in, opacity .2s ease;
  }
}

.finish-dialog-enter-from,
.finish-dialog-leave-to {
  opacity: 0;

  .finish-dialog__card {
    opacity: 0;
    transform: translateY(24px) scale(.94);
  }
}

@media (max-width: 480px) {
  .finish-dialog {
    align-items: flex-end;
    padding: 10px;
  }

  .finish-dialog__card {
    padding: 30px 20px 20px;
    border-radius: 24px;
  }

  .finish-dialog__actions {
    flex-direction: column-reverse;

    button {
      flex: none;
      width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .finish-dialog__badge,
  .finish-dialog__bar span,
  :deep(.icon-flag__cloth) {
    animation: none !important;
  }
}
</style>

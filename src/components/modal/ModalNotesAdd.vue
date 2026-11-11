<!-- src/components/modal/ModalNotesAdd.vue -->
<!-- Нова примітка: поле на кілька рядків; Enter — записати, Shift+Enter — новий рядок -->
<template>
  <BaseDialog
      :show="showModal"
      title="Нова примітка"
      text="Запишіть думку, поки вона свіжа, — примітка з'явиться у списку."
      @close="closeModal"
  >
    <template #icon><IconStickyNote /></template>

    <div class="note-field" :class="{ 'is-focused': focused }">
      <textarea
          id="notes"
          v-model="noteTitle"
          data-autofocus
          rows="3"
          maxlength="500"
          placeholder="Наприклад: перенести сесію Марії на четвер"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter.exact.prevent="confirm"
      ></textarea>
      <span class="note-field__count">{{ noteTitle.length }} / 500</span>
    </div>
    <p class="note-hint"><kbd>Enter</kbd> — записати, <kbd>Shift</kbd> + <kbd>Enter</kbd> — новий рядок</p>

    <template #actions>
      <button type="button" class="base-dialog__btn is-secondary" @click="closeModal">Скасувати</button>
      <button type="button" class="base-dialog__btn" :disabled="!canSave" @click="confirm">
        <IconPlus /> Записати
      </button>
    </template>
  </BaseDialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import BaseDialog from '@/components/ui/BaseDialog.vue';
import { IconStickyNote, IconPlus } from '@/components/icons';

export default {
  components: { BaseDialog, IconStickyNote, IconPlus },
  props: {
    showModal: Boolean,
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const noteTitle = ref('');
    const focused = ref(false);
    const canSave = computed(() => noteTitle.value.trim().length > 0);

    // кожне відкриття — з чистого поля
    watch(() => props.showModal, (open) => {
      if (open) noteTitle.value = '';
    });

    const closeModal = () => {
      emit('close');
    };

    const confirm = () => {
      if (!canSave.value) return;
      emit('confirm', noteTitle.value.trim());
    };

    return {
      noteTitle,
      focused,
      canSave,
      closeModal,
      confirm
    };
  }
}
</script>

<style scoped lang="scss">
.note-field {
  position: relative;
  border-radius: 16px;
  background: #494B55;
  box-shadow: 0 4px 0 transparent;
  transition: box-shadow .3s ease;
  text-align: left;

  &.is-focused {
    box-shadow: 0 4px 0 #DAB189;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 112px;
    box-sizing: border-box;
    margin: 0;
    padding: 14px 16px 30px;
    border: none;
    border-radius: 16px;
    background: transparent;
    color: #fff;
    font: 600 16px/1.45 "Nunito", sans-serif;
    resize: none;
    outline: none;

    &::placeholder {
      color: rgba(255, 255, 255, .5);
    }
  }
}

.note-field__count {
  position: absolute;
  right: 14px;
  bottom: 9px;
  color: rgba(255, 255, 255, .45);
  font: 700 12px/1 "Nunito", sans-serif;
  pointer-events: none;
}

.note-hint {
  margin: 12px 0 0;
  color: #8A8C94;
  font: 600 13px/1.4 "Nunito", sans-serif;

  kbd {
    padding: 1px 6px;
    border-radius: 6px;
    background: #EFE4D6;
    color: #494B55;
    font: 800 12px/1.4 "Nunito", sans-serif;
  }
}

@media (hover: none) {
  .note-hint {
    display: none;
  }
}
</style>

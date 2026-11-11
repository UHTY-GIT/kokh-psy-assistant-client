<!-- src/components/modal/ModalNotesDelete.vue -->
<!-- Підтвердження видалення примітки: показуємо саму примітку, щоб було видно, що саме зникне -->
<template>
  <BaseDialog
      :show="showModal"
      title="Видалити примітку?"
      text="Її не можна буде відновити."
      tone="danger"
      @close="closeModal"
  >
    <template #icon><IconTrash /></template>

    <blockquote v-if="noteText" class="note-quote">
      <IconQuote class="note-quote__mark" />
      <span>{{ noteText }}</span>
    </blockquote>

    <template #actions>
      <button type="button" class="base-dialog__btn is-secondary" data-autofocus @click="closeModal">Залишити</button>
      <button type="button" class="base-dialog__btn is-danger" @click="confirm">
        <IconTrash /> Видалити
      </button>
    </template>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/ui/BaseDialog.vue';
import { IconTrash, IconQuote } from '@/components/icons';

export default {
  components: { BaseDialog, IconTrash, IconQuote },
  props: {
    showModal: Boolean,
    idNotes: [String, Number],
    noteText: { type: String, default: '' },
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('close');
    };

    const confirm = () => {
      emit('confirm', props.idNotes);
    };

    return {
      closeModal,
      confirm
    };
  }
}
</script>

<style scoped>
/* примітка як цитата: лапка зверху зліва, без смужки збоку */
.note-quote {
  position: relative;
  margin: 0;
  padding: 16px 18px 16px 50px;
  border: none;
  border-radius: 14px;
  background: #F7F0E7;
  color: #494B55;
  font: 700 15px/1.5 "Nunito", sans-serif;
  text-align: left;
  overflow-wrap: anywhere;

  span {
    white-space: pre-line; /* переноси рядків у примітці зберігаються */
  }
}

.note-quote__mark {
  position: absolute;
  top: 14px;
  left: 18px;
  width: 19px;
  height: 30px;
  color: #DAB189;
}
</style>

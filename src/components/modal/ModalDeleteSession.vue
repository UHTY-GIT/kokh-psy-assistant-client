<!-- src/components/modal/ModalDeleteSession.vue -->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-close-butt">
        <img src="@/assets/icons/close-modal.svg" alt="close" @click="closeModal">
      </div>
      <div class="modal-content-all">
        <p>Ви дійсно хочете видалити сесію з користувачем <span>{{ clientName }}</span> з назвою <span>"{{ sessionTitle }}"</span>?</p>
        <div>
          <div class="modal-btn">
            <button class="btn-send-templates btn-margin-modal" @click="closeModal">Ні</button>
            <button class="btn-send-templates" @click="confirm">Так</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    clientName: String,
    sessionTitle: String,
    sessionId: Number,
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('close');
    };

    const confirm = () => {
      emit('confirm', props.sessionId);
    };

    return {
      closeModal,
      confirm
    };
  }
}
</script>

<style scoped>
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
  display: none;
}

.modal-window.is-active {
  display: flex;
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
  font-weight: 500;
  font-size: 20px;
  margin: 10px 0 20px;
  text-align: center;
}
.modal-content-all p span {
  font-weight: 700;
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
</style>

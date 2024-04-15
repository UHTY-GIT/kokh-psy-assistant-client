<!--src/components/modal/ModalTemplates.vue-->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }">
    <div class="modal-content">
      <div class="modal-close-butt">
        <img src="@/assets/icons/close-modal.svg" alt="close" @click="closeModal">
      </div>
      <div class="modal-content-all">
        <p>Виберіть шаблон для відправки</p>
        <div class="chosen-templates select-field">
          <div class="container-input">
            <select v-model="selectedTemplateId">
              <option disabled value="">Будь ласка, виберіть шаблон</option>
              <option v-for="template in filteredTemplates" :value="template.id" :key="template.id">{{ template.title }}</option>
            </select>
          </div>
          <div class="modal-btn">
            <button class="btn-send-templates" @click="sendTemplate">Надіслати</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import M from 'materialize-css';
import apiService from '@/services/apiService';
export default {
  props: {
    templates: Array,
    showModal: Boolean,
    selectedClientId: Number,
    selectedTelegramClientId: Number,
    clientWasAgreedConsent: Boolean,
    clientPrimaryPollComplete: Boolean
  },
  data() {
    return {
      selectedTemplateId: '' // Додано змінну для зберігання вибраного ID шаблону
    };
  },
  methods: {
    closeModal() {
      this.$emit('close'); // Емітуйте подію 'close'
    },
    async sendTemplate() {
      if (this.selectedTemplateId && this.selectedClientId && this.selectedTelegramClientId) {
        // Генерація унікального посилання
        const uniqueLink = `http://assistant.psy-kokh.online:8081/send-form?client=${this.selectedClientId}&template=${this.selectedTemplateId}`;

        try {
          const response = await apiService.sendTelegramTemplate(this.selectedTelegramClientId, uniqueLink);
          if (response.data.success) {
            M.toast({ html: 'Шаблон успішно надіслано.' });
            window.open(uniqueLink, '_blank');
          } else {
            M.toast({ html: 'Виникла помилка при надсиланні шаблону.' });
          }
        } catch (error) {
          console.error('Виникла помилка при надсиланні шаблону:', error);
          M.toast({ html: `Помилка: ${error.message}` });
        }
        this.closeModal(); // Закриття модального вікна після відправки
      } else {
        M.toast({ html: 'Будь ласка, виберіть шаблон для відправки.' });
      }
    },
  },
  computed: {
    filteredTemplates() {
      // Якщо клієнт дав згоду, виключаємо шаблони з типом 'consent_individual' та 'consent_couple'
      // Якщо клієнт пройшов первинне опитування, виключаємо 'primary_poll_individual' та 'primary_poll_couple'
      return this.templates.filter(template => {
        const isConsentType = ['consent_individual', 'consent_couple'].includes(template.form_type);
        const isPrimaryPollType = ['primary_poll_individual', 'primary_poll_couple'].includes(template.form_type);
        if (this.clientWasAgreedConsent && isConsentType) {
          return false;
        }
        if (this.clientPrimaryPollComplete && isPrimaryPollType) {
          return false;
        }
        return true;
      });
    }
  },
};
</script>
<style>
.modal-window {
  position: fixed;
  z-index: 1;
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
.chosen-templates .container-input select {
  width: 100%;
  height: auto !important;
  margin: 0;
  line-height: normal;
  max-width: none;
}
</style>
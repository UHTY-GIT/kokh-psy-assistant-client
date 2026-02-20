<!--src/components/modal/ModalTemplates.vue-->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }" @click="closeModal">
    <div class="modal-content" @click.stop>
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
          
          <!-- Поле для введення назви кейсу (Title) -->
          <div v-if="isCaseDescriptionTemplate" class="enter-name container-input" style="margin-top: 15px;">
            <div class="modal-input-block">
              <input type="text" v-model="caseTitle" placeholder="Введіть назву кейсу" />
            </div>
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
    clientPrimaryPollComplete: Boolean,
    clientOriginType: String,
    caseDescriptionCanBeShown: Boolean
  },
  data() {
    return {
      selectedTemplateId: '', // Зберігання вибраного ID шаблону
      caseTitle: '' // Назва кейсу для супервізії
    };
  },
  computed: {
    selectedTemplate() {
      return this.templates.find(t => t.id === this.selectedTemplateId);
    },
    isCaseDescriptionTemplate() {
      return this.selectedTemplate?.form_type === 'case_description';
    },
    filteredTemplates() {
      // Якщо клієнт дав згоду, виключаємо шаблони з типом 'consent_individual' та 'consent_couple'
      // Якщо клієнт пройшов первинне опитування, виключаємо 'primary_poll_individual' та 'primary_poll_couple'
      return this.templates.filter(template => {
        // Відображаються тільки ті форми які записні у validFormTypes
        const validFormTypes = ['consent_individual', 'consent_couple', 'primary_poll_individual', 'primary_poll_couple', 'case_description'];

        // Виключаємо форми, які не є допустимими типами
        if (!validFormTypes.includes(template.form_type)) {
          return false;
        }

        // --- Логіка для case_description ---
        if (template.form_type === 'case_description') {
            // Відображаємо, ТІЛЬКИ якщо тип клієнта "individual_supervision"
            // І якщо опис кейсу ще НЕ закінчено (case_description_can_be_shown === false)
            // (user request: "тип форми ... доступний для відправки тільки якщо у клієнта є 'case_description_can_be_shown': false")
            if (this.clientOriginType === 'individual_supervision' && !this.caseDescriptionCanBeShown) {
                return true;
            }
            return false;
        }
        
        // Якщо це супевізант, йому НЕ ПОТРІБНО показувати звичайні форми
        if (this.clientOriginType === 'individual_supervision') {
            return false; // Для супервізантів показуємо ТІЛЬКИ case_description (який оброблений вище)
        }

        // --- Логіка для звичайних клієнтів ---

        // Виключаємо форми, якщо вони вже були заповнені
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
  methods: {
    closeModal() {
      this.$emit('close'); // Закриття модального вікна
      this.selectedTemplateId = '';
      this.caseTitle = '';
    },
    async sendTemplate() {
      if (!this.selectedTemplateId) {
        M.toast({ html: 'Будь ласка, виберіть шаблон для відправки.' });
        return;
      }

      // Логіка для case_description
      if (this.isCaseDescriptionTemplate) {
          if (!this.caseTitle.trim()) {
              M.toast({ html: 'Будь ласка, введіть назву кейсу.' });
              return;
          }

          try {
              const token = localStorage.getItem('token');
              // Отримуємо профіль, щоб дізнатися ID психолога
              const userProfile = await apiService.getUserProfile(token);
              const psychologistId = userProfile.data.id;

              await apiService.createCaseDescription(
                  token,
                  this.caseTitle,
                  this.selectedClientId,
                  psychologistId,
                  this.selectedTemplateId
              );
              
              const responseTg = await apiService.notifyCaseFill(this.selectedTelegramClientId);
              if (responseTg.success) {
                  M.toast({ html: 'Опис кейсу створено та запит на заповнення надіслано.' });
                  this.closeModal();
              } else {
                  M.toast({ html: 'Помилка при надсиланні сповіщення в Telegram.' });
              }

          } catch (error) {
              console.error('Помилка:', error);
              M.toast({ html: `Помилка: ${error.message}` });
          }
          return;
      }

      // Стандартна логіка
      if (this.selectedClientId && this.selectedTelegramClientId) {
        const uniqueLink = `https://crm-assistant.psy-kokh.online/send-form?client=${this.selectedClientId}&template=${this.selectedTemplateId}`;
        //const uniqueLink = `http://localhost:8080/send-form?client=${this.selectedClientId}&template=${this.selectedTemplateId}`;

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
      }
    },
  },
};
</script>

<style>
.modal-window {
  position: fixed;
  z-index: 1000;
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
.chosen-templates .container-input input {
  width: 100%;
  height: auto !important;
  margin: 0;
  line-height: normal;
  max-width: none;
}
</style>
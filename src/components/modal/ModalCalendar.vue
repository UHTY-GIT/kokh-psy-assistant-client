<!--src/components/modal/ModalCalendar.vue-->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-close-butt">
        <img src="@/assets/icons/close-modal.svg" alt="close" @click="closeModal">
      </div>
      <div class="modal-content-all">
        <p>Заповніть поля форми щоб створити консультацію</p>
        <div>
          <div class="enter-name input-field-text">
            <div class="container-input">
              <input
                  id="name"
                  type="text"
                  v-model="name"
                  placeholder="Введіть бажану назву консультації"
              >
<!--              :class="{ 'is-invalid': v$.nameConsultation.$dirty && v$.nameConsultation.required.$invalid }"-->
            </div>
<!--            <span class="validate-error" v-if="v$.profile.name.$dirty && v$.profile.name.required.$invalid">Це поле не може бути пустим</span>-->
          </div>
          <div class="chosen-templates select-field">
            <div class="container-input">
              <select v-model="selectedClientId">
                <option disabled value="">Будь ласка, виберіть клієнта</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}, {{ client.phone }}</option>
              </select>
            </div>
          </div>
          <div class="chosen-templates select-field">
            <div class="container-input">
              <select v-model="selectedOriginType" :disabled="!selectedClientId">
                <option disabled value="">Будь ласка, виберіть тип консультації</option>
                <option v-for="type in availableConsultationTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="chosen-templates select-field">
            <div class="container-input">
              <select v-model="selectedTemplateId" :disabled="!selectedOriginType">
                <option disabled value="">Будь ласка, виберіть шаблон</option>
                <option v-for="template in availableTemplates" :value="template.id" :key="template.id">{{ template.title }}</option>
              </select>
            </div>
          </div>
          <div class="modal-btn">
            <button class="btn-send-templates" @click="sendEvent">Створити</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import apiService from "@/services/apiService";
import { ref, onMounted, computed, watch } from "vue";
import M from "materialize-css";

export default {
  props: {
    showModal: Boolean,
    start: String,
    end: String,
    allDay: Boolean
  },
  setup(props, { emit }) {
    const name = ref(''); // Для зберігання назви консультації
    const selectedClientId = ref(''); // Для вибору клієнта
    const selectedTemplateId = ref(''); // Для вибору шаблону форми
    const selectedOriginType = ref(''); // Для вибору типу консультації

    const clients = ref([]); // Масив клієнтів
    const allTemplates = ref([]); // Всі шаблони з сервера

    const fetchAllForms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getForms(token);
        if (response && response.data && response.data.data) {
          // Зберігаємо ВСІ шаблони, фільтрація буде на льоту
          allTemplates.value = response.data.data;
        }
      } catch (error) {
        M.toast({ html: 'Помилка завантаження шаблонів сесій' });
      }
    };

    
    const fetchAllClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getClientsAll(token);
        if (response && response.data) {
             clients.value = response.data;
        }
      } catch (error) {
        M.toast({ html: 'Помилка завантаження клієнтів' });
        clients.value = []; 
      }
    };
    
    // Обчислюємо вибраного клієнта об'єктом
    const selectedClient = computed(() => {
      return clients.value.find(c => c.id === selectedClientId.value);
    });

    // 1. Фільтрація типів консультацій
    const availableConsultationTypes = computed(() => {
      if (!selectedClient.value) return [];
      
      const originType = selectedClient.value.origin_type;
      const options = [];

      if (originType === 'individual') {
        options.push({ value: 'individual_consultation', label: 'Індивідуальна' });
      } else if (originType === 'couple_classic') {
        options.push({ value: 'couple_classic_consultation', label: 'Парна класична' });
        options.push({ value: 'couple_diagnostic_consultation', label: 'Парна діагностична' });
      } else if (originType === 'individual_supervision') {
        options.push({ value: 'individual_supervision_consultation', label: 'Супервізія' });
      }
      

      return options;
    });

    // 2. Фільтрація шаблонів (Templates)
    const availableTemplates = computed(() => {
        if (!selectedClient.value) return [];

        const clientOrigin = selectedClient.value.origin_type;
        let allowedFormTypes = [];

        
        if (selectedOriginType.value) {
            allowedFormTypes.push(selectedOriginType.value);
        } else {
            if (clientOrigin === 'individual') {
                allowedFormTypes = ['individual_consultation'];
            } else if (clientOrigin === 'couple_classic') {
                allowedFormTypes = ['couple_classic_consultation', 'couple_diagnostic_consultation'];
            } else if (clientOrigin === 'individual_supervision') {
                allowedFormTypes = ['individual_supervision_consultation'];
            }
        }

        return allTemplates.value.filter(t => allowedFormTypes.includes(t.form_type));
    });

    // Скидання значень при зміні клієнта
    watch(selectedClientId, () => {
      selectedOriginType.value = '';
      selectedTemplateId.value = '';
    });

    const sendEvent = async () => {
      // Валідація полів
      if (!name.value || !selectedClientId.value || !selectedOriginType.value || !selectedTemplateId.value) {
        M.toast({ html: 'Будь ласка, заповніть всі поля і виберіть всі значення' });
        return;
      }

      // Нова логіка валідації для супервізантів
      if (selectedClient.value && selectedClient.value.origin_type === 'individual_supervision') {
          if (selectedClient.value.case_description_can_be_shown === false) {
              M.toast({ html: 'Клієнту ще не надісланий опис кейсу' });
              return; // Зупиняємо виконання, не надсилаємо запит
          }
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: 'Увійдіть у систему' });
          return;
        }

        const eventData = {
          name: name.value,
          client_id: selectedClientId.value,
          custom_form_id: selectedTemplateId.value,
          origin_type: selectedOriginType.value,
          date: props.start
        };

        const response = await apiService.createEvent(
            token,
            eventData.name,
            eventData.client_id,
            eventData.custom_form_id,
            eventData.origin_type,
            eventData.date
        );

        if (response.data) {
          M.toast({ html: 'Подія успішно створена!' });
          closeModal();
          emit('close');
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          const errorMessage = 'Кількість сесій у клієнта вичерпана' || error.response.data.error[0].message;
          M.toast({ html: errorMessage });
        } else {
          M.toast({ html: 'Помилка при створенні події' });
        }
      }
    };


    // Виконання дій при монтуванні компоненту
    onMounted(async () => {
      fetchAllClients();
      fetchAllForms();
    });

    function closeModal() {
      emit('close'); // Видавати подію закриття для батьківського компонента
    }

    return {
      name,
      selectedClientId,
      selectedTemplateId,
      selectedOriginType,
      clients,
      availableConsultationTypes,
      availableTemplates,
      sendEvent,
      closeModal
    };
  }
}
</script>
<style>
.modal-window {
  position: fixed;
  z-index: 3 !important;
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
  font-family: "Nunito";
  font-style: normal;
  font-size: 17px;
  padding: 7px 15px;
  border-radius: 10px;
  border: 3px solid #494B55;
  background-color: #494B55;
  box-sizing: border-box;
  color: #FFFFFF;
  font-weight: 600;
}
.enter-name .container-input input:focus {
  border-bottom: 3px solid #494B55 !important;
}
</style>
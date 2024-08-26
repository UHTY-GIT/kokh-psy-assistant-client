<!--src/components/modal/ModalCalendar.vue-->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }">
    <div class="modal-content">
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
              <select v-model="selectedOriginType">
                <option disabled value="">Будь ласка, виберіть тип консультації</option>
                <option value="individual_consultation">Індивідуальна</option>
                <option value="couple_classic_consultation">Парна класична</option>
                <option value="couple_diagnostic_consultation">Парна діагностична</option>
              </select>
            </div>
          </div>
          <div class="chosen-templates select-field">
            <div class="container-input">
              <select v-model="selectedTemplateId">
                <option disabled value="">Будь ласка, виберіть шаблон</option>
                <option v-for="template in filteredTemplates" :value="template.id" :key="template.id">{{ template.title }}</option>
              </select>
            </div>
          </div>
          <div class="modal-btn">
            <button class="btn-send-templates" @click="sendEvent">Надіслати</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import apiService from "@/services/apiService";
import { ref, onMounted } from "vue";
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
    const filteredTemplates = ref([]); // Масив шаблонів

    const fetchAllForms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getForms(token);
        if (response && response.data && response.data.data) {
          filteredTemplates.value = response.data.data.filter(template =>
              template.form_type === 'couple_classic_consultation' || template.form_type === 'individual_consultation'
          );
        }
      } catch (error) {
        M.toast({ html: 'Помилка завантаження шаблонів сесій' });
      }
    };

    const fetchAllClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getClients(token);
        clients.value = response.data.data;
      } catch (error) {
        M.toast({ html: 'Помилка завантаження клієнтів' });
      }
    };

    const sendEvent = async () => {
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
          date: props.start // Assuming 'props.start' has the correct date string you mentioned
        };

        //console.log("Event data being sent:", eventData);

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
      filteredTemplates,
      fetchAllForms,
      fetchAllClients,
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
}
</style>
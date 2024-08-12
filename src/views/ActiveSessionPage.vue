<template>
  <div>
    <div class="profile_tittle">
      <p>
        Сесія №{{ sessionNumber }}, клієнт {{ clientName }}
      </p>
      <p>
        {{ formattedDate }}
      </p>
    </div>
    <hr class="hr_profile">
  </div>
  <div class="block_active_session">
    <form @submit.prevent="openModal">
      <div v-for="(fields, title) in categorizedFields" :key="title">
        <div class="titte_field">
          <p>{{ title }}</p>
        </div>
        <div class="block_input_field">
          <div v-for="field in fields" :key="field.id" class="forms-name-add active_session_fields">
            <div class="container-input">
              <label :for="field.field_name">{{ field.field_name }}</label>
              <textarea
                  v-if="field.field_type === 'text'"
                  :id="field.field_name"
                  v-model="field.value"
                  :placeholder="'Введіть ' + field.field_name"
              ></textarea>
              <input
                  v-else-if="field.field_type === 'string'"
                  type="text"
                  :id="field.field_name"
                  v-model="field.value"
                  :placeholder="'Введіть ' + field.field_name"
              >
              <select v-else-if="field.field_type === 'select_v2'" :id="field.field_name" v-model="field.value">
                <option disabled value="">Оберіть варіант</option>
                <option v-for="variant in field.variants" :key="variant">{{ variant }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="container-global-form-edit active_session_button">
        <button class="global-form-edit" type="submit">
          <img src="@/assets/icons/share.svg" alt="Send name form">
          <span class="edit-link">Завершити сесію</span>
        </button>
      </div>
    </form>
  </div>
  <!--  Модальне вікно-->
  <ModalSessionSuccess
      v-if="showModal"
      :showModal="showModal"
      :IDconsultation="IDconsultation"
      :clientId="clientId"
      :formData="formData"
      @close="showModal = false"
      @confirm="submitForm"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from "@/services/apiService";
import ModalSessionSuccess from "@/components/modal/ModalSessionSuccess.vue";
import M from "materialize-css";

export default {
  components: {
    ModalSessionSuccess
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formData = ref({
      fields: []
    });

    const showModal = ref(false);
    const clientId = parseInt(route.query.clientId);
    const clientName = route.query.clientName;
    const clientTelegramId = route.query.TelegramId;
    const customFormId = route.query.customFormId;
    const customFormTitle = route.query.customFormTitle;
    const sessionNumber = route.query.sessionNumber;
    const IDconsultation = parseInt(route.query.IDconsultation);
    const dateConsultation = route.query.dateConsultation;

    const fetchFormData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await apiService.getCustomFormById(customFormId);
        formData.value.fields = response.data.data.form_items.map(item => ({
          id: item.id,
          field_name: item.field_name,
          field_type: item.field_type,
          title: item.title,
          variants: item.variants || [],
          value: ''
        }));
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    const categorizedFields = computed(() => {
      return formData.value.fields.reduce((acc, field) => {
        if (!acc[field.title]) {
          acc[field.title] = [];
        }
        acc[field.title].push(field);
        return acc;
      }, {});
    });

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', options);
    };

    const formattedDate = computed(() => {
      return dateConsultation ? formatDate(dateConsultation) : '';
    });

    const openModal = () => {
      showModal.value = true;
    };

    const submitForm = async () => {
      const answers = formData.value.fields.map(field => ({
        form_item_id: field.id,
        text_answer: field.value,
      }));

      const payload = {
        client_id: clientId,
        answers_data: answers,
        consultation_id: IDconsultation
      };

      try {
        const response = await apiService.submitSessionAnswers(payload);
        if (response) {
          showModal.value = false;
          M.toast({html: 'Дані сесії успішно збережено'});

          // Відправка повідомлення в телеграм
          try {
            await apiService.sendSessionEndNotification(clientTelegramId);
            M.toast({html: 'Повідомлення у телеграм успішно надіслано'});
          } catch (telegramError) {
            console.error('Error sending Telegram notification:', telegramError);
            M.toast({html: 'Помилка надсилання повідомлення у телеграм'});
          }


          router.push({name: 'mySession'});
        }
      } catch (error) {
        M.toast({html: 'Помилка надсилання даних сесії'});
        console.error('Error submitting form:', error);
      }
    };

    onMounted(fetchFormData);

    return {
      formData,
      clientId,
      clientName,
      clientTelegramId,
      customFormId,
      customFormTitle,
      sessionNumber,
      IDconsultation,
      showModal,
      openModal,
      submitForm,
      categorizedFields,
      formattedDate
    };
  }
}
</script>

<!-- src/views/ActiveSessionPage.vue -->
<template>
  <div>
    <div class="profile_tittle">
      <p>
        Сесія №{{ sessionNumber }}, клієнт {{ clientName }}
      </p>
    </div>
    <hr class="hr_profile">
  </div>
  <div class="block_active_session">
    <div class="titte_field">
      <p>
        Базові поля
      </p>
    </div>
    <div class="block_input_field">
      <form @submit.prevent="openModal">
        <div v-for="field in formData.fields" :key="field.id" class="forms-name-add active_session_fields">
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
        <div class="container-global-form-edit active_session_button">
          <button class="global-form-edit" type="submit">
            <img src="@/assets/icons/share.svg" alt="Send name form">
            <span class="edit-link">Завершити сесію</span>
          </button>
        </div>
      </form>
    </div>
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
import { ref, onMounted } from 'vue';
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
      fields: [],
    });

    const showModal = ref(false);
    const clientId = route.query.clientId;
    const clientName = route.query.clientName;
    const customFormId = route.query.customFormId;
    const customFormTitle = route.query.customFormTitle;
    const sessionNumber = route.query.sessionNumber;
    const IDconsultation = route.query.IDconsultation;

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
          variants: item.variants || [],
          value: ''
        }));
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    const openModal = () => {
      showModal.value = true;
      //console.log("відкрити модальне вікно" + showModal.value)
    };

    const submitForm = async () => {
      const answers = formData.value.fields.map(field => ({
        form_item_id: field.id,
        text_answer: field.value,
        consultation_id: IDconsultation
      }));

      const payload = {
        client_id: clientId,
        answers_data: answers
      };

      try {
        const response = await apiService.submitSessionAnswers(payload);
        if (response) {
          showModal.value = false;
          M.toast({html: 'Дані сесії успішно збережено'});
          router.push({ name: 'mySession' });
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
      customFormId,
      customFormTitle,
      sessionNumber,
      IDconsultation,
      showModal,
      openModal,
      submitForm
    };
  }
}
</script>

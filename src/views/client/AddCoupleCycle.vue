<!-- src/views/client/AddCoupleCycle.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Цикл пари, клієнт {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
    </div>
    <div class="Block_client">
      <div class="titte_field">
        <p>
          Обрати партнера
        </p>
      </div>
      <form class="name-update-form" @submit.prevent="handleSubmit">
        <div class="forms-name-add">
          <div class="container-input">
            <div class="type-for-view">
              <label for="CoupleClient">Оберіть партнера клієнта</label>
            </div>
            <select id="CoupleClient" v-model="selectedPartnerId">
              <option disabled value="">Будь ласка, оберіть партнера</option>
              <option v-for="partner in availablePartners" :key="partner.id" :value="partner.id">
                {{ partner.name }}, {{ partner.phone }}
              </option>
            </select>
          </div>
        </div>
        <div class="container-global-form-edit submit-coupe-partner">
          <button class="global-form-edit" type="submit">
            <img src="../../assets/icons/form-check-white.svg" alt="Check name form">
            <span class="edit-link">Назначити парнером</span>
          </button>
        </div>
      </form>
      <form v-if="showCoupleCycleForm" class="cycle_couple_form" @submit.prevent="submitCycleForm">
        <div class="titte_field">
          <p>
            Надіслати цикл пари
          </p>
        </div>
        <div class="block_input_field">
          <div v-for="field in cycleFormFields" :key="field.id" class="forms-name-add active_session_fields">
            <div class="container-input">
              <div class="type-for-view">
                <label :for="field.field_name">{{ field.field_name }}</label>
              </div>
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
        <div class="container-global-form-edit active_session_button cycle_button_submit">
          <button class="global-form-edit" type="submit">
            <img src="../../assets/icons/share.svg" alt="Send name form">
            <span class="edit-link">Надіслати цикл пари</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: "CoupleCycle",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const client = ref({});
    const availablePartners = ref([]);
    const selectedPartnerId = ref('');
    const clientId = Number(route.params.id);
    const showCoupleCycleForm = ref(false);
    const cycleFormFields = ref([]);
    const coupleCycleId = ref();

    const fetchClientInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const response = await apiService.getClientById(token, clientId);
        client.value = response.data;

        // Check if the client has a partner_id
        if (client.value.partner_id) {
          selectedPartnerId.value = client.value.partner_id; // Set the selected partner ID
          await fetchCycleForm();
        }
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };

    const fetchClients = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const response = await apiService.getClientsAll(token);
        if (response && response.data) {
            availablePartners.value = response.data.filter(c => Number(c.id) !== clientId);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        M.toast({ html: 'Помилка при завантаженні клієнтів' });
      }
    };

    const handleSubmit = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        await apiService.updateClientСoupleData(clientId, { partner_id: selectedPartnerId.value }, token);
        M.toast({ html: 'Партнер призначений успішно' });
        await fetchCycleForm();
      } catch (error) {
        console.error('Error updating client couple data:', error);
        M.toast({ html: 'Помилка при призначенні партнера' });
      }
    };

    const fetchCycleForm = async () => {
      const formId = 90;
      try {
        const response = await apiService.getCustomFormById(formId);
        //console.log('Full response from getCustomFormById:', response);

        const form = response.data.data;

        // Check if the form and form_items are defined and if form_items is an array
        if (form && Array.isArray(form.form_items)) {
          cycleFormFields.value = form.form_items.map(item => ({
            ...item,
            value: ''
          }));
          showCoupleCycleForm.value = true;
          //console.log('Form items successfully processed:', cycleFormFields.value);
        } else {
          console.error('Form items are not defined or not an array.');
          M.toast({ html: 'Помилка при завантаженні форми циклу пари' });
        }
      } catch (error) {
        console.error('Error fetching couple cycle form:', error);
        M.toast({ html: 'Помилка при завантаженні форми циклу пари' });
      }
    };

    const submitCycleForm = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      const response_id = await apiService.createCoupleCycle(token,90, clientId);
      coupleCycleId.value = response_id.data;

      try {
        const answers = cycleFormFields.value.map(field => ({
          form_item_id: field.id,
          text_answer: field.value,
        }));

        const response = await apiService.submitCoupleCycleAnswers(token, clientId, coupleCycleId.value, answers);
        if (response.data) {
          router.push({ name: 'ClientInformation', params: { id: clientId } });
          M.toast({ html: 'Цикл пари надіслано успішно' });
        } else {
          M.toast({ html: 'Помилка, цикл пари не надіслано' });
        }

        // Optionally, redirect or reset the form after submission
      } catch (error) {
        console.error('Error submitting couple cycle form:', error);
        M.toast({ html: 'Помилка при надсиланні циклу пари' });
      }
    };

    onMounted(() => {
      fetchClientInfo();
      fetchClients();
    });

    return {
      client,
      availablePartners,
      selectedPartnerId,
      handleSubmit,
      showCoupleCycleForm,
      cycleFormFields,
      submitCycleForm
    };
  }
};
</script>

<!-- src/components/modal/ModalAppointPartner.vue -->
<template>
  <div :class="{ 'modal-window': true, 'is-active': showModal }">
    <div class="modal-content modal-appoint-partner">
      <div class="modal-close-butt">
        <img src="@/assets/icons/close-modal.svg" alt="close" @click="$emit('close')" />
      </div>
      <div class="modal-content-all">
        <p>Оберіть партнера</p>
        <div class="appoint-partner">
          <form class="name-update-form" @submit.prevent="handleSubmit">
            <div class="forms-name-add">
              <div class="container-input">
                <label for="CoupleClient">Оберіть партнера клієнта</label>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: "ModalAppointPartner",
  props: {
    clientId: Number,
    showModal: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const client = ref({});
    const availablePartners = ref([]);
    const selectedPartnerId = ref('');


    // Функція отримання поточного клієнта і його партнера
    const fetchClientInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        return;
      }

      try {
        const response = await apiService.getClientById(token, props.clientId);
        client.value = response.data;

        // Якщо клієнт має `partner_id`, встановлюємо його як вибраного партнера
        if (client.value.partner_id) {
          selectedPartnerId.value = client.value.partner_id;
        }

        fetchClients(); // Завантажуємо всіх доступних клієнтів для вибору партнера
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };


    // Функція отримання всіх клієнтів для вибору партнера
    const fetchClients = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        return;
      }

      try {
        const response = await apiService.getClients(token);
        availablePartners.value = response.data.data.filter(c => c.id !== props.clientId); // Виключаємо самого себе зі списку
      } catch (error) {
        console.error('Error fetching clients:', error);
        M.toast({ html: 'Помилка при завантаженні клієнтів' });
      }
    };

    const handleSubmit = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        return;
      }

      try {
        await apiService.updateClientСoupleData(props.clientId, { partner_id:selectedPartnerId.value }, token);
        M.toast({ html: 'Партнер призначений успішно' });
        // selectedPartnerId.value = '';
        emit('close'); // Закриття модального вікна після успішного збереження
      } catch (error) {
        console.error('Error updating client couple data:', error);
        M.toast({ html: 'Помилка при призначенні партнера' });
      }
    };


    onMounted(() => {
      fetchClients();
      fetchClientInfo();
    });

    return {
      client,
      availablePartners,
      selectedPartnerId,
      handleSubmit
    };
  }
};
</script>

<style>
.appoint-partner form .forms-name-add .container-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-appoint-partner {
  width: 640px !important;
}
.appoint-partner form .submit-coupe-partner {
  display: flex;
  justify-content: flex-end;
  width: auto;
}
</style>
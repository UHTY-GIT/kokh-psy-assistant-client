<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати клієнта
      </button>
      <button class="btn-refresh">
        <img src="@/assets/icons/refresh.svg" alt="Оновити">
      </button>
    </div>
    <div class="search">
      <input type="text" class="search-input" placeholder="Пошук">
    </div>

    <div class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Ім'я</th>
          <th>Номер телефону</th>
          <th>Інформована згода</th>
          <th>Первинне опитування</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="client in clients" :key="client.telegram_id">
<!--          Якщо змінити ключ на client.id тоді зміниться порядок клієнтів-->
          <td>{{ client.name }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.was_agreed ? 'так' : 'ні' }}</td>
          <td>{{ client.primary_poll_complete ? 'так' : 'ні' }}</td>
          <td class="all-butt-management">
            <button class="btn-action" data-tooltip="Надіслати повідомлення" @click="openModal(client.id, client.telegram_id, client.was_agreed, client.primary_poll_complete)">
              <img src="@/assets/icons/send-template-white.svg" alt="Надіслати повідомлення">
            </button>
            <button class="btn-action" data-tooltip="Переглянути">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action" data-tooltip="Редагувати">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action" data-tooltip="Видалити">
              <img src="@/assets/icons/trash-client.svg" alt="Видалити">
            </button>
          </td>

        </tr>
        </tbody>
      </table>
    </div>

    <div class="client-footer">
      <div class="pagination-info">
        Сторінка 1 з 10
      </div>
      <div class="pagination-controls">
        <button class="btn-pagination before">назад</button>
        <button class="btn-pagination after">далі</button>
      </div>
    </div>
  </section>
<!--  Модальне вікно-->
  <modal-templates
      v-if="showModal"
      :templates="templates"
      :showModal="showModal"
      :selectedClientId="selectedClientId"
      :selectedTelegramClientId="selectedTelegramClientId"
      :clientWasAgreedConsent="clientWasAgreedConsent"
      :clientPrimaryPollComplete="clientPrimaryPollComplete"
      @close="showModal = false"
  />
</template>
<script>
import apiService from '@/services/apiService';
import M from 'materialize-css';
import { ref } from 'vue';
import ModalTemplates from "@/components/modal/ModalTemplates.vue";
import {useRouter} from "vue-router";
export default {
  name: "AllClient",
  components: {
    ModalTemplates
  },
  setup() {
    const showModal = ref(false);
    const clients = ref([]);
    const templates = ref([]);
    const selectedClientId = ref(null); // зберігання ID вибраного клієнта
    const selectedTelegramClientId = ref(null); // зберігання ID телеграм вибраного клієнта
    const clientWasAgreedConsent = ref(false);
    const clientPrimaryPollComplete = ref(false);
    const router = useRouter();

    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          const response = await apiService.getClients(token);
          if (response && response.data && response.data.data) {
            clients.value = response.data.data; // Зберігання даних клієнтів у масив
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }
    };

    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          const response = await apiService.getForms(token);
          if (response && response.data && response.data.data) {
            templates.value = response.data.data; // Зберігання даних форм у масив
          }
        }
      } catch (error) {
        // console.error('Error fetching clients:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }
    };

    const openModal = (clientId, TelegramClientId, clientConsent, clientPrimaryPoll) => {
      showModal.value = true;
      selectedClientId.value = clientId;
      //console.log(`ID клієнта для відправки ${selectedClientId.value}`);
      selectedTelegramClientId.value = TelegramClientId;
      //console.log(`Телеграм ID клієнта для відправки ${selectedTelegramClientId.value}`);
      clientWasAgreedConsent.value = clientConsent;
      //console.log(`Клієнт прийняв інформовану згоду ${clientWasAgreedConsent.value}`);
      clientPrimaryPollComplete.value = clientPrimaryPoll;
      //console.log(`Клієнт пройшов первинне опитування ${clientPrimaryPollComplete.value}`);
      fetchTemplates();
    };

    // Перенесіть логіку з mounted сюди, якщо потрібно запустити щось при створенні компонента
    fetchClients();

    return {
      clients,
      showModal,
      openModal,
      templates,
      selectedClientId,
      selectedTelegramClientId,
      clientWasAgreedConsent,
      clientPrimaryPollComplete
    }
  }
};
</script>
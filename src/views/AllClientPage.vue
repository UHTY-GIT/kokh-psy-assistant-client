<!--src/views/AllClientPage.vue-->
<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати клієнта
      </button>
      <div class="group-button-all-client">
        <button class="btn-refresh">
          <img src="@/assets/icons/refresh.svg" alt="Оновити">
        </button>
        <button class="btn-statistic" @click="OpenStatistic">
          <img src="@/assets/icons/chart-histogram.png" alt="Статистика">
        </button>
        <button class="btn-archive" @click="OpenArchive">
          <img src="@/assets/icons/archive-view.png" alt="Архів клієнтів">
        </button>
      </div>
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
        <tr v-for="client in paginatedClients" :key="client.telegram_id">
<!--          Якщо змінити ключ на client.id тоді зміниться порядок клієнтів-->
          <td>{{ client.name }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.was_agreed ? 'так' : 'ні' }}</td>
          <td>{{ client.primary_poll_complete ? 'так' : 'ні' }}</td>
          <td class="all-butt-management">
            <button class="btn-action" data-tooltip="Надіслати повідомлення" @click="openModal(client.id, client.telegram_id, client.was_agreed, client.primary_poll_complete)">
              <img src="@/assets/icons/send-template-white.svg" alt="Надіслати повідомлення">
            </button>
            <button class="btn-action" data-tooltip="Переглянути" @click="viewClientInfo(client.id)">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action" data-tooltip="Редагувати">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action" data-tooltip="Архівувати" @click="AddToArchive(client.id)">
              <img src="@/assets/icons/archive-personal.png" alt="Архівувати">
            </button>
          </td>

        </tr>
        </tbody>
      </table>
    </div>

    <div class="client-footer">
      <div class="pagination-info">
        Сторінка {{ currentPage }} з {{ totalPages }}
      </div>
      <div class="pagination-controls">
        <button class="btn-pagination before" @click="changePage(-1)" :disabled="currentPage === 1">назад</button>
        <button class="btn-pagination after" @click="changePage(1)" :disabled="currentPage === totalPages">далі</button>
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
import { ref, computed } from 'vue';
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

    // Пагінація
    const currentPage = ref(1);
    const itemsPerPage = 10; // Кількість клієнтів на сторінку
    const totalPages = computed(() => Math.ceil(clients.value.length / itemsPerPage));

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

    const viewClientInfo = (clientId) => {
      router.push({ name: 'ClientInformation', params: { id: clientId } });
    };

    const OpenArchive = () => {
      router.push({name: 'AllClientsArchivePage'})
    };

    const OpenStatistic = () => {
      router.push({name: 'AllStatisticPage'})
    };

    const AddToArchive = async (clientId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: 'Будь ласка, увійдіть у систему' });
          router.push({ name: 'login' });
          return;
        }

        await apiService.AddArchiveClient(token, clientId);
        M.toast({ html: 'Клієнта успішно архівовано' });
        fetchClients();  // Оновлення списку після архівації

      } catch (error) {
        console.error('Error archiving client:', error);
        M.toast({ html: 'Помилка при архівації клієнта' });
      }
    }


    //Пагінація сторінок
    const paginatedClients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return clients.value.slice(start, end);
    });

    const changePage = (step) => {
      if (currentPage.value + step >= 1 && currentPage.value + step <= totalPages.value) {
        currentPage.value += step;
      }
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
      clientPrimaryPollComplete,
      viewClientInfo,
      OpenArchive,
      AddToArchive,
      currentPage,
      totalPages,
      changePage,
      paginatedClients,
      OpenStatistic
    }
  }
};
</script>
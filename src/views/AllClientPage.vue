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
      <button class="btn-search" @click="handleSearch">
        <img src="@/assets/icons/search-icon.svg" alt="Пошук">
      </button>
      <input type="text" class="search-input" placeholder="Пошук" v-model="searchQuery" @keyup.enter="handleSearch">
    </div>

    <div v-if="isLoading" class="loader-wrapper">
      <Loader />
    </div>

    <div v-else class="client-list">
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
            <button class="btn-action" data-tooltip="Переглянути" @click="viewClientInfo(client.id)">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action" data-tooltip="Редагувати">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action" data-tooltip="Архівувати" @click="AddToArchive(client)">
              <img src="@/assets/icons/archive-personal.png" alt="Архівувати">
            </button>
          </td>

        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="client-footer">
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
  <modal-archive-client
      v-if="showArchiveModal"
      :showModal="showArchiveModal"
      :clientName="clientToArchive?.name"
      @close="showArchiveModal = false"
      @confirm="confirmArchive"
  />
</template>
<script>
import apiService from '@/services/apiService';
import M from 'materialize-css';
import { ref, watch } from 'vue';
import ModalTemplates from "@/components/modal/ModalTemplates.vue";
import ModalArchiveClient from "@/components/modal/ModalArchiveClient.vue";
import Loader from "@/components/app/Loader.vue";
import {useRouter, useRoute} from "vue-router";
export default {
  name: "AllClient",
  components: {
    ModalTemplates,
    ModalArchiveClient,
    Loader
  },
  setup() {
    const showModal = ref(false);
    const showArchiveModal = ref(false);
    const clients = ref([]);
    const templates = ref([]);
    const selectedClientId = ref(null); // зберігання ID вибраного клієнта
    const selectedTelegramClientId = ref(null); // зберігання ID телеграм вибраного клієнта
    const clientWasAgreedConsent = ref(false);
    const clientPrimaryPollComplete = ref(false);
    const router = useRouter();
    const route = useRoute();
    const isLoading = ref(false);

    // For Archive Modal
    const clientToArchive = ref(null);

    // Пагінація
    const currentPage = ref(1);
    const totalPages = ref(1);
    const itemsPerPage = 10;
    const searchQuery = ref('');


    const fetchClients = async () => {
      isLoading.value = true;
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          // currentPage.value, яка вже оновлена через watcher або ініціалізацію
          const params = {
            page: currentPage.value,
            per_page: itemsPerPage,
            search: searchQuery.value
          };
          
          
          const response = await apiService.getClientsPagination(token, params);
          
          if (response) {
             const clientList = response.data;
             
             if (clientList) {
                // Фільтруємо на клієнті
                clients.value = clientList.filter(
                    client => client.origin_type !== 'individual_supervision'
                );
             }

             if (response.pagy) {
                 totalPages.value = response.pagy.total_pages;
             }
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      } finally {
        isLoading.value = false;
      }
    };

    const handleSearch = () => {
        if (currentPage.value === 1) {
            fetchClients();
        } else {
            updatePage(1);
        }
    };
    
    // Функція оновлення сторінки
    const changePage = (step) => {
      const nextPage = currentPage.value + step;
      if (nextPage >= 1 && nextPage <= totalPages.value) {
        updatePage(nextPage);
      }
    };

    const updatePage = (page) => {
        // Оновлюємо URL, це тригерне watcher
        router.push({ query: { ...route.query, page: page } });
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

    const AddToArchive = (client) => {
      clientToArchive.value = client;
      showArchiveModal.value = true;
    }

    const confirmArchive = async () => {
      if (!clientToArchive.value) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: 'Будь ласка, увійдіть у систему' });
          router.push({ name: 'login' });
          return;
        }

        await apiService.AddArchiveClient(token, clientToArchive.value.id);
        M.toast({ html: 'Клієнта успішно архівовано' });
        fetchClients();  // Оновлення списку після архівації
        showArchiveModal.value = false;
        clientToArchive.value = null;

      } catch (error) {
        console.error('Error archiving client:', error);
        M.toast({ html: 'Помилка при архівації клієнта' });
      }
    }


    // Ініціалізація
    const initialize = () => {
        const pageFromUrl = parseInt(route.query.page) || 1;
        currentPage.value = pageFromUrl;
        fetchClients();
    }
    initialize();
    
    // Слідкуємо за зміною сторінки в URL
    
    watch(() => route.query.page, (newPage) => {
       const page = parseInt(newPage) || 1;
       if (page !== currentPage.value) {
           currentPage.value = page;
           fetchClients();
       } else if (page === 1 && !newPage) {
           // Handle case where query param is removed (implicit page 1)
           // If currentPage is already 1, nothing to do, but fetchClients called by updatePage if via button
           // But here we rely on watcher
           fetchClients();
       } else {
           // If parameters match, we still might want to fetch if triggered by other means? 
           // In our flow, updatePage changes URL -> triggers Watcher -> fetches.
           // So yes, fetch.
           fetchClients();
       }
    });

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
      OpenStatistic,
      isLoading,
      showArchiveModal,
      clientToArchive,
      confirmArchive,
      searchQuery,
      handleSearch,
      fetchClients
    }
  }
};
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
</style>
<!--src/view/supervisor/SuperviseesPage.vue-->
<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати супервізанта
      </button>
      <div class="group-button-all-client">
        <button class="btn-refresh" @click="fetchClients">
          <img src="../../assets/icons/refresh.svg" alt="Оновити">
        </button>
        <button class="btn-statistic" @click="OpenStatistic">
          <img src="../../assets/icons/chart-histogram.png" alt="Статистика">
        </button>
        <button class="btn-archive" @click="OpenArchive">
          <img src="../../assets/icons/archive-view.png" alt="Архів клієнтів">
        </button>
      </div>
    </div>
    <div class="search">
      <button class="btn-search" @click="handleSearch">
        <img src="@/assets/icons/search-icon.svg" alt="Пошук">
      </button>
      <input type="text" class="search-input" placeholder="Пошук" v-model="searchQuery" @keyup.enter="handleSearch">
    </div>

    <div v-if="loading" class="loader-wrapper">
      <Loader />
    </div>

    <div v-else class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Ім'я</th>
          <th>Номер телефону</th>
          <th>Опис кейсу</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="client in clients" :key="client.telegram_id">
          <td>{{ client.name }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.case_description_can_be_shown ? 'так' : 'ні' }}</td>
          <td class="all-butt-management">
            <button class="btn-action" data-tooltip="Надіслати повідомлення" @click="openModal(client.id, client.telegram_id, client.case_description_can_be_shown, client.origin_type)">
              <img src="../../assets/icons/send-template-white.svg" alt="Надіслати повідомлення">
            </button>
            <button class="btn-action" data-tooltip="Переглянути" @click="viewClientInfo(client.id)">
              <img src="../../assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action" data-tooltip="Редагувати">
              <img src="../../assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action" data-tooltip="Архівувати" @click="AddToArchive(client)">
              <img src="../../assets/icons/archive-personal.png" alt="Архівувати">
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
      :clientCaseDescriptionComplete="clientCaseDescriptionComplete"
      :clientOriginType="clientOriginType"
      :caseDescriptionCanBeShown="caseDescriptionCanBeShown"
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
import Loader from "@/components/app/Loader.vue";
import {useRouter, useRoute} from "vue-router";
import ModalArchiveClient from "@/components/modal/ModalArchiveClient.vue";

export default {
  name: "SuperviseesPage",
  components: {
    ModalArchiveClient,
    ModalTemplates,
    Loader
  },
  setup() {
    const showModal = ref(false);
    const clients = ref([]);
    const templates = ref([]);
    const selectedClientId = ref(null);
    const selectedTelegramClientId = ref(null);
    const clientCaseDescriptionComplete = ref(false);
    const clientOriginType = ref(null);
    const caseDescriptionCanBeShown = ref(false);
    const loading = ref(false);
    const router = useRouter();
    const route = useRoute();
    const showArchiveModal = ref(false);

    // For Archive Modal
    const clientToArchive = ref(null);

    // Пагінація та Пошук
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const totalPages = ref(1);
    const searchQuery = ref('');

    const fetchClients = async () => {
      loading.value = true;
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const params = {
            page: currentPage.value,
            per_page: itemsPerPage,
            search: searchQuery.value,
            origin_type: 'individual_supervision' // Фільтрація по типу на сервері
          };

          const response = await apiService.getClientsPagination(token, params);
          
          if (response) {
            const clientList = response.data;
             if (clientList) {
                clients.value = clientList; 
             }

             if (response.pagy) {
                 totalPages.value = response.pagy.total_pages;
             }
          }
        }
      } catch (error) {
        console.error('Error fetching supervisees:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      } finally {
        loading.value = false;
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
        const token = localStorage.getItem('token');
        if (token) {
          const response = await apiService.getForms(token);
          if (response && response.data && response.data.data) {
            templates.value = response.data.data;
          }
        }
      } catch (error) {
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }
    };

    const openModal = (clientId, TelegramClientId, caseDescription, originType) => {
      showModal.value = true;
      selectedClientId.value = clientId;
      selectedTelegramClientId.value = TelegramClientId;
      clientCaseDescriptionComplete.value = caseDescription;
      clientOriginType.value = originType;
      caseDescriptionCanBeShown.value = caseDescription;
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
            fetchClients();
       } else {
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
      clientCaseDescriptionComplete,
      clientOriginType,
      caseDescriptionCanBeShown,
      viewClientInfo,
      OpenArchive,
      AddToArchive,
      currentPage,
      totalPages,
      changePage,
      OpenStatistic,
      loading,
      fetchClients,
      showArchiveModal,
      clientToArchive,
      confirmArchive,
      searchQuery,
      handleSearch
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

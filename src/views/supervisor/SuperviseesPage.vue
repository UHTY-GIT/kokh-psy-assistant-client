<!--src/view/supervisor/SuperviseesPage.vue-->
<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати супервізанта
      </button>
      <div class="group-button-all-client">
        <button class="btn-refresh" @click="fetchClients">
          <IconRefresh class="btn-icon" />
        </button>
        <button class="btn-statistic" @click="OpenStatistic">
          <IconChartBar class="btn-icon" />
        </button>
        <button class="btn-archive" @click="OpenArchive">
          <IconArchive class="btn-icon" />
        </button>
      </div>
    </div>
    <div class="search">
      <button class="btn-search" @click="handleSearch">
        <IconSearch class="btn-icon" />
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
          <td data-label="Ім'я">{{ client.name }}</td>
          <td data-label="Номер телефону">{{ client.phone }}</td>
          <td data-label="Опис кейсу">{{ client.case_description_can_be_shown ? 'так' : 'ні' }}</td>
          <td class="all-butt-management">
            <button class="btn-action" data-tooltip="Надіслати повідомлення" @click="openModal(client.id, client.telegram_id, client.case_description_can_be_shown, client.origin_type)">
              <IconSend />
            </button>
            <button class="btn-action" data-tooltip="Переглянути" @click="viewClientInfo(client.id)">
              <IconEye />
            </button>
            <button class="btn-action" data-tooltip="Редагувати">
              <IconPencil />
            </button>
            <button class="btn-action" data-tooltip="Архівувати" @click="AddToArchive(client)">
              <IconArchiveIn />
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
            search: searchFromUrl(),
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

    // Сторінка й пошук живуть в адресі (?page=2&search=Олена): після перезавантаження,
    // «Назад» з картки чи повторного входу відкривається той самий список
    const ownRoute = route.name;
    const searchFromUrl = () => (typeof route.query.search === 'string' ? route.query.search : '');

    const updateUrl = (page, search) => {
        const query = { ...route.query };
        if (page > 1) query.page = String(page);
        else delete query.page;
        if (search) query.search = search;
        else delete query.search;
        // така адреса вже відкрита (той самий пошук ще раз) — просто оновлюємо список
        if (query.page === route.query.page && query.search === route.query.search) fetchClients();
        else router.push({ query });
    };

    const handleSearch = () => {
        updateUrl(1, searchQuery.value.trim());
    };

    // Функція оновлення сторінки
    const changePage = (step) => {
      const nextPage = currentPage.value + step;
      if (nextPage >= 1 && nextPage <= totalPages.value) {
        updateUrl(nextPage, searchFromUrl());
      }
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

    // Ініціалізація: сторінка й пошук — з адреси
    const readUrl = () => {
        const page = Number.parseInt(route.query.page, 10);
        currentPage.value = page > 1 ? page : 1;
        searchQuery.value = searchFromUrl();
    };
    readUrl();
    fetchClients();

    // Адреса змінилась (кнопки сторінок, пошук, «Назад» у браузері) — показуємо відповідний список.
    // Під час переходу на іншу сторінку ?page і ?search зникають — тоді список не чіпаємо.
    watch([() => route.query.page, () => route.query.search], () => {
        if (route.name !== ownRoute) return;
        readUrl();
        fetchClients();
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

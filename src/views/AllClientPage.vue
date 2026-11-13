<!--src/views/AllClientPage.vue-->
<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати клієнта
      </button>
      <div class="group-button-all-client">
        <button class="btn-refresh">
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
          <td data-label="Ім'я">{{ client.name }}</td>
          <td data-label="Номер телефону">{{ client.phone }}</td>
          <td data-label="Інформована згода">{{ client.was_agreed ? 'так' : 'ні' }}</td>
          <td data-label="Первинне опитування">{{ client.primary_poll_complete ? 'так' : 'ні' }}</td>
          <td class="all-butt-management">
            <button class="btn-action" data-tooltip="Надіслати повідомлення" @click="openModal(client.id, client.telegram_id, client.was_agreed, client.primary_poll_complete)">
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
            search: searchFromUrl()
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
<!--src/views/MySessionPage.vue-->
<template>
  <section class="client-section">
    <div class="search margin-search">
      <input type="text" class="search-input" placeholder="Пошук">
    </div>

    <div v-if="isLoading" class="loader-wrapper">
      <Loader />
    </div>

    <div v-else class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Номер сесії</th>
          <th>Час початку сесії</th>
          <th>Дата сесії</th>
          <th>Ім'я клієнта</th>
<!--          <th>Дії</th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="consultation in paginatedConsultations" :key="consultation.id">
          <td>{{ consultation.number }}</td>
          <td>{{ formatTime(consultation.consultation_date) }}</td>
          <td>{{ formatDate(consultation.consultation_date) }}</td>
          <td @click="viewClientInfo(consultation.client.id)" class="client-name-link">
            {{ consultation.client.first_name }}
          </td>
          <td class="all-butt-management">
            <button class="btn-action" :data-tooltip="getStatusTooltip(consultation.status)">
              <img :src="getStatusIcon(consultation.status)" alt="Статус">
            </button>
            <button class="btn-action" data-tooltip="Переглянути дані сесії" @click="openViewSession(consultation.id, consultation.status)">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button
                class="btn-action"
                data-tooltip="Видалити сесію"
                @click="openDeleteSessionModal(consultation)"
            >
              <img src="@/assets/icons/trash-client.svg" alt="Видалити сесію">
            </button>
            <button
                class="btn-action"
                data-tooltip="Перейти до сесії"
                @click="openModal(consultation)"
                :disabled="consultation.status === 'done'"
            >
              <img src="@/assets/icons/share.svg" alt="Почати сесію">
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

  <!-- Модальне вікно для початку сесії -->
  <ModalStartSession
      v-if="showModal"
      :showModal="showModal"
      :consultation="selectedConsultation"
      @close="showModal = false"
      @confirm="startSession"
  />

  <!-- Модальне вікно для видалення сесії -->
  <ModalDeleteSession
      v-if="showDeleteModal"
      :showModal="showDeleteModal"
      :clientName="sessionToDelete?.clientName"
      :sessionTitle="sessionToDelete?.title"
      :sessionId="sessionToDelete?.id"
      @close="showDeleteModal = false"
      @confirm="confirmDeleteSession"
  />
</template>

<script>
import {ref, onMounted, computed} from 'vue';
import apiService from "@/services/apiService";
import { useRouter } from 'vue-router';
import M from "materialize-css";
import ModalStartSession from "@/components/modal/ModalStartSession.vue";
import Loader from "@/components/app/Loader.vue";
import ModalDeleteSession from "@/components/modal/ModalDeleteSession.vue";

export default {
  name: "mySession",
  components: {
    ModalStartSession,
    Loader,
    ModalDeleteSession
  },
  setup() {
    const consultations = ref([]);
    const showModal = ref(false);
    const selectedConsultation = ref(null);
    const router = useRouter();
    const isLoading = ref(false);

    // Пагінація
    const currentPage = ref(1);
    const itemsPerPage = 10; // Кількість сесій на сторінку
    const totalPages = computed(() => Math.ceil(consultations.value.length / itemsPerPage));

    const fetchConsultations = async () => {
      isLoading.value = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({html: 'Будь ласка, увійдіть у систему'});
          return;
        }
        const response = await apiService.getConsultations(token);
        consultations.value = response.data;
      } catch (error) {
        console.error('Error fetching consultations:', error);
        M.toast({html: 'Помилка завантаження консультацій'});
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('uk-UA', {year: 'numeric', month: '2-digit', day: '2-digit'});
    };

    const formatTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});
    };

    const openModal = (consultation) => {
      selectedConsultation.value = consultation;
      showModal.value = true;
    };

    const startSession = (consultation) => {
      showModal.value = false;

      // об'єкт з необхідними параметрами
      const queryParams = {
        clientId: consultation.client.id,
        clientName: consultation.client.first_name,
        TelegramId: consultation.client.telegram_id,
        customFormId: consultation.custom_form.id,
        customFormTitle: consultation.custom_form.title,
        sessionNumber: consultation.number,
        IDconsultation: consultation.id,
        dateConsultation: consultation.consultation_date
      };

      // Якщо є партнер і його Telegram ID, додаємо до параметрів
      if (consultation.partner && consultation.partner.telegram_id) {
        queryParams.PartnerTelegramId = consultation.partner.telegram_id;
      }

      router.push({
        name: 'ActiveSession',
        query: queryParams
      });
    };

    const openViewSession = (id, status) => {
      if (status !== 'done') {
        M.toast({ html: 'Не можна переглянути сесію яка не була завершена' });
        return;
      }
      router.push({
        name: 'ViewOneSession',
        params: { id }
      });
    };

    const viewClientInfo = (clientId) => {
      router.push({
        name: 'ClientInformation',
        params: { id: clientId }
      });
    };

    const showDeleteModal = ref(false);
    const sessionToDelete = ref(null);

    const openDeleteSessionModal = (consultation) => {
      sessionToDelete.value = {
        id: consultation.id,
        clientName: consultation.client.first_name,
        title: consultation.title
      };
      showDeleteModal.value = true;
    };

    const confirmDeleteSession = async (id) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({html: 'Будь ласка, увійдіть у систему'});
          return;
        }
        const response = await apiService.deleteClientConsultation(token, id);
        if (response.data === true) {
          M.toast({html: 'Сесію успішно видалено'});
          fetchConsultations(); // Оновлюємо список сесій
        } else {
          M.toast({html: 'Видалення не вдалося. Будь ласка, спробуйте знову'});
        }
      } catch (error) {
        M.toast({html: 'Не вдалося видалити сесію'});
        console.error('Error deleting session:', error);
      } finally {
        showDeleteModal.value = false;
        sessionToDelete.value = null;
      }
    };

    // Функція для зміни іконки в залежності від статусу сесії
    const getStatusIcon = (status) => {
      switch (status) {
        case "done":
          return require('@/assets/icons/status-green.svg');
        case "waiting_for_start":
          return require('@/assets/icons/status.svg');
        case "start_now":
          return require('@/assets/icons/status-yellow.svg');
        default:
          return require('@/assets/icons/status.svg'); // Стандартна іконка за замовчуванням
      }
    };

    // Функція для динамічного тексту data-tooltip
    const getStatusTooltip = (status) => {
      switch (status) {
        case "done":
          return "Статус - завершена";
        case "waiting_for_start":
          return "Статус - очікує початку";
        case "start_now":
          return "Статус - розпочата";
        default:
          return "Статус - очікує початку";
      }
    };

    //Пагінація
    const paginatedConsultations = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return consultations.value.slice(start, end);
    });

    const changePage = (step) => {
      if (currentPage.value + step >= 1 && currentPage.value + step <= totalPages.value) {
        currentPage.value += step;
      }
    };

    onMounted(fetchConsultations);

    return {
      consultations,
      formatDate,
      formatTime,
      openModal,
      startSession,
      openViewSession,
      viewClientInfo,
      showModal,
      selectedConsultation,
      getStatusIcon,
      getStatusTooltip,
      openDeleteSessionModal,
      confirmDeleteSession,
      showDeleteModal,
      sessionToDelete,
      currentPage,
      totalPages,
      changePage,
      paginatedConsultations,
      isLoading
    };
  }
}
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.client-name-link {
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.client-name-link:hover {
  color: #181e21;
}
</style>

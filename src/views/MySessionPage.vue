<!--src/views/MySessionPage.vue-->
<template>
  <section class="client-section">
    <div class="search margin-search">
      <input type="text" class="search-input" placeholder="Пошук">
    </div>

    <div class="client-list">
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
        <tr v-for="consultation in consultations" :key="consultation.id">
          <td>{{ consultation.number }}</td>
          <td>{{ formatTime(consultation.consultation_date) }}</td>
          <td>{{ formatDate(consultation.consultation_date) }}</td>
          <td>{{ consultation.client.first_name }}</td>
          <td class="all-butt-management">
            <button class="btn-action" :data-tooltip="getStatusTooltip(consultation.status)">
              <img :src="getStatusIcon(consultation.status)" alt="Статус">
            </button>
            <button class="btn-action" data-tooltip="Переглянути дані сесії" @click="openViewSession(consultation.id)">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button
                class="btn-action"
                data-tooltip="Видалити сесію"
                @click="deleteClientSession(consultation.id)"
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

  <!-- Модальне вікно для початку сесії -->
  <ModalStartSession
      v-if="showModal"
      :showModal="showModal"
      :consultation="selectedConsultation"
      @close="showModal = false"
      @confirm="startSession"
  />
</template>

<script>
import { ref, onMounted } from 'vue';
import apiService from "@/services/apiService";
import { useRouter } from 'vue-router';
import M from "materialize-css";
import ModalStartSession from "@/components/modal/ModalStartSession.vue";

export default {
  name: "mySession",
  components: {
    ModalStartSession
  },
  setup() {
    const consultations = ref([]);
    const showModal = ref(false);
    const selectedConsultation = ref(null);
    const router = useRouter();

    const fetchConsultations = async () => {
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
      router.push({
        name: 'ActiveSession',
        query: {
          clientId: consultation.client.id,
          clientName: consultation.client.first_name,
          TelegramId: consultation.client.telegram_id,
          customFormId: consultation.custom_form.id,
          customFormTitle: consultation.custom_form.title,
          sessionNumber: consultation.number,
          IDconsultation: consultation.id,
          dateConsultation: consultation.consultation_date
        }
      });
    };

    const openViewSession = (id) => {
      router.push({
        name: 'ViewOneSession',
        params: { id }
      });
    };

    const deleteClientSession = async (id) => {
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
      }
    }

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

    onMounted(fetchConsultations);

    return {
      consultations,
      formatDate,
      formatTime,
      openModal,
      startSession,
      openViewSession,
      showModal,
      selectedConsultation,
      getStatusIcon,
      getStatusTooltip,
      deleteClientSession
    };
  }
}
</script>

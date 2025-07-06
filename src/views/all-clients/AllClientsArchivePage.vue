<!--src/views/all-clients/AllClientArchivePage.vue-->
<template>
  <section class="client-section">
    <div>
      <div class="profile_tittle title-archive">
        <p>
          Архів клієнтів
        </p>
      </div>
<!--      <hr class="hr_profile">-->
    </div>
    <div>
      <div class="client-list">
        <div v-if="ArchiveClients.length === 0" class="non-archive-client">
          <p>Немає заархівованих клієнтів</p>
        </div>
        <table v-else class="table">
          <thead>
          <tr>
            <th>Ім'я</th>
            <th>Номер телефону</th>
<!--            <th>Інформована згода</th>-->
<!--            <th>Первинне опитування</th>-->
          </tr>
          </thead>
          <tbody>
          <tr v-for="client in paginatedClients" :key="client.telegram_id">
            <!--          Якщо змінити ключ на client.id тоді зміниться порядок клієнтів-->
            <td>{{ client.first_name }}</td>
            <td>{{ client.phone }}</td>
<!--            <td>{{ client.was_agreed ? 'так' : 'ні' }}</td>-->
<!--            <td>{{ client.primary_poll_complete ? 'так' : 'ні' }}</td>-->
            <td class="all-butt-management">
              <button class="btn-action" data-tooltip="Переглянути" @click="viewClientInfo(client.id)">
                <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
              </button>
              <button class="btn-action" data-tooltip="Розархівувати" @click="RemoveFromTheArchive(client.id)">
                <img src="@/assets/icons/archive-personal.png" alt="Розархівувати">
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
    </div>
  </section>
</template>
<script>
import apiService from "@/services/apiService";
import M from "materialize-css";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "AllClientsArchivePage",
  setup() {
    const ArchiveClients = ref([]);
    const router = useRouter();

    // Пагінація
    const currentPage = ref(1);
    const itemsPerPage = 10; // Кількість клієнтів на сторінку
    const totalPages = computed(() => Math.ceil(ArchiveClients.value.length / itemsPerPage));

    const fetchArchiveClients = async () => {
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          const response = await apiService.getArchiveClients(token);
          if (response && response.data && response.data.data) {
            ArchiveClients.value = response.data.data; // Зберігання даних клієнтів у масив
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }
    };

    const viewClientInfo = (clientId) => {
      router.push({ name: 'ClientInformation', params: { id: clientId } });
    };

    const RemoveFromTheArchive = async (clientId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: 'Будь ласка, увійдіть у систему' });
          router.push({ name: 'login' });
          return;
        }

        await apiService.RestoreArchiveClient(token, clientId);
        M.toast({ html: 'Клієнта успішно розархівовано' });
        fetchArchiveClients();  // Оновлення списку після розархівації

      } catch (error) {
        console.error('Error archiving client:', error);
        M.toast({ html: 'Помилка при розархівації клієнта' });
      }
    }

    const paginatedClients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return ArchiveClients.value.slice(start, end);
    });

    const changePage = (step) => {
      if (currentPage.value + step >= 1 && currentPage.value + step <= totalPages.value) {
        currentPage.value += step;
      }
    };

    onMounted(fetchArchiveClients); // Виклик fetchArchiveClients при завантаженні сторінки

    return {
      ArchiveClients,
      viewClientInfo,
      RemoveFromTheArchive,
      paginatedClients,
      currentPage,
      totalPages,
      changePage,
    };
  }
}
</script>
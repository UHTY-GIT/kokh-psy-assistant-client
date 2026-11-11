<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Запис
      </button>
      <button class="btn-refresh">
        <IconRefresh class="btn-icon" />
      </button>
    </div>

    <div v-if="isLoading" class="loader-wrapper">
      <Loader />
    </div>

    <div v-else class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Тип підтримки</th>
          <th>Дата проведення</th>
<!--          <th>Дії</th>-->
        </tr>
        </thead>
        <tbody>
        <!-- Приклад рядка таблиці -->
        <tr>
          <td data-label="Тип підтримки">Супервізія</td>
          <td data-label="Дата проведення">18.02.2024</td>
          <td class="all-butt-management">
            <button class="btn-action">
              <IconEye />
            </button>
            <button class="btn-action">
              <IconPencil />
            </button>
            <button class="btn-action">
              <IconTrash />
            </button>
          </td>
        </tr>
        <tr>
          <td data-label="Тип підтримки">Інтервізія</td>
          <td data-label="Дата проведення">01.03.2024</td>
          <td class="all-butt-management">
            <button class="btn-action">
              <IconEye />
            </button>
            <button class="btn-action">
              <IconPencil />
            </button>
            <button class="btn-action">
              <IconTrash />
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="client-footer">
      <div class="pagination-info">
        Сторінка 1 з 10
      </div>
      <div class="pagination-controls">
        <button class="btn-pagination before">назад</button>
        <button class="btn-pagination after">далі</button>
      </div>
    </div>
  </section>
</template>
<script>
import Loader from "@/components/app/Loader.vue";
import { ref, onMounted } from 'vue';

export default {
  name: "SupportPage",
  components: {
    Loader
  },
  setup() {
    const isLoading = ref(false);

    // Mock fetch or placeholder for when logic is added
    const fetchData = async () => {
      isLoading.value = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
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
</style>
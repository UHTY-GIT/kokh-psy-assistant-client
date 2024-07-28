<!--src/views/BankInformationPage.vue-->
<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client" @click="goToAddTemplate">
        Додати шаблон
      </button>
      <button class="btn-refresh" @click="fetchAllForms">
        <img src="@/assets/icons/refresh.svg" alt="Оновити">
      </button>
    </div>
    <div v-if="allforms.length === 0" class="no-template-message">
      <p>
        Тут відображатимуться збережені шаблони.<br>
        Додайте свій перший шаблон форми щоб побачити його тут.
      </p>
    </div>
    <div v-else>
      <div class="client-list">
        <table class="table">
          <thead>
          <tr>
            <th>Назва шаблону</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="form in allforms" :key="form.id">
            <td>{{ form.title }}</td>
            <td class="all-butt-management">
              <button class="btn-action" data-tooltip="Переглянути шаблон" @click="viewTemplate(form.id)">
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
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from "materialize-css";

export default {
  name: 'BankInformation',
  setup() {
    const router = useRouter();
    const allforms = ref([]);

    const fetchAllForms = async () => {
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          const response = await apiService.getForms(token);
          if (response && response.data && response.data.data) {
            allforms.value = response.data.data; // Зберігання даних форм у масив
          }
        }
      } catch (error) {
        M.toast({ html: `Увійдіть у систему` });
        router.push({ name: 'login' });
      }
    };

    const goToAddTemplate = () => {
      router.push({ name: 'AddTemplate' });
    };

    const viewTemplate = (templateId) => {
      router.push({ name: 'ViewsTemplatesBankInformationPage', params: { id: templateId } });
    };

    onMounted(() => {
      fetchAllForms();
    });

    return {
      allforms,
      goToAddTemplate,
      fetchAllForms,
      viewTemplate
    };
  }
};
</script>

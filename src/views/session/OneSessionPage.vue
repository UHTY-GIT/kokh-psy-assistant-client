<!-- src/views/OneSessionPage.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Сесія №{{ numberConsultation }} "{{ consultationTitle }}", клієнт {{ clientName }}
        </p>
        <div class="block-btn-view-session">
          <p>
            {{ formattedDate }}
          </p>
          <button class="btn-editing" @click="openEditSession">
            <img src="../../assets/icons/edit-form.svg" alt="Редагування полів форми">
          </button>
        </div>
      </div>
      <hr class="hr_profile">
    </div>
    <div v-for="(subGroups, categoryTitle) in categorizedFields" :key="categoryTitle">
      <div class="block_active_session">
        <div class="titte_field">
          <p>{{ categoryTitle }}</p>
        </div>
        
        <div v-for="(fields, subCategoryTitle) in subGroups" :key="subCategoryTitle">
          <div v-if="subCategoryTitle !== 'default'" class="sub-category-title">
             <p>{{ subCategoryTitle }}</p>
          </div>
          
          <div v-for="field in fields" :key="field.id" class="template-container-for-view">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p style="margin: 0;">{{ field.form_item.field_name }}</p>

                <div v-if="field.form_item.help_text" class="help-icon-wrapper">
                  <img src="@/assets/icons/circle_help.svg" alt="Info" class="help-icon">
                  <div class="help-tooltip">
                    {{ field.form_item.help_text }}
                  </div>
                </div>
              </div>
              <div class="type-of-answers">
                <p>
                  {{ field.text_answer || '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from "materialize-css";

export default {
  name: 'ViewOneSession',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const consultationTitle = ref('');
    const clientName = ref('');
    const formItems = ref([]);
    const dateConsultation = ref();
    const numberConsultation = ref();
    const consultationId = ref(route.params.id);

    const fetchConsultation = async () => {
      const token = localStorage.getItem('token'); // отримання токена з локального сховища
      const id = route.params.id; // отримання id з параметрів маршруту

      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const response = await apiService.getOneConsultation(token, id);
        const data = response.data;
        consultationTitle.value = data.title;
        clientName.value = data.client.first_name;
        dateConsultation.value = data.consultation_date;
        numberConsultation.value = data.number;
        formItems.value = data.answers;
      } catch (err) {
        M.toast({ html: 'Помилка при перегляді даних сесії' });
        console.error('Error fetching consultation:', err);
      }
    };

    const categorizedFields = computed(() => {
      return formItems.value.reduce((acc, item) => {
        const mainCat = item.form_item.form_item_main_category_title || "Без категорії";
        // Якщо підкатегорія порожня, використовуємо 'default' для групування
        const childCat = item.form_item.form_item_child_category_title || "default";
        
        if (!acc[mainCat]) {
          acc[mainCat] = {};
        }
        
        if (!acc[mainCat][childCat]) {
          acc[mainCat][childCat] = [];
        }
        
        acc[mainCat][childCat].push(item);
        return acc;
      }, {});
    });

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', options);
    };

    const formattedDate = computed(() => {
      return dateConsultation.value ? formatDate(dateConsultation.value) : '';
    });

    const openEditSession = () => {
      router.push({
        name: 'EditOneSession',
        params: { id: consultationId.value }
      });
    };

    onMounted(fetchConsultation);

    return {
      consultationTitle,
      clientName,
      formItems,
      categorizedFields,
      numberConsultation,
      formattedDate,
      openEditSession,
    };
  },
};
</script>


<style>
.block_active_session .titte_field p {
  font-family: "Nunito";
  font-style: normal;
  font-weight: 700;
  font-size: 26px;
  color: #494B55;
  margin: 0;
}
</style>

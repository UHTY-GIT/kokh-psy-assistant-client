<!-- src/views/client/ViewCaseDescription.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Опис кейсу, клієнт {{ clientName }}
        </p>
        <div class="block-btn-view-session">
<!--          <p>-->
<!--            Востаннє відредаговано: {{ formattedDate }}-->
<!--          </p>-->
          <button class="btn-editing" @click="openEditSession">
            <img src="../../assets/icons/edit-form.svg" alt="Редагування полів форми">
          </button>
        </div>
      </div>
      <hr class="hr_profile">
    </div>

    <div v-if="loading" class="loader-wrapper">
      <Loader /> 
    </div>
    
    <div v-else-if="!hasData" class="empty-state">
      <p>Опис кейсу ще не заповнений супервізантом</p>
    </div>

    <div v-else>
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
      <div v-if="clientAssets.length > 0" class="block_active_session">
        <div class="titte_field">
          <p>Відеоматеріали</p>
        </div>

        <div v-for="(asset, index) in clientAssets" :key="asset.id || index" class="template-container-for-view">
          <div class="text-template-for-view">
            <div class="type-for-view">
              <p style="margin: 0;">{{ asset.title }}</p>
            </div>
            <div class="type-of-answers">
              <p>
                <a :href="asset.link" target="_blank">{{ asset.link }}</a>
              </p>
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
import Loader from "@/components/app/Loader.vue";

export default {
  name: 'ViewCaseDescription',
  components: {
    Loader
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientName = ref('');
    const formItems = ref([]);
    const clientId = ref(route.params.id);
    const loading = ref(false);
    const hasData = ref(false);
    const clientAssets = ref([]);

    const fetchCaseDescription = async () => {
      const token = localStorage.getItem('token');
      const id = route.params.id;

      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }
      
      loading.value = true;

      try {
        // Спочатку отримуємо ім'я клієнта
        const clientResponse = await apiService.getClientById(token, id);
        clientName.value = clientResponse.data.name;

        // Отримуємо опис кейсу
        const response = await apiService.getCaseDescription(token, id);
        
        if (response && response.data && response.data.answers.length > 0) {
             hasData.value = true;
             const answers = response.data.answers;
             const items = response.data.custom_form.form_items;
             
             // Create a map for faster lookup
             const itemsMap = {};
             if (items && Array.isArray(items)) {
                 items.forEach(i => itemsMap[i.id] = i);
             }
             
             // Merge
             formItems.value = answers.map(a => {
                 return {
                     ...a,
                     form_item: itemsMap[a.form_item_id] || {}
                 };
             });
        } else {
            hasData.value = false;
        }

        try {
            const assetsResponse = await apiService.getClientAssets(token, id);
            clientAssets.value = assetsResponse.data || []; 

            console.log(clientAssets.value);
            
            if (clientAssets.value.length > 0) {
                hasData.value = true;
            }
        } catch (assetErr) {
            console.error('Error fetching assets:', assetErr);
        }

      } catch (err) {
        console.error('Error fetching case description:', err);
         // Якщо 404 або просто немає даних - показуємо empty state
         hasData.value = false;
         if (err.response && err.response.status !== 404) {
             M.toast({ html: 'Помилка при перегляді опису кейсу' });
         }
      } finally {
        loading.value = false;
      }
    };

    const categorizedFields = computed(() => {
      return formItems.value.reduce((acc, item) => {
        const mainCat = item.form_item.form_item_main_category_title || "Без категорії";
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

    const openEditSession = () => {
      router.push({
        name: 'EditCaseDescription',
        params: { id: clientId.value }
      });
    };

    onMounted(fetchCaseDescription);

    return {
      clientName,
      categorizedFields,
      openEditSession,
      loading,
      hasData,
      clientAssets
    };
  },
}
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.empty-state {
    text-align: center;
    margin-top: 50px;
    color: #666;
    font: 600 18px / 1.2 "Nunito", system-ui, sans-serif;
}
</style>

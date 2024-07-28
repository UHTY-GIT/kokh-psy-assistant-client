<!-- src/views/ViewsTemplatesBankInformationPage.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Назва шаблону "{{ templateTitle }}"
        </p>
      </div>
      <hr class="hr_profile">
    </div>
    <div v-for="item in formItems" :key="item.id">
      <div class="template-container-for-view">
        <div class="text-template-for-view">
          <div class="type-for-view">
            <p>{{ item.field_name }}</p>
          </div>
          <div class="type-of-answers">
            <p>
              {{ getFieldTypeName(item.field_type) }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiService from '@/services/apiService';

export default {
  name: 'ViewsTemplatesBankInformationPage',
  setup() {
    const route = useRoute();
    const templateTitle = ref('');
    const formItems = ref([]);

    const fetchTemplate = async () => {
      try {
        const templateId = route.params.id;
        const response = await apiService.getCustomFormById(templateId);
        const data = response.data.data;
        templateTitle.value = data.title;
        formItems.value = data.form_items;
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    const getFieldTypeName = (fieldType) => {
      switch (fieldType) {
        case 'boolean':
          return 'Так/Ні';
        case 'text':
          return 'Довге текстове поле';
        case 'string':
          return 'Коротке текстове поле';
        case 'select_v2':
          return 'Випадаючий список';
        default:
          return fieldType;
      }
    };

    onMounted(fetchTemplate);

    return {
      templateTitle,
      formItems,
      getFieldTypeName
    };
  },
};
</script>
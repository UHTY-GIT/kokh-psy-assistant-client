<!-- src/views/client/EditCaseDescription.vue -->
<template>
  <div>
    <div class="profile_tittle">
      <p>Опис кейсу, супервізант {{ clientName }}, версія змін - {{ version }}</p>
    </div>
    <hr class="hr_profile">
    <div class="block_active_session">
      <div v-if="loading" class="loader-wrapper">
        <Loader />
      </div>
      <form v-else @submit.prevent="openModal">
        <div v-for="(subGroups, categoryTitle) in categorizedFields" :key="categoryTitle">
          <div class="titte_field">
            <p>{{ categoryTitle }}</p>
          </div>

          <div v-for="(fields, subCategoryTitle) in subGroups" :key="subCategoryTitle">
            <div v-if="subCategoryTitle !== 'default'" class="sub-category-title">
              <p>{{ subCategoryTitle }}</p>
            </div>

            <div class="block_input_field">
              <div v-for="field in fields" :key="field.id" class="forms-name-add active_session_fields">
                <div class="container-input">

                  <div class="container-label" style="display: flex; justify-content: space-between; align-items: center; gap: 14px;">
                    <div class="type-for-view">
                      <label :for="field.field_name" style="margin-bottom: 0;">{{ field.field_name }}</label>

                      <div v-if="field.help_text" class="help-icon-wrapper">
                        <img src="@/assets/icons/circle_help.svg" alt="Info" class="help-icon">
                        <div class="help-tooltip">
                          {{ field.help_text }}
                        </div>
                      </div>
                    </div>

                    <!-- Видалити поле -->
                    <div @click="openDeleteModal(field.id, field.field_name)" style="cursor: pointer; display: flex; align-items: center;">
                      <svg width="24" height="24" viewBox="0 0 34 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.3337 8.33317V6.99984C23.3337 5.133 23.3337 4.19957 22.9703 3.48654C22.6508 2.85933 22.1408 2.34939 21.5136 2.02982C20.8006 1.6665 19.8672 1.6665 18.0003 1.6665H15.3337C13.4668 1.6665 12.5334 1.6665 11.8204 2.02982C11.1932 2.34939 10.6832 2.85933 10.3636 3.48654C10.0003 4.19957 10.0003 5.133 10.0003 6.99984V8.33317M13.3337 17.4998V25.8332M20.0003 17.4998V25.8332M1.66699 8.33317H31.667M28.3337 8.33317V26.9998C28.3337 29.8001 28.3337 31.2002 27.7887 32.2698C27.3093 33.2106 26.5444 33.9755 25.6036 34.4549C24.5341 34.9998 23.1339 34.9998 20.3337 34.9998H13.0003C10.2001 34.9998 8.79993 34.9998 7.73037 34.4549C6.78956 33.9755 6.02466 33.2106 5.54529 32.2698C5.00033 31.2002 5.00033 29.8001 5.00033 26.9998V8.33317" stroke="#72A8BA" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  <textarea
                      v-if="field.field_type === 'text'"
                      :id="field.field_name"
                      v-model="field.text_answer"
                      :placeholder="'Введіть ' + field.field_name"
                  >
                  </textarea>
                  <input
                      v-else-if="field.field_type === 'string'"
                      type="text"
                      :id="field.field_name"
                      v-model="field.text_answer"
                      :placeholder="'Введіть ' + field.field_name"
                  >
                  <select v-else-if="field.field_type === 'select_v2'" :id="field.field_name" v-model="field.text_answer">
                    <option disabled value="">Оберіть варіант</option>
                    <option v-for="variant in field.variants" :key="variant">{{ variant }}</option>
                  </select>
                  <select v-else-if="field.field_type === 'range'" :id="field.field_name" v-model="field.text_answer">
                    <option disabled value="">Оберіть оцінку</option>
                    <option v-for="variant in field.variants" :key="variant" :value="variant">{{ variant }}</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div class="container-global-form-edit active_session_button">
          <button class="global-form-edit" type="submit">
            <img src="../../assets/icons/share.svg" alt="Send name form">
            <span class="edit-link">Редагувати кейс</span>
          </button>
        </div>
      </form>
    </div>
    <ModalEditCaseConfirm
        v-if="showModal"
        :showModal="showModal"
        :IDconsultation="IDconsultation"
        :clientId="clientId"
        :formData="formData"
        @close="showModal = false"
        @confirm="submitEditedSession"
    />
    <!-- видалити -->
    <ModalDeleteAnswer
        v-if="showDeleteModal"
        :showModal="showDeleteModal"
        :answerId="itemToDeleteId"
        :containerLabel="itemToDeleteLabel"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import ModalEditCaseConfirm from "@/components/modal/ModalEditCaseConfirm.vue";
import ModalDeleteAnswer from "@/components/modal/ModalDeleteAnswer.vue";
import Loader from "@/components/app/Loader.vue";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import M from "materialize-css";
import apiService from "@/services/apiService";

export default {
  name: "EditCaseDescription",
  components: { ModalEditCaseConfirm, ModalDeleteAnswer, Loader },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formData = ref({ fields: [] });
    const showModal = ref(false);
    const clientId = ref(route.params.id);
    const clientName = ref("");
    const IDconsultation = ref(null);
    const loading = ref(false);
    const version = ref("");

    // видалити
    const showDeleteModal = ref(false);
    const itemToDeleteId = ref(null);
    const itemToDeleteLabel = ref("");

    const openDeleteModal = (id, label) => {
      itemToDeleteId.value = id;
      itemToDeleteLabel.value = label;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      itemToDeleteId.value = null;
      itemToDeleteLabel.value = "";
    };

    const confirmDelete = async (id) => {
      const token = localStorage.getItem("token");
      try {
        const response = await apiService.deleteAnswer(token, id);
        if (response) {
          M.toast({ html: 'Поле успішно видалено' });
          formData.value.fields = formData.value.fields.filter(field => field.id !== id);
          closeDeleteModal();
        } else {
          M.toast({ html: 'Помилка видалення поля' });
        }
      } catch (error) {
        console.error("Error deleting answer:", error);
        M.toast({ html: 'Помилка видалення поля' });
      }
    };
    // видалити

    // Функція отримання даних сесії для редагування
    const fetchCaseData = async () => {
      const token = localStorage.getItem("token");
      const id = route.params.id; 
      
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }
      
      loading.value = true;
      try {
        // Get client data first
        const clientResponse = await apiService.getClientById(token, id);
        clientId.value = clientResponse.data.id;
        clientName.value = clientResponse.data.name;

        // Get case description data
        const response = await apiService.getCaseDescription(token, id);
        const data = response.data;
        
        IDconsultation.value = data.id;
        version.value = data.case_version;

        // Мапінг полів для редагування
        const items = data.custom_form.form_items;
        const answers = data.answers;
        
        const itemsMap = {};
        if (items && Array.isArray(items)) {
            items.forEach(i => itemsMap[i.id] = i);
        }

        formData.value.fields = answers.map(item => {
          const formItem = itemsMap[item.form_item_id] || {};
          let variants = formItem.variants || [];
          
          if (formItem.field_type === 'range' && typeof formItem.variants === 'string') {
              const parts = formItem.variants.split('-');
              if (parts.length === 2) {
                  const min = parseInt(parts[0]);
                  const max = parseInt(parts[1]);
                  if (!isNaN(min) && !isNaN(max)) {
                      variants = [];
                      for (let i = min; i <= max; i++) {
                          variants.push(i);
                      }
                  }
              }
          }

          return {
            id: item.id,
            field_name: formItem.field_name,
            text_answer: item.text_answer,
            field_type: formItem.field_type || "text",
            variants: variants,
            help_text: formItem.help_text,
            category: formItem.form_item_main_category_title || "Без категорії",
            sub_category: formItem.form_item_child_category_title || "default"
          };
        });
      } catch (error) {
        console.error("Error fetching case data:", error);
        M.toast({ html: "Помилка завантаження даних кейсу" });
      } finally {
        loading.value = false;
      }
    };

    const categorizedFields = computed(() => {
      return formData.value.fields.reduce((acc, field) => {
        const mainCat = field.category;
        const subCat = field.sub_category;
        
        if (!acc[mainCat]) {
          acc[mainCat] = {};
        }
        if (!acc[mainCat][subCat]) {
          acc[mainCat][subCat] = [];
        }
        acc[mainCat][subCat].push(field);
        return acc;
      }, {});
    });

    const openModal = () => {
      showModal.value = true;
    };

    const submitEditedSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }

      try {
        const answers = formData.value.fields.map(field => ({
          id: field.id,
          text_answer: field.text_answer
        }));

        const payload = {
          answerable_id: IDconsultation.value,
          answerable_type: "CaseDescription",
          answers_data: answers
        };

        await apiService.sendEditedConsultation(payload, token);
        showModal.value = false;
        M.toast({ html: "Кейс успішно оновлено" });
        router.push({ name: "ClientInformation", params: { id: clientId.value } });
      } catch (error) {
        console.error("Error updating case:", error);
        M.toast({ html: "Помилка оновлення кейсу" });
      }
    };

    onMounted(fetchCaseData);

    return {
      formData,
      clientId,
      clientName,
      IDconsultation,
      showModal,
      openModal,
      submitEditedSession,
      categorizedFields,
      loading,
      version,
      // видалити
      showDeleteModal,
      itemToDeleteId,
      itemToDeleteLabel,
      openDeleteModal,
      closeDeleteModal,
      confirmDelete
      // видалити
    };
  }
};
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; /* Or min-height if preferred */
}
</style>

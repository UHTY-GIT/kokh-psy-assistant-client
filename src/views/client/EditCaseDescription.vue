<!-- src/views/client/EditCaseDescription.vue -->
<template>
  <div>
    <div class="profile_tittle">
      <p>Опис кейсу, супервізант {{ clientName }}</p>
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

                  <div class="container-label">
                    <div class="type-for-view">
                      <label :for="field.field_name" style="margin-bottom: 0;">{{ field.field_name }}</label>

                      <div v-if="field.help_text" class="help-icon-wrapper">
                        <img src="@/assets/icons/circle_help.svg" alt="Info" class="help-icon">
                        <div class="help-tooltip">
                          {{ field.help_text }}
                        </div>
                      </div>
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
    <ModalSessionSuccess
        v-if="showModal"
        :showModal="showModal"
        :IDconsultation="IDconsultation"
        :clientId="clientId"
        :formData="formData"
        @close="showModal = false"
        @confirm="submitEditedSession"
    />
  </div>
</template>

<script>
import ModalSessionSuccess from "@/components/modal/ModalSessionSuccess.vue";
import Loader from "@/components/app/Loader.vue";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import M from "materialize-css";
import apiService from "@/services/apiService";

export default {
  name: "EditCaseDescription",
  components: { ModalSessionSuccess, Loader },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formData = ref({ fields: [] });
    const showModal = ref(false);
    const clientId = ref(route.params.id);
    const clientName = ref("");
    const IDconsultation = ref(null);
    const loading = ref(false);

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

        // Мапінг полів для редагування
        formData.value.fields = data.answers.map(item => {
          let variants = item.form_item.variants || [];
          
          if (item.form_item.field_type === 'range' && typeof item.form_item.variants === 'string') {
              const parts = item.form_item.variants.split('-');
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
            field_name: item.form_item.field_name,
            text_answer: item.text_answer,
            field_type: item.form_item.field_type || "text",
            variants: variants,
            help_text: item.form_item.help_text,
            category: item.form_item.form_item_main_category_title || "Без категорії",
            sub_category: item.form_item.form_item_child_category_title || "default"
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
      loading
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

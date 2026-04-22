<!-- src/views/session/EditOneSessionPage.vue -->
<template>
  <div>
    <div class="profile_tittle">
      <p>Сесія №{{ sessionNumber }}, клієнт {{ clientName }}</p>
      <p>{{ formattedDate }}</p>
    </div>
    <hr class="hr_profile">
    <div class="block_active_session">
      <form @submit.prevent="openModal">
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
<!--                    <div @click="openDeleteModal(field.id, field.field_name)" style="cursor: pointer; display: flex; align-items: center;">-->
<!--                      <svg width="24" height="24" viewBox="0 0 34 37" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path d="M23.3337 8.33317V6.99984C23.3337 5.133 23.3337 4.19957 22.9703 3.48654C22.6508 2.85933 22.1408 2.34939 21.5136 2.02982C20.8006 1.6665 19.8672 1.6665 18.0003 1.6665H15.3337C13.4668 1.6665 12.5334 1.6665 11.8204 2.02982C11.1932 2.34939 10.6832 2.85933 10.3636 3.48654C10.0003 4.19957 10.0003 5.133 10.0003 6.99984V8.33317M13.3337 17.4998V25.8332M20.0003 17.4998V25.8332M1.66699 8.33317H31.667M28.3337 8.33317V26.9998C28.3337 29.8001 28.3337 31.2002 27.7887 32.2698C27.3093 33.2106 26.5444 33.9755 25.6036 34.4549C24.5341 34.9998 23.1339 34.9998 20.3337 34.9998H13.0003C10.2001 34.9998 8.79993 34.9998 7.73037 34.4549C6.78956 33.9755 6.02466 33.2106 5.54529 32.2698C5.00033 31.2002 5.00033 29.8001 5.00033 26.9998V8.33317" stroke="#72A8BA" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--                      </svg>-->
<!--                    </div>-->
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
            <span class="edit-link">Редагувати сесію</span>
          </button>
        </div>
      </form>
    </div>

    <!-- видалити -->
    <ModalDeleteAnswer
        v-if="showDeleteModal"
        :showModal="showDeleteModal"
        :answerId="itemToDeleteId"
        :containerLabel="itemToDeleteLabel"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
    />
    <!-- видалити -->
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
import ModalDeleteAnswer from "@/components/modal/ModalDeleteAnswer.vue";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import M from "materialize-css";
import apiService from "@/services/apiService";

export default {
  name: "EditOneSession",
  components: { ModalSessionSuccess, ModalDeleteAnswer },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formData = ref({ fields: [] });
    const showModal = ref(false);
    const clientId = ref(null);
    const clientName = ref("");
    const IDconsultation = ref(null);
    const sessionNumber = ref(null);
    const dateConsultation = ref(null);

    // видалити
    // const showDeleteModal = ref(false);
    // const itemToDeleteId = ref(null);
    // const itemToDeleteLabel = ref("");
    //
    // const openDeleteModal = (id, label) => {
    //   itemToDeleteId.value = id;
    //   itemToDeleteLabel.value = label;
    //   showDeleteModal.value = true;
    // };
    //
    // const closeDeleteModal = () => {
    //   showDeleteModal.value = false;
    //   itemToDeleteId.value = null;
    //   itemToDeleteLabel.value = "";
    // };
    //
    // const confirmDelete = async (id) => {
    //   const token = localStorage.getItem("token");
    //   try {
    //     const response = await apiService.deleteAnswer(token, id);
    //     if (response) {
    //       M.toast({ html: 'Поле успішно видалено' });
    //       formData.value.fields = formData.value.fields.filter(field => field.id !== id);
    //       closeDeleteModal();
    //     } else {
    //       M.toast({ html: 'Помилка видалення поля' });
    //     }
    //   } catch (error) {
    //     console.error("Error deleting answer:", error);
    //     M.toast({ html: 'Помилка видалення поля' });
    //   }
    // };
    // видалити

    // Функція отримання даних сесії для редагування
    const fetchSessionData = async () => {
      const token = localStorage.getItem("token");
      const consultationId = route.params.id;
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }
      try {
        const response = await apiService.getOneConsultation(token, consultationId);
        const data = response.data;

        // Заповнення отриманими даними
        IDconsultation.value = data.id;
        clientId.value = data.client.id;
        clientName.value = data.client.first_name;
        sessionNumber.value = data.number;
        dateConsultation.value = data.consultation_date;

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
        console.error("Error fetching session data:", error);
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

    const formattedDate = computed(() => {
      const date = new Date(dateConsultation.value);
      return date.toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
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
          answerable_type: "Consultation",
          answers_data: answers
        };

        await apiService.sendEditedConsultation(payload, token);
        showModal.value = false;
        M.toast({ html: "Сесію успішно оновлено" });
        router.push({ name: "mySession" });
      } catch (error) {
        console.error("Error updating session:", error);
        M.toast({ html: "Помилка оновлення сесії" });
      }
    };

    onMounted(fetchSessionData);

    return {
      formData,
      clientId,
      clientName,
      sessionNumber,
      IDconsultation,
      showModal,
      openModal,
      submitEditedSession,
      categorizedFields,
      formattedDate,
      // видалити
      // showDeleteModal,
      // itemToDeleteId,
      // itemToDeleteLabel,
      // openDeleteModal,
      // closeDeleteModal,
      // confirmDelete
      // видалити
    };
  }
};
</script>


<!-- src/views/session/ActiveSessionPage.vue -->
<template>
  <div>
    <div class="profile_tittle">
      <p>
        Сесія №{{ sessionNumber }}, клієнт {{ clientName }}
      </p>
      <p>
        {{ formattedDate }}
      </p>
    </div>
    <hr class="hr_profile">
  </div>
  <div class="block_active_session">
    <form @submit.prevent="openModal">
      <div v-for="(subGroups, category) in categorizedFields" :key="category">
        <div class="titte_field">
          <p>{{ category }}</p>
        </div>
        
        <div v-for="(fields, subCategory) in subGroups" :key="subCategory">
          <div v-if="subCategory !== 'default'" class="sub-category-title">
             <p>{{ subCategory }}</p>
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
                      v-model="field.value"
                      :placeholder="'Введіть ' + field.field_name"
                  >
                </textarea>
                <input
                    v-else-if="field.field_type === 'string'"
                    type="text"
                    :id="field.field_name"
                    v-model="field.value"
                    :placeholder="'Введіть ' + field.field_name"
                >
                <select v-else-if="field.field_type === 'select_v2'" :id="field.field_name" v-model="field.value">
                  <option disabled value="">Оберіть варіант</option>
                  <option v-for="variant in field.variants" :key="variant">{{ variant }}</option>
                </select>
                <select v-else-if="field.field_type === 'range'" :id="field.field_name" v-model="field.value">
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
          <span class="edit-link">Завершити сесію</span>
        </button>
      </div>
    </form>
  </div>
  <!--  Модальне вікно-->
  <ModalSessionSuccess
      v-if="showModal"
      :showModal="showModal"
      :IDconsultation="IDconsultation"
      :clientId="clientId"
      :formData="formData"
      @close="showModal = false"
      @confirm="submitForm"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from "@/services/apiService";
import ModalSessionSuccess from "@/components/modal/ModalSessionSuccess.vue";
import M from "materialize-css";

export default {
  components: {
    ModalSessionSuccess
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formData = ref({
      fields: []
    });

    const showModal = ref(false);
    const clientId = parseInt(route.query.clientId);
    const clientName = route.query.clientName;
    const clientTelegramId = route.query.TelegramId;
    const PartnerTelegramId = route.query.PartnerTelegramId || null;
    const customFormId = route.query.customFormId;
    const customFormTitle = route.query.customFormTitle;
    const sessionNumber = route.query.sessionNumber;
    const IDconsultation = parseInt(route.query.IDconsultation);
    const dateConsultation = route.query.dateConsultation;
    const clientsOriginType = route.query.clientsOriginType;

    const fetchFormData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: 'Будь ласка, увійдіть у систему' });
          router.push({ name: 'login' });
          return;
        }
        const response = await apiService.getCustomFormById(customFormId);
        formData.value.fields = response.data.data.form_items.map(item => {
          let variants = item.variants || [];
          
          if (item.field_type === 'range' && typeof item.variants === 'string') {
              const parts = item.variants.split('-');
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
            field_name: item.field_name,
            field_type: item.field_type,
            help_text: item.help_text,
            category: item.form_item_main_category_title || "Без категорії",
            sub_category: item.form_item_child_category_title || "default",
            variants: variants,
            value: ''
          };
        });
      } catch (error) {
        console.error('Error fetching form data:', error);
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

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', options);
    };

    const formattedDate = computed(() => {
      return dateConsultation ? formatDate(dateConsultation) : '';
    });

    const openModal = () => {
      showModal.value = true;
    };

    const submitForm = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        // Підготовка відповідей для відправки
        const answers = formData.value.fields.map(field => ({
          form_item_id: field.id,
          text_answer: field.value,
        }));

        const payload = {
          client_id: clientId,
          answerable_id: IDconsultation,
          answerable_type: "Consultation",
          answers_data: answers,
        };

        const response = await apiService.submitSessionAnswers(payload, token);
        if (response) {
          showModal.value = false;
          M.toast({html: 'Дані сесії успішно збережено'});

          // Відправка повідомлення в телеграм
          try {
            if (clientsOriginType === 'individual_supervision') {
               await apiService.sendSessionSupervisorEndNotification(clientTelegramId);
            } else {
               await apiService.sendSessionEndNotification(clientTelegramId);
            }

            if (PartnerTelegramId) {
               await apiService.sendSessionEndNotification(PartnerTelegramId);
            }


            M.toast({ html: 'Повідомлення у телеграм успішно надіслано' });
          } catch (telegramError) {
            console.error('Error sending Telegram notification:', telegramError);
            M.toast({ html: 'Помилка надсилання повідомлення у телеграм' });
          }

          router.push({ name: 'mySession' });
        }
      } catch (error) {
        M.toast({ html: 'Помилка надсилання даних сесії' });
        console.error('Error submitting form:', error);
      }
    };

    onMounted(fetchFormData);

    return {
      formData,
      clientId,
      clientName,
      clientTelegramId,
      PartnerTelegramId,
      customFormId,
      customFormTitle,
      sessionNumber,
      IDconsultation,
      showModal,
      openModal,
      submitForm,
      categorizedFields,
      formattedDate,
      clientsOriginType
    };
  }
}
</script>


<!-- src/views/session/ActiveSessionPage.vue -->
<template>
  <div>
    <PageHeader
        eyebrow="Сесія · заповнення"
        :number="sessionNumber"
        :title="clientName"
        :title-to="clientId ? { name: 'ClientInformation', params: { id: clientId } } : null"
        :date="dateConsultation"
    />
  </div>
  <div class="block_active_session">
    <form @submit.prevent="openModal">
      <!-- навігація розділами: липка панель з лічильником заповнених полів -->
      <FormSectionsNav :sections="sectionNav" />

      <div v-for="(subGroups, category, sectionIndex) in categorizedFields" :key="category" :id="`form-section-${sectionIndex}`" class="form-section">
        <div class="titte_field form-section__head">
          <span class="form-section__num">{{ String(sectionIndex + 1).padStart(2, '0') }}</span>
          <p>{{ category }}</p>
          <span v-if="sectionNav[sectionIndex]" class="form-section__progress" :class="{ 'is-done': sectionNav[sectionIndex].filled >= sectionNav[sectionIndex].total }">
            {{ sectionNav[sectionIndex].filled }} / {{ sectionNav[sectionIndex].total }}
          </span>
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

                      <HelpTip v-if="field.help_text" :text="field.help_text" />
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
                <BaseSelect v-else-if="field.field_type === 'select_v2'" :id="field.field_name" v-model="field.value">
                  <option disabled value="">Оберіть варіант</option>
                  <option v-for="variant in field.variants" :key="variant">{{ variant }}</option>
                </BaseSelect>
                <BaseSelect v-else-if="field.field_type === 'range'" :id="field.field_name" v-model="field.value">
                  <option disabled value="">Оберіть оцінку</option>
                  <option v-for="variant in field.variants" :key="variant" :value="variant">{{ variant }}</option>
                </BaseSelect>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="finish-session">
        <button class="finish-session__btn" type="submit">
          <span class="finish-session__icon"><IconFlagFinish /></span>
          <span class="finish-session__label">Завершити сесію</span>
        </button>
      </div>
    </form>
  </div>
  <!--  Модальне вікно-->
  <ModalSessionSuccess
      :showModal="showModal"
      :IDconsultation="IDconsultation"
      :clientId="clientId"
      :formData="formData"
      :filled="filledTotal.filled"
      :total="filledTotal.total"
      :busy="isSubmitting"
      @close="showModal = false"
      @confirm="submitForm"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from "@/services/apiService";
import FormSectionsNav from "@/components/ui/FormSectionsNav.vue";
import ModalSessionSuccess from "@/components/modal/ModalSessionSuccess.vue";
import IconFlagFinish from "@/components/icons/IconFlagFinish.vue";
import M from "materialize-css";

export default {
  components: { FormSectionsNav,
    ModalSessionSuccess,
    IconFlagFinish
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

    const isSubmitting = ref(false);

    const submitForm = async () => {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        await sendSession();
      } finally {
        isSubmitting.value = false;
      }
    };

    const sendSession = async () => {
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

    // розділи для навігації: скільки полів заповнено в кожному
    const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== '';
    const sectionNav = computed(() => Object.entries(categorizedFields.value).map(([title, subGroups], index) => {
      const sectionFields = Object.values(subGroups).flat();
      return { id: `form-section-${index}`, title, total: sectionFields.length, filled: sectionFields.filter((f) => isFilled(f.value)).length };
    }));

    // для вікна підтвердження: скільки полів заповнено загалом
    const filledTotal = computed(() => sectionNav.value.reduce((sum, section) => ({
      filled: sum.filled + section.filled,
      total: sum.total + section.total,
    }), { filled: 0, total: 0 }));

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
      sectionNav,
      filledTotal,
      isSubmitting,
      formattedDate,
      dateConsultation,
      clientsOriginType
    };
  }
}
</script>


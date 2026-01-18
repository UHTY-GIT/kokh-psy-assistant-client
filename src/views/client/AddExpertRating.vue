<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          {{ client.origin_type === 'individual_supervision' ? 'Feedback супервізора' : 'Оцінка експерта' }}, для клієнта {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
      <div class="Block_client">
        <form class="cycle_couple_form" @submit.prevent="submitExpertAssessment">
          <div class="titte_field">
            <p>
              {{ client.origin_type === 'individual_supervision' ? 'Додати feedback супервізора' : 'Додати оцінку експерта' }}
            </p>
          </div>
          <div class="block_input_field">
            <div class="forms-name-add active_session_fields">
              <div class="container-input">
                <div class="type-for-view">
                  <label for="expert-assessment">
                    {{ client.origin_type === 'individual_supervision' ? 'Feedback супервізора' : 'Оцінка експерта' }}
                  </label>
                </div>  
                <textarea
                    id="expert-assessment"
                    v-model="expertAssessmentContent"
                    :placeholder="client.origin_type === 'individual_supervision' ? 'Введіть feedback супервізора' : 'Введіть оцінку експерта'"
                ></textarea>            
              </div>
            </div>
          </div>
          <div class="container-global-form-edit active_session_button cycle_button_submit">
            <button class="global-form-edit" type="submit">
              <img src="../../assets/icons/share.svg" alt="Send name form">
              <span class="edit-link">
                {{ client.origin_type === 'individual_supervision' ? 'Надіслати feedback' : 'Надіслати оцінку' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import M from "materialize-css";
import apiService from "@/services/apiService";

export default {
  name: "AddExpertRating",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const expertAssessmentContent = ref("");

    const fetchClientData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }

      try {
        const clientResponse = await apiService.getClientById(token, clientId);
        client.value = clientResponse.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        M.toast({ html: "Помилка при завантаженні даних" });
      }
    };

    const submitExpertAssessment = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }

      try {
        await apiService.createExpertAssessment(token, clientId, expertAssessmentContent.value);
        M.toast({ html: "Оцінку експерта успішно надіслано" });
        router.push({ name: "ClientInformation", params: { id: clientId } });
      } catch (error) {
        console.error("Error submitting expert assessment:", error);
        M.toast({ html: "Помилка при надсиланні оцінки" });
      }
    };

    onMounted(fetchClientData);

    return {
      client,
      expertAssessmentContent,
      submitExpertAssessment,
    };
  },
};
</script>

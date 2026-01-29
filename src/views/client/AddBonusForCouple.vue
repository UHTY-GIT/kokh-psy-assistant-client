<!-- src/views/client/AddBonusForPair.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Бонус для пари при супервізійній сесії, для клієнта {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
      <div class="Block_client">
        <form class="cycle_couple_form" @submit.prevent="submitBonusForPair">
          <div class="titte_field">
            <p>
              Бонус для пари
            </p>
          </div>
          <div class="block_input_field">
            <div class="forms-name-add active_session_fields">
              <div class="container-input">
                <div class="type-for-view">
                  <label for="bonus-for-pair">Бонус для пари</label>
                </div>
                <textarea
                    id="bonus-for-pair"
                    v-model="bonusForPairContent"
                    placeholder="Введіть бонус для пари"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="container-global-form-edit active_session_button cycle_button_submit">
            <button class="global-form-edit" type="submit">
              <img src="../../assets/icons/share.svg" alt="Send name form">
              <span class="edit-link">Надіслати бонус</span>
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
  name: "AddBonusForCouple",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const bonusForPairContent = ref("");

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

        // Fetch existing bonus content
        try {
            const bonusResponse = await apiService.getBonusForCouple(token, clientId);
            
            const bonusData = bonusResponse.data || bonusResponse;
            
            if (bonusData && bonusData.text) {
                bonusForPairContent.value = bonusData.text.replace(/<br\s*\/?>/gi, '\n');
            }
        } catch (bonusError) {
             if (bonusError.response && bonusError.response.status !== 404) {
                 console.error("Error fetching bonus:", bonusError);
             }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        M.toast({ html: "Помилка при завантаженні даних" });
      }
    };

    const submitBonusForPair = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }

      try {
        // конвертуємо \n в <br> для API
        const formattedText = bonusForPairContent.value.replace(/\n/g, '<br>');

        await apiService.createOrUpdateBonusForCouple(token, clientId, formattedText);
        
        M.toast({ html: "Бонус успішно збережено" });
        router.push({ name: "ClientInformation", params: { id: clientId } });
        
      } catch (error) {
        console.error("Error submitting bonus:", error);
        M.toast({ html: "Помилка при надсиланні" });
      }
    };

    onMounted(fetchClientData);

    return {
      client,
      bonusForPairContent,
      submitBonusForPair,
    };
  },
};
</script>

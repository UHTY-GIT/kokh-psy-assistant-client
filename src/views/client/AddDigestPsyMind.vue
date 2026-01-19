<!-- src/views/client/AddDigestPsyMind.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Дайджест психотерапевтичних думок сесії, для клієнта {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
      <div class="Block_client">
        <form class="cycle_couple_form" @submit.prevent="submitDigestPsyMind">
          <div class="titte_field">
            <p>
              Додати дайджест психотерапевтичних думок
            </p>
          </div>
          <div class="block_input_field">
            <div class="forms-name-add active_session_fields">
              <div class="container-input">
                <div class="type-for-view">
                  <label for="digest-psy-mind">Дайджест психотерапевтичних думок</label>
                </div>
                <textarea
                    id="digest-psy-mind"
                    v-model="digestPsyMindContent"
                    placeholder="Введіть дайджест психотерапевтичних думок"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="container-global-form-edit active_session_button cycle_button_submit">
            <button class="global-form-edit" type="submit">
              <img src="../../assets/icons/share.svg" alt="Send name form">
              <span class="edit-link">Надіслати дайджест</span>
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
  name: "AddDigestPsyMind",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const digestPsyMindContent = ref(""); // Змінна для збереження контенту дайджеста

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

    const submitDigestPsyMind = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        M.toast({ html: "Будь ласка, увійдіть у систему" });
        router.push({ name: "login" });
        return;
      }

      try {
        await apiService.createDigestPsyMind(token, clientId, digestPsyMindContent.value);
        M.toast({ html: "Дайджест успішно надіслано" });
        router.push({ name: "ClientInformation", params: { id: clientId } });
      } catch (error) {
        console.error("Error submitting digest:", error);
        M.toast({ html: "Помилка при надсиланні дайджеста" });
      }
    };

    onMounted(fetchClientData);

    return {
      client,
      digestPsyMindContent,
      submitDigestPsyMind,
    };
  },
};
</script>

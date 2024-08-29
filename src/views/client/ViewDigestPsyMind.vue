<!-- src/views/client/ViewDigestPsyMind.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Переглянути дайджест психотерапевтичних думок сесії, для клієнта {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
      <div class="block_active_session">
        <div v-if="digestPsyMinds.length === 0" class="data-null-error">
          <p>Даних про клієнта немає, спробуйте додати їх</p>
        </div>
        <div v-else>
          <div v-for="digest in digestPsyMinds" :key="digest.id" class="container-view-client-info">
            <div class="date-calendar-block">
              <p>
                <img src="../../assets/icons/calendar.svg" alt="date"> {{ formatDate(digest.created_at) }}
              </p>
            </div>
            <div class="content-view">
              <p>
                {{ digest.content }}
              </p>
            </div>
          </div>
        </div>
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
  name: "ViewDigestPsyMind",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const digestPsyMinds = ref([]);

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

        const assessmentsResponse = await apiService.getDigestPsyMind(token, clientId);
        digestPsyMinds.value = assessmentsResponse.data;

      } catch (error) {
        console.error("Error fetching data:", error);
        M.toast({ html: "Помилка при завантаженні даних" });
      }
    };

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString("uk-UA", options);
    };

    onMounted(fetchClientData);

    return {
      client,
      digestPsyMinds,
      formatDate,
    };
  },
};
</script>
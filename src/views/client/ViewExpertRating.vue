<!-- src/views/client/ViewExpertRating.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          {{ client.origin_type === 'individual_supervision' ? 'Переглянути feedback супервізора, для клієнта' : 'Переглянути оцінку експерта, для клієнта' }} {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
      <div class="block_active_session">
        <div v-if="expertAssessments.length === 0" class="data-null-error">
          <p>Даних про клієнта немає, спробуйте додати їх</p>
        </div>
        <div v-else>
          <div v-for="assessment in expertAssessments" :key="assessment.id" class="container-view-client-info">
            <div class="date-calendar-block">
              <p>
                <img src="../../assets/icons/calendar.svg" alt="date"> {{ formatDate(assessment.created_at) }}
              </p>
            </div>
            <div class="content-view">
              <p>
                {{ assessment.content }}
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
  name: "ViewExpertRating",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const expertAssessments = ref([]);

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

        const assessmentsResponse = await apiService.getExpertAssessments(token, clientId);
        expertAssessments.value = assessmentsResponse.data;

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
      expertAssessments,
      formatDate,
    };
  },
};
</script>

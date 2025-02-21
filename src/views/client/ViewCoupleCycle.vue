<!-- src/views/client/ViewCoupleCycle.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Цикл пари, клієнт {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
    </div>
    <div>
      <div class="block_active_session">
        <div v-if="!mainClientAnswers.length && !partnerClientAnswers.length" class="data-null-error">
          <p>
            Даних про клієнта немає, можливо цикл пари не заповнений
          </p>
        </div>
        <div v-else>
          <table class="questions-table">
            <thead>
            <tr>
              <th>Запитання</th>
              <th>{{ mainClientName }}</th>
              <th>{{ partnerClientName }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(question, index) in mainClientAnswers" :key="index">
              <td>{{ question.form_item_field_name }}</td>
              <td>{{ question.text_answer }}</td>
              <td>{{ partnerClientAnswers[index]?.text_answer || 'Немає відповіді' }}</td>
            </tr>
            </tbody>
          </table>
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
  name: "ViewCoupleCycle",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const mainClientAnswers = ref([]);
    const partnerClientAnswers = ref([]);
    const mainClientName = ref('');
    const partnerClientName = ref('');

    const fetchClientData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const clientResponse = await apiService.getClientById(token, clientId);
        client.value = clientResponse.data;

        const cycleResponse = await apiService.getCoupleCycleData(token, clientId);

        if (cycleResponse.data) {
          if (cycleResponse.data.main_client_couple_cycle) {
            mainClientAnswers.value = cycleResponse.data.main_client_couple_cycle.answers;
            mainClientName.value = client.value.name || "Клієнт";
          }

          if (cycleResponse.data.partner_client_couple_cycle) {
            partnerClientAnswers.value = cycleResponse.data.partner_client_couple_cycle.answers;
            partnerClientName.value = cycleResponse.data.partner_name || "Партнер клієнта";
          }
        } else {
          mainClientAnswers.value = [];
          partnerClientAnswers.value = [];
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        M.toast({ html: 'Помилка при завантаженні даних' });
      }
    };

    onMounted(fetchClientData);

    return {
      client,
      mainClientAnswers,
      partnerClientAnswers,
      mainClientName,
      partnerClientName
    };
  }
};
</script>

<!-- src/views/client/ViewInformationConsentClient.vue -->
<template>
  <div>
    <div>
      <div class="profile_tittle">
        <p>
          Інформована згода, клієнт {{ client.name }}
        </p>
      </div>
      <hr class="hr_profile">
    </div>
    <div>
      <div class="block_active_session">
        <div v-if="!fields.length" class="data-null-error">
          <p>
            Даних про клієнта немає, можливо він не заповнював форму
          </p>
        </div>
        <div v-else>
          <div v-for="field in fields" :key="field.form_item_field_name" class="template-container-for-view">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>{{ field.form_item_field_name }}</p>
              </div>
              <div class="type-of-answers">
                <p>
                  {{ field.text_answer }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: "ViewPrimaryPoll",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clientId = Number(route.params.id);
    const client = ref({});
    const fields = ref([]);

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

        const pollResponse = await apiService.getInformationConsentData(token, clientId);

        // Перевірка на null або порожні дані
        if (pollResponse.data && pollResponse.data.length > 0) {
          fields.value = pollResponse.data;
        } else {
          fields.value = []; // Якщо даних немає, залишаємо порожній масив
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        M.toast({ html: 'Помилка при завантаженні даних' });
      }
    };

    onMounted(fetchClientData);

    return {
      client,
      fields,
    };
  }
}
</script>
<!-- src/views/ClientInformationPage.vue -->
<template>
  <section>
    <div>
      <div class="profile_tittle">
        <p>
          Інформація про клієнта
        </p>
      </div>
      <hr class="hr_profile">
    </div>
    <div class="block_button_client_page">
      <button class="btn-add-client" @click="goToAddCoupleCycle">
        Додати цикл пари
      </button>
    </div>
    <div>
      <div class="Block_client">
        <div class="titte_field">
          <p>
            Загальна інформація
          </p>
        </div>
        <div class="container-info-output">
          <div class="block_info_client" v-if="client.name">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Ім'я клієнта</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.name }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.phone">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Номер телефону</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.phone }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.email">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Email</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.email }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.was_agreed !== null">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Інформована згода</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.was_agreed ? 'Прийняв' : 'Не прийняв' }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.primary_poll_complete !== null">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Первинне опитування</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.primary_poll_complete ? 'Пройшов' : 'Не пройшов' }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.origin_type">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Тип консультації</p>
              </div>
              <div class="type-of-answers">
                <p>{{ formatOriginType(client.origin_type) }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.service_type">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Тип послуги</p>
              </div>
              <div class="type-of-answers">
                <p>{{ formatServiceType(client.service_type) }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.timezone">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Часовий пояс</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.timezone }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.partner_id">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Партнер</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.partner_id }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: 'ClientInformation',
  setup() {
    const route = useRoute();
    const client = ref({});
    const clientId = route.params.id;
    const router = useRouter();

    const fetchClientInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const response = await apiService.getClientById(token, clientId);
        client.value = response.data;
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };

    const formatOriginType = (type) => {
      switch (type) {
        case 'individual':
          return 'Індивідуальний';
        case 'couple_сlassic':
          return 'Парний класничий';
        case 'couple_diagnostic':
          return 'Парний діагностичний';
        default:
          return type;
      }
    };

    const formatServiceType = (type) => {
      switch (type) {
        case 'long_term':
          return 'Довгостроковий курс сесій';
        case 'short_term':
          return 'Короткостроковий курс сесій';
        default:
          return type;
      }
    };

    const goToAddCoupleCycle = () => {
      router.push({ name: 'CoupleCycle', params: { id: clientId } });
    };

    onMounted(fetchClientInfo);

    return {
      client,
      formatOriginType,
      formatServiceType,
      goToAddCoupleCycle,
    };
  }
};
</script>
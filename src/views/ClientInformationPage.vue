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
      <div class="dropdown">
        <button class="btn-dropdown" @click="toggleDropdown">
          <img src="@/assets/icons/more.png" alt="Menu" />
        </button>
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button @click.prevent="goToAddCoupleCycle">Додати цикл пари</button>
          <button @click.prevent="goToViewCoupleCycle">Переглянути цикл пари</button>
          <button @click.prevent="goToAddDigest">Додати дайджест психотерапевтичних думок</button>
          <button @click.prevent="goToViewDigest">Переглянути дайджест психотерапевтичних думок</button>
          <button @click.prevent="goToAddExpertRating">Додати оцінку експерта</button>
          <button @click.prevent="goToViewExpertRating">Переглянути оцінку експерта</button>
        </div>
      </div>
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
                <p v-if="client.was_agreed" class="link-in-page">
                  <router-link :to="{ name: 'ViewInformationConsent', params: { id: clientId } }">
                    Прийняв
                    <img src="@/assets/icons/share.svg" alt="icon">
                  </router-link>
                </p>
                <p v-else>Не прийняв</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.primary_poll_complete !== null">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Первинне опитування</p>
              </div>
              <div class="type-of-answers">
                <p v-if="client.primary_poll_complete" class="link-in-page">
                  <router-link :to="{ name: 'ViewPrimaryPoll', params: { id: clientId } }">
                    Пройшов
                    <img src="@/assets/icons/share.svg" alt="icon">
                  </router-link>
                </p>
                <p v-else>Не пройшов</p>
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
                <p class="link-in-page">
                  <router-link :to="{ name: 'ClientInformation', params: { id: client.partner_id } }">
                    {{ client.partner_id }}
                    <img src="@/assets/icons/share.svg" alt="icon">
                  </router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: 'ClientInformation',
  setup() {
    const route = useRoute();
    const client = ref({});
    const clientId = ref(route.params.id)
    const router = useRouter();
    const isDropdownOpen = ref(false);

    const fetchClientInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        router.push({ name: 'login' });
        return;
      }

      try {
        const response = await apiService.getClientById(token, clientId.value);
        client.value = response.data;
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };

    // Спостерігач за зміною clientId
    watch(
        () => route.params.id,
        (newId) => {
          clientId.value = newId;
          fetchClientInfo();
        }
    );

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
      router.push({ name: 'CoupleCycle', params: { id: clientId.value } });
    };

    const goToViewCoupleCycle = () => {
      router.push({ name: 'ViewCoupleCycle', params: { id: clientId.value } });
    };

    const goToAddDigest = () => {
      router.push({ name: 'AddDigest', params: { id: clientId.value } });
    };

    const goToViewDigest = () => {
      router.push({ name: 'ViewDigest', params: { id: clientId.value } });
    };

    const goToAddExpertRating = () => {
      router.push({ name: 'AddExpertRating', params: { id: clientId.value } });
    };

    const goToViewExpertRating = () => {
      router.push({ name: 'ViewExpertRating', params: { id: clientId.value } });
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = (event) => {
      if (!event.target.closest('.dropdown')) {
        isDropdownOpen.value = false;
      }
    };

    // Додаємо слухача події для закриття випадаючого списку при кліку поза його межами
    onMounted(() => {
      document.addEventListener('click', closeDropdown);
    });

    // Видаляємо слухача події при знищенні компонента
    onBeforeUnmount(() => {
      document.removeEventListener('click', closeDropdown);
    });

    onMounted(fetchClientInfo);

    return {
      client,
      formatOriginType,
      formatServiceType,
      goToAddCoupleCycle,
      goToViewCoupleCycle,
      goToAddDigest,
      goToViewDigest,
      goToAddExpertRating,
      goToViewExpertRating,
      toggleDropdown,
      isDropdownOpen
    };
  }
};
</script>
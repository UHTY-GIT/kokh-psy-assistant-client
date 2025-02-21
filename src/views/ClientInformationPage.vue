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
          <!-- Кнопки для роботи з парними консультаціями -->
          <div v-if="client.origin_type !== 'individual'">
            <button @click.prevent="openAppointPartnerModal">Назначити партнера</button>
            <button @click.prevent="goToAddCoupleCycle">Додати цикл пари</button>
            <button @click.prevent="goToViewCoupleCycle">Переглянути цикл пари</button>
          </div>

          <!-- Кнопки, доступні для всіх клієнтів -->
          <div>
            <button @click.prevent="goToAddDigest">Додати дайджест психотерапевтичних думок</button>
            <button @click.prevent="goToViewDigest">Переглянути дайджест психотерапевтичних думок</button>
            <button @click.prevent="goToAddExpertRating">Додати оцінку експерта</button>
            <button @click.prevent="goToViewExpertRating">Переглянути оцінку експерта</button>
          </div>

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
                <p v-if="partnerName" class="link-in-page">
                  <router-link :to="{ name: 'ClientInformation', params: { id: client.partner_id } }">
                    {{ partnerName }}
                    <img src="@/assets/icons/share.svg" alt="icon">
                  </router-link>
                </p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.number_of_consultation">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Загальна к-ть консультацій</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.number_of_consultation }}</p>
              </div>
            </div>
          </div>
          <div class="block_info_client" v-if="client.remaining_consultation_count">
            <div class="text-template-for-view">
              <div class="type-for-view">
                <p>Залишок консультацій</p>
              </div>
              <div class="type-of-answers">
                <p>{{ client.remaining_consultation_count }}</p>
              </div>
            </div>
          </div>

          <!-- Причина звернення до психолога -->
          <div class="statistic-dropdown-container">
            <button class="dropdown-toggle" @click="toggleDropdown('primaryPoll')">
              <span class="dropdown-text">Причина звернення до психолога</span>
              <img
                  src="@/assets/icons/plus.png"
                  alt="Іконка"
                  class="dropdown-icon"
                  :class="{ rotated: isPrimaryPollOpen }"
              />
            </button>

            <transition name="slide-fade">
              <ul v-show="isPrimaryPollOpen" class="dropdown-menu-statistic">
                <li v-if="!primaryPollData || primaryPollData.length === 0">Даних для відображення немає</li>
                <li v-if="isPrimaryPollLoading">Завантаження...</li>
                <li v-for="(item, index) in primaryPollData" :key="'primary-' + index">
                  <img src="@/assets/icons/chat-bubble.png" alt="Icon" class="dropdown-item-icon" />
                  <p>{{ item }}</p>
                </li>
              </ul>
            </transition>
          </div>

          <!-- Патерн самозахисту -->
          <div class="statistic-dropdown-container">
            <button class="dropdown-toggle" @click="toggleDropdown('consultation')">
              <span class="dropdown-text">Патерн самозахисту</span>
              <img
                  src="@/assets/icons/plus.png"
                  alt="Іконка"
                  class="dropdown-icon"
                  :class="{ rotated: isConsultationOpen }"
              />
            </button>

            <transition name="slide-fade">
              <ul v-show="isConsultationOpen" class="dropdown-menu-statistic">
                <li v-if="!consultationData || consultationData.length === 0">Даних для відображення немає</li>
                <li v-if="isConsultationLoading">Завантаження...</li>
                <li v-for="(item, index) in consultationData" :key="'consult-' + index">
                  <img src="@/assets/icons/chat-bubble.png" alt="Icon" class="dropdown-item-icon" />
                  <p>{{ item }}</p>
                </li>
              </ul>
            </transition>
          </div>
        </div>

        <div class="titte_field">
          <p>
            Сесії клієнта
          </p>
        </div>
        <div class="container-all-session-client">
          <div
              v-for="consultation in consultations" :key="consultation.id" class="block_one_consultation"
          >
            <router-link :to="{ name: 'ViewOneSession', params: { id: consultation.id } }"
                         v-if="consultation && consultation.id">
              <div>
                <p>
                  <span>№{{ consultation.number }}</span>
                  <span>{{ truncateText(consultation.title, 18) }}</span>
                </p>
              </div>
              <div>
                <p class="date-consultation-client">
                  {{ formatDate(consultation.consultation_date) }}
                </p>
                <img src="@/assets/icons/share.svg" alt="View consultation client">
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
  <ModalAppointPartner
      v-if="showAppointPartnerModal"
      :showModal="showAppointPartnerModal"
      :clientId="client.id"
      @close="closeAppointPartnerModal"
  />
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';
import ModalAppointPartner from "@/components/modal/ModalAppointPartner.vue";

export default {
  name: 'ClientInformation',
  components: {
    ModalAppointPartner
  },
  setup() {
    const route = useRoute();
    const client = ref({});
    const clientId = ref(route.params.id)
    const router = useRouter();
    const isDropdownOpen = ref(false);
    const consultations = ref([]);
    const showAppointPartnerModal = ref(false);
    const partnerName = ref("");

    const primaryPollData = ref([]);
    const consultationData = ref([]);
    const isPrimaryPollOpen = ref(false);
    const isConsultationOpen = ref(false);
    const isCustomDropdown1Open = ref(false);
    const isCustomDropdown2Open = ref(false);


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

        // Обробка statistics
        if (response.data.statistics) {
          const { primary_poll = [], consultation = [] } = response.data.statistics;

          // Заповнюємо дані для Причини звернення
          primaryPollData.value = Array.isArray(primary_poll)
              ? primary_poll.map(item => item.trim()).filter(item => item !== '')
              : [];

          // Заповнюємо дані для Патерн самозахисту
          consultationData.value = Array.isArray(consultation)
              ? consultation.map(item => item.trim()).filter(item => item !== '')
              : [];
        }

        // Якщо у клієнта є partner_id, викликаємо функцію отримання імені партнера
        if (client.value.partner_id) {
          fetchPartnerName(client.value.partner_id);
        }
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };

    // Отримати ім'я партнера за його ID
    const fetchPartnerName = async (partnerId) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await apiService.getClientById(token, partnerId);
        partnerName.value = response.data.name;
      } catch (error) {
        console.error("Error fetching partner name:", error);
      }
    };

    // Функція для отримання всіх сесій клієнта
    const fetchClientConsultations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        M.toast({ html: 'Будь ласка, увійдіть у систему' });
        return;
      }

      try {
        const response = await apiService.getClientConsultations(token, clientId.value);
        consultations.value = response.data;
      } catch (error) {
        console.error('Error fetching consultations:', error);
        M.toast({ html: 'Помилка завантаження сесій' });
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

    const openAppointPartnerModal = () => {
      showAppointPartnerModal.value = true;
    };
    const closeAppointPartnerModal = () => {
      showAppointPartnerModal.value = false;
    };

    const goToAddCoupleCycle = () => {
      router.push({ name: 'CoupleCycle', params: { id: clientId.value } });
    };

    const goToViewCoupleCycle = () => {
      router.push({ name: 'ViewCoupleCycle', params: { id: clientId.value } });
    };

    const goToAddDigest = () => {
      router.push({ name: 'AddDigestPsyMind', params: { id: clientId.value } });
    };

    const goToViewDigest = () => {
      router.push({ name: 'ViewDigestPsyMind', params: { id: clientId.value } });
    };

    const goToAddExpertRating = () => {
      router.push({ name: 'AddExpertRating', params: { id: clientId.value } });
    };

    const goToViewExpertRating = () => {
      router.push({ name: 'ViewExpertRating', params: { id: clientId.value } });
    };

    // const toggleDropdown = () => {
    //   isDropdownOpen.value = !isDropdownOpen.value;
    // };

    const closeDropdown = (event) => {
      if (!event.target.closest('.dropdown')) {
        isDropdownOpen.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Додаємо слухача події для закриття випадаючого списку при кліку поза його межами
    onMounted(() => {
      fetchClientInfo();
      fetchClientConsultations();
      document.addEventListener('click', closeDropdown);
    });

    // Видаляємо слухача події при знищенні компонента
    onBeforeUnmount(() => {
      document.removeEventListener('click', closeDropdown);
    });

    // Додає крапки якшо багато символів у назві
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const toggleDropdown = (type) => {
      if (type === 'primaryPoll') {
        isPrimaryPollOpen.value = !isPrimaryPollOpen.value;
      } else if (type === 'consultation') {
        isConsultationOpen.value = !isConsultationOpen.value;
      } else if (type === 'customDropdown1') {
        isCustomDropdown1Open.value = !isCustomDropdown1Open.value;
      } else if (type === 'customDropdown2') {
        isCustomDropdown2Open.value = !isCustomDropdown2Open.value;
      }
      isDropdownOpen.value = !isDropdownOpen.value;
    };



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
      isDropdownOpen,
      consultations,
      formatDate,
      openAppointPartnerModal,
      closeAppointPartnerModal,
      showAppointPartnerModal,
      partnerName,
      truncateText,
      isPrimaryPollOpen,
      isConsultationOpen,
      isCustomDropdown1Open,
      isCustomDropdown2Open,
      fetchClientInfo,
      primaryPollData,
      consultationData
    };
  }
};
</script>
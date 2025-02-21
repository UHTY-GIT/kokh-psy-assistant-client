<!--src/views/statistic/ClientStatisticPage.vue-->
<template>
  <section class="statisctic-section">
    <div>
      <div class="profile_tittle title-archive">
        <p>Статистика клієнтів</p>
      </div>
      <hr class="hr_profile">
    </div>

    <div class="graphs">
      <LineChartComponent
          v-if="combinedChartData.length"
          :chartData="combinedChartData"
          chartTitle="Індивідуальні та Парні консультації"
      />
      <p v-else>Даних для відображення немає</p>
    </div>
<!--    <div class="graphs">-->
<!--      &lt;!&ndash; Індивідуальні консультації &ndash;&gt;-->
<!--      <div class="graphs-individual_therapy">-->
<!--        <LineChartComponent v-if="individualChartData.length" :chartData="individualChartData" chartTitle="Індивідуальні консультації" />-->
<!--        <p v-else>Даних для відображення немає</p>-->
<!--      </div>-->

<!--      &lt;!&ndash; Парні консультації &ndash;&gt;-->
<!--      <div class="graphs-couple_therapy">-->
<!--        <LineChartComponent v-if="coupleChartData.length" :chartData="coupleChartData" chartTitle="Парні консультації" />-->
<!--        <p v-else>Даних для відображення немає</p>-->
<!--      </div>-->
<!--    </div>-->

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
          <li v-if="primaryPollData.length === 0 && !isPrimaryPollLoading">
            Даних для відображення немає
          </li>
          <li v-if="isPrimaryPollLoading">Завантаження...</li>
          <li
              v-for="(item, index) in primaryPollData"
              :key="'primary-' + index"
          >
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
          <li v-if="consultationData.length === 0 && !isConsultationLoading">
            Даних для відображення немає
          </li>
          <li v-if="isConsultationLoading">Завантаження...</li>
          <li
              v-for="(item, index) in consultationData"
              :key="'consult-' + index"
          >
            <img src="@/assets/icons/chat-bubble.png" alt="Icon" class="dropdown-item-icon" />
            <p>{{ item }}</p>
          </li>
        </ul>
      </transition>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import M from 'materialize-css';
import apiService from '@/services/apiService';
import LineChartComponent from '@/components/graphic/LineChart.vue';
import {useRouter} from "vue-router";

export default {
  name: 'ClientStatisticPage',
  components: {
    LineChartComponent
  },
  setup() {
    const token = localStorage.getItem('token');

    // Стан для відкриття випадаючих списків
    const isPrimaryPollOpen = ref(false);
    const isConsultationOpen = ref(false);

    // Стан для завантаження
    const isPrimaryPollLoading = ref(false);
    const isConsultationLoading = ref(false);

    // Дані з API
    const primaryPollData = ref([]);
    const consultationData = ref([]);
    const combinedChartData = ref([]);

    const router = useRouter();

    // Виклик API для отримання даних для графіків
    const fetchClientPortrait = async () => {
      try {
        const token = localStorage.getItem('token'); // Отримання токена з локального сховища
        if (token) {
          try {
            const response = await apiService.getClientPortrait(token);

            if (response && response.data) {
              const { individual_therapy, couple_therapy } = response.data;

              combinedChartData.value = [
                {
                  label: 'Індивідуальні - Середній вік',
                  data: [individual_therapy.average_age],
                  backgroundColor: '#42a5f5'
                },
                {
                  label: 'Парні - Середній вік',
                  data: [couple_therapy.average_age],
                  backgroundColor: '#ffca28'
                },
                ...Object.entries(individual_therapy.gender_distribution).map(([key, value]) => ({
                  label: `Індивідуальні - ${key}`,
                  data: [value],
                  backgroundColor: '#64b5f6'
                })),
                ...Object.entries(couple_therapy.gender_distribution).map(([key, value]) => ({
                  label: `Парні - ${key}`,
                  data: [value],
                  backgroundColor: '#ffb74d'
                })),
                ...Object.entries(individual_therapy.family_status_distribution).map(([key, value]) => ({
                  label: `Індивідуальні - ${key}`,
                  data: [value],
                  backgroundColor: '#1976d2'
                })),
                ...Object.entries(couple_therapy.family_status_distribution).map(([key, value]) => ({
                  label: `Парні - ${key}`,
                  data: [value],
                  backgroundColor: '#f57c00'
                }))
              ];
            }
          } catch (error) {
            console.error('Error fetching client portrait:', error);
            M.toast({ html: 'Помилка завантаження даних для графіка' });
          }
        }
      }
      catch (error) {
        // console.error('Error fetching clients:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }

    };

    // Функція для виклику API через apiService
    const fetchData = async (type) => {
      try {
        if (type === 'primaryPoll') {
          isPrimaryPollLoading.value = true;
          const response = await apiService.getPrimaryPollStatistics(token);
          primaryPollData.value = response.data.length
              ? response.data.flatMap(item => item.split(','))
              : [];
        } else if (type === 'consultation') {
          isConsultationLoading.value = true;
          const response = await apiService.getConsultationStatistics(token);
          consultationData.value = response.data.length
              ? response.data.flatMap(item => item.split(','))
              : [];
        }
      } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        M.toast({ html: `Помилка завантаження даних (${type})` });
      } finally {
        if (type === 'primaryPoll') isPrimaryPollLoading.value = false;
        if (type === 'consultation') isConsultationLoading.value = false;
      }
    };

    // Функція для відкриття/закриття випадаючого списку та завантаження даних
    const toggleDropdown = (type) => {
      if (type === 'primaryPoll') {
        isPrimaryPollOpen.value = !isPrimaryPollOpen.value;
        if (isPrimaryPollOpen.value && primaryPollData.value.length === 0) {
          fetchData('primaryPoll');
        }
      } else if (type === 'consultation') {
        isConsultationOpen.value = !isConsultationOpen.value;
        if (isConsultationOpen.value && consultationData.value.length === 0) {
          fetchData('consultation');
        }
      }
    };

    // Завантаження графіків при монтуванні компонента
    onMounted(fetchClientPortrait);

    return {
      isPrimaryPollOpen,
      isConsultationOpen,
      primaryPollData,
      consultationData,
      isPrimaryPollLoading,
      isConsultationLoading,
      combinedChartData,
      toggleDropdown,
    };
  },
};
</script>



<!-- src/views/ClientInformationPage.vue -->
<template>
  <section>
    <div>
      <PageHeader eyebrow="Інформація про клієнта" :title="client.name || 'Клієнт'" />
    </div>
    <div class="block_button_client_page">
      <!-- дії з клієнтом: кнопка «Дії» з меню, розбитим на розділи -->
      <ActionMenu :groups="clientMenu" label="Дії" />
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
          <template v-if="client.origin_type !== 'individual_supervision'">
            <div class="block_info_client" v-if="client.was_agreed !== null">
              <div class="text-template-for-view">
                <div class="type-for-view">
                  <p>Інформована згода</p>
                </div>
                <div class="type-of-answers">
                  <p>{{ client.was_agreed ? 'Прийняв' : 'Не прийняв' }}</p>
                  <router-link v-if="client.was_agreed" class="view-field-link" :to="{ name: 'ViewInformationConsent', params: { id: clientId } }">
                    Відкрити <IconArrowUpRight class="view-field-link__icon" />
                  </router-link>
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
                  <router-link v-if="client.primary_poll_complete" class="view-field-link" :to="{ name: 'ViewPrimaryPoll', params: { id: clientId } }">
                    Відкрити <IconArrowUpRight class="view-field-link__icon" />
                  </router-link>
                </div>
              </div>
            </div>
          </template>
          <template v-if="client.origin_type === 'individual_supervision'">
            <!-- Опис кейсу для супервізійної сесії -->
            <div class="block_info_client"  v-if="client.case_description_can_be_shown !== null">
              <div class="text-template-for-view">
                <div class="type-for-view">
                  <p>Опис кейсу</p>
                </div>
                <div class="type-of-answers">
<!--                  <p v-if="client.case_description_can_be_shown" class="link-in-page">-->
<!--                    <router-link :to="{ name: 'ViewPrimaryPoll', params: { id: clientId } }">-->
<!--                      Пройшов-->
<!--                      <img src="@/assets/icons/share.svg" alt="icon">-->
<!--                    </router-link>-->
<!--                  </p>-->
                  <p v-if="client.case_description_can_be_shown" class="link-in-page">
                    Заповнив
                  </p>
                  <p v-else>Не заповнив</p>
                </div>
              </div>
            </div>
          </template>
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
          <template v-if="client.origin_type !== 'individual_supervision'">
            <div class="block_info_client" v-if="client.partner_id">
              <div class="text-template-for-view">
                <div class="type-for-view">
                  <p>Партнер</p>
                </div>
                <div class="type-of-answers">
                  <p v-if="partnerName">{{ partnerName }}</p>
                  <router-link v-if="partnerName" class="view-field-link" :to="{ name: 'ClientInformation', params: { id: client.partner_id } }">
                    Відкрити <IconArrowUpRight class="view-field-link__icon" />
                  </router-link>
                </div>
              </div>
            </div>
          </template>
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

        </div>

        <!-- Зведення з анкет і сесій — окремим розділом, щоб не змішувалися з полями -->
        <div class="titte_field">
          <p>Аналітика клієнта</p>
        </div>
        <div class="client-insights">
          <template v-if="client.origin_type !== 'individual_supervision'">
            <InsightAccordion
                title="Причина звернення до психолога"
                hint="З первинного опитування"
                icon="IconMessageQuestion"
                :count="primaryPollData.length"
            >
              <ul v-if="primaryPollData.length" class="insight-quotes">
                <li v-for="(item, index) in primaryPollData" :key="'primary-' + index" class="insight-quote">
                  <IconQuote class="insight-quote__mark" />
                  <p class="insight-quote__text" :class="{ 'is-clamped': isLongQuote(item) && !expandedQuotes['p' + index] }">{{ item }}</p>
                  <button v-if="isLongQuote(item)" type="button" class="insight-quote__more" @click="toggleQuote('p' + index)">
                    {{ expandedQuotes['p' + index] ? 'Згорнути' : 'Показати повністю' }}
                  </button>
                </li>
              </ul>
              <p v-else class="insight-empty">
                <IconMessageQuestion class="insight-empty__icon" />
                <span>{{ client.primary_poll_complete
                  ? 'У відповідях первинного опитування причину звернення не вказано.'
                  : 'Клієнт ще не пройшов первинне опитування — причина звернення з’явиться тут після нього.' }}</span>
              </p>
            </InsightAccordion>

            <InsightAccordion
                title="Патерн самозахисту"
                hint="Із записів сесій"
                icon="IconShield"
                :count="consultationData.length"
            >
              <ul v-if="consultationData.length" class="insight-quotes">
                <li v-for="(item, index) in consultationData" :key="'consult-' + index" class="insight-quote">
                  <IconQuote class="insight-quote__mark" />
                  <p class="insight-quote__text" :class="{ 'is-clamped': isLongQuote(item) && !expandedQuotes['c' + index] }">{{ item }}</p>
                  <button v-if="isLongQuote(item)" type="button" class="insight-quote__more" @click="toggleQuote('c' + index)">
                    {{ expandedQuotes['c' + index] ? 'Згорнути' : 'Показати повністю' }}
                  </button>
                </li>
              </ul>
              <p v-else class="insight-empty">
                <IconShield class="insight-empty__icon" />
                <span>Патерн самозахисту ще не зафіксовано в жодній сесії. Він з’явиться тут, щойно його запишуть у формі сесії.</span>
              </p>
            </InsightAccordion>
          </template>

          <!-- Карта навичок (EFCT Growth Index) — лише для супервізантів; дані вантажимо при першому відкритті -->
          <InsightAccordion
              v-else
              title="Карта навичок"
              hint="EFCT Growth Index · оцінки по сесіях"
              icon="IconTrendUp"
              :count="efctCount"
              :forms="['навичка', 'навички', 'навичок']"
              @open="fetchEfctSkills"
          >
            <div v-if="isEfctSkillsLoading" class="insight-loading" aria-label="Завантаження">
              <span></span><span></span><span></span>
            </div>
            <p v-else-if="!processedEfctTable || processedEfctTable.rows.length === 0" class="insight-empty">
              <IconTrendUp class="insight-empty__icon" />
              <span>Оцінок навичок ще немає. Вони з’являться після першої сесії з картою навичок.</span>
            </p>
            <div v-else class="table-responsive">
              <table class="efct-growth-index-table">
                <thead>
                  <tr>
                    <th>Навичка</th>
                    <th class="left-dashed-border" v-for="(header, index) in processedEfctTable.headers" :key="index">
                      {{ header }}
                    </th>
                    <th class="left-dashed-border">Прогрес</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIndex) in processedEfctTable.rows" :key="rIndex">
                    <td>{{ row.title }}</td>
                    <td class="left-dashed-border" v-for="(score, cIndex) in row.scores" :key="cIndex">
                      {{ score }}
                    </td>
                    <td class="left-dashed-border">
                      <span class="efct-trend" :class="`efct-trend--${row.trend}`" :title="trendLabel(row.trend)">
                        <component :is="row.trend === 'up' ? 'IconTrendUp' : row.trend === 'down' ? 'IconTrendDown' : 'IconTrendFlat'" />
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </InsightAccordion>
        </div>

        <div class="titte_field">
          <p>
            Сесії клієнта
          </p>
        </div>
        <div v-if="clientSessions.length" class="client-sessions">
          <button
              v-for="(consultation, index) in clientSessions"
              :key="consultation.id"
              type="button"
              class="client-session"
              :class="`client-session--${sessionState(consultation.status).key}`"
              :style="{ '--i': Math.min(index, 12) }"
              @click="handleSessionClick(consultation)"
          >
            <span class="client-session__num"><small>№</small><span class="client-session__n">{{ consultation.number }}</span></span>
            <span class="client-session__body">
              <span class="client-session__title">{{ consultation.title || 'Сесія' }}</span>
              <span class="client-session__meta">
                {{ formatDate(consultation.consultation_date) }}
                <span class="client-session__state">{{ sessionState(consultation.status).label }}</span>
              </span>
            </span>
            <span class="client-session__open" aria-hidden="true"><IconArrowUpRight /></span>
          </button>
        </div>
        <p v-else class="client-sessions__empty">Сесій поки немає</p>
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
import { ref, onMounted, watch, computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import M from 'materialize-css';
import ModalAppointPartner from "@/components/modal/ModalAppointPartner.vue";
import { IconArrowUpRight, IconPlus, IconEye, IconUserPlus, IconPencil, IconGift } from "@/components/icons";
import ActionMenu from "@/components/ui/ActionMenu.vue";
import InsightAccordion from "@/components/ui/InsightAccordion.vue";

export default {
  name: 'ClientInformation',
  components: {
    ModalAppointPartner,
    IconArrowUpRight,
    ActionMenu,
    InsightAccordion
  },
  setup() {
    const route = useRoute();
    const client = ref({});
    const clientId = ref(route.params.id)
    const router = useRouter();
    const consultations = ref([]);
    const showAppointPartnerModal = ref(false);
    const partnerName = ref("");

    const primaryPollData = ref([]);
    const consultationData = ref([]);
    // довгі відповіді в зведеннях показуємо скорочено, з кнопкою «Показати повністю»
    const expandedQuotes = ref({});
    const isLongQuote = (text) => String(text || '').length > 280 || String(text || '').split('\n').length > 5;
    const toggleQuote = (key) => {
      expandedQuotes.value = { ...expandedQuotes.value, [key]: !expandedQuotes.value[key] };
    };

    // EFCT Skills Table State
    const efctSkillsData = ref([]);
    const isEfctSkillsLoading = ref(false);
    const hasFetchedEfctSkills = ref(false);

    const processedEfctTable = computed(() => {
        if (!efctSkillsData.value || efctSkillsData.value.length === 0) return null;

        const consultations = efctSkillsData.value;
        // Змінюємо заголовки на "Сесія 1", "Сесія 2" ...
        const headers = consultations.map((_, index) => `Сесія ${index + 1}`);
        
        let allSkillsMap = new Map();

        consultations.forEach(session => {
            session.efct_skill_items.forEach(skill => {
                if (!allSkillsMap.has(skill.title)) {
                    allSkillsMap.set(skill.title, []);
                }
            });
        });

        const rows = [];
        const lastIndex = consultations.length - 1;
        const prevIndex = consultations.length - 2;

        allSkillsMap.forEach((_, skillTitle) => {
            const row = {
                title: skillTitle,
                scores: [],
                trend: 'middle' // Default trend
            };

            let lastScore = null;
            let prevScore = null;

            consultations.forEach((session, index) => {
                const skillItem = session.efct_skill_items.find(s => s.title === skillTitle);
                const score = skillItem ? skillItem.score : '-';
                row.scores.push(score);

                if (index === lastIndex) lastScore = skillItem ? skillItem.score : 0;
                if (index === prevIndex) prevScore = skillItem ? skillItem.score : 0;
            });

            // Logic for trend
            if (consultations.length >= 2) {
                if (lastScore > prevScore) {
                    row.trend = 'up';
                } else if (lastScore < prevScore) {
                    row.trend = 'down';
                } else {
                    row.trend = 'middle';
                }
            } else {
                 // If less than 2 sessions, maybe no trend or default middle
                 row.trend = 'middle';
            }

            rows.push(row);
        });

        return {
            headers,
            rows
        };
    });

    // скільки навичок у карті; до першого відкриття — невідомо (лічильник не показуємо)
    const efctCount = computed(() => (hasFetchedEfctSkills.value
        ? (processedEfctTable.value ? processedEfctTable.value.rows.length : 0)
        : null));
    const trendLabel = (trend) => ({ up: 'Зростає', down: 'Знижується' }[trend] || 'Без змін');

    const fetchEfctSkills = async () => {
        if (hasFetchedEfctSkills.value) return;
        
        isEfctSkillsLoading.value = true;
        try {
            const token = localStorage.getItem('token');
            const response = await apiService.getEfctSkills(token, clientId.value);
            // API повертає { data: [...] }
            if (response && response.data) {
                efctSkillsData.value = response.data;
            }
            hasFetchedEfctSkills.value = true;
        } catch (error) {
            console.error("Error fetching EFCT skills:", error);
            M.toast({ html: 'Помилка завантаження EFCT навичок' });
        } finally {
            isEfctSkillsLoading.value = false;
        }
    };


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
        case 'couple_classic':
          return 'Парний класничий';
        case 'couple_diagnostic':
          return 'Парний діагностичний';
        case 'individual_supervision':
          return 'Супервізійний індивідуальний';
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

    const goToViewCaseDescription = () => {
      router.push({ name: 'ViewCaseDescription', params: { id: clientId.value } });
    };

    const goToEditCaseDescription = () => {
      router.push({ name: 'EditCaseDescription', params: { id: clientId.value } });
    };

    const goToAddBonusForCouple = () => {
      router.push({ name: 'AddBonusForCouple', params: { id: clientId.value } });
    };

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    onMounted(() => {
      fetchClientInfo();
      fetchClientConsultations();
    });

    // меню «Дії»: розділи залежать від типу клієнта (парний, індивідуальний, супервізант)
    const clientMenu = computed(() => {
      const type = client.value.origin_type;
      const isSupervision = type === 'individual_supervision';
      const groups = [];
      if (!isSupervision) {
        if (type !== 'individual') {
          groups.push({ title: 'Пара', items: [
            { label: 'Назначити партнера', icon: markRaw(IconUserPlus), onSelect: openAppointPartnerModal },
            { label: 'Додати цикл пари', icon: markRaw(IconPlus), onSelect: goToAddCoupleCycle },
            { label: 'Переглянути цикл пари', icon: markRaw(IconEye), onSelect: goToViewCoupleCycle },
          ] });
        }
        groups.push({ title: 'Дайджест думок', items: [
          { label: 'Додати дайджест психотерапевтичних думок', icon: markRaw(IconPlus), onSelect: goToAddDigest },
          { label: 'Переглянути дайджест психотерапевтичних думок', icon: markRaw(IconEye), onSelect: goToViewDigest },
        ] });
      }
      groups.push({ title: isSupervision ? 'Feedback супервізора' : 'Оцінка експерта', items: [
        { label: isSupervision ? 'Додати feedback супервізора' : 'Додати оцінку експерта', icon: markRaw(IconPlus), onSelect: goToAddExpertRating },
        { label: isSupervision ? 'Переглянути feedback супервізора' : 'Переглянути оцінку експерта', icon: markRaw(IconEye), onSelect: goToViewExpertRating },
      ] });
      if (isSupervision) {
        groups.push({ title: 'Супервізія', items: [
          { label: 'Відредагувати опис кейсу', icon: markRaw(IconPencil), onSelect: goToEditCaseDescription },
          { label: 'Переглянути опис кейсу', icon: markRaw(IconEye), onSelect: goToViewCaseDescription },
          { label: 'Бонус для пари', icon: markRaw(IconGift), onSelect: goToAddBonusForCouple },
        ] });
      }
      return groups;
    });

    // Додає крапки якшо багато символів у назві
    // сесії клієнта для списку (без порожніх записів) і зрозумілий стан кожної
    const clientSessions = computed(() => (Array.isArray(consultations.value) ? consultations.value : [])
        .filter((consultation) => consultation && consultation.id));

    const SESSION_STATES = {
      done: { key: 'done', label: 'проведена' },
      start_now: { key: 'live', label: 'триває' },
      waiting_for_start: { key: 'planned', label: 'запланована' },
    };
    const sessionState = (status) => SESSION_STATES[status] || SESSION_STATES.waiting_for_start;

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };


    const handleSessionClick = (consultation) => {
      if (consultation.status === 'done') {
        router.push({ name: 'ViewOneSession', params: { id: consultation.id } });
      } else {
        M.toast({ html: 'Цю консультацію не можна ще переглянути бо вона не проведена' });
      }
    };



    onMounted(fetchClientInfo);

    return {
      client,
      clientId,
      formatOriginType,
      formatServiceType,
      goToAddCoupleCycle,
      goToViewCoupleCycle,
      goToAddDigest,
      goToViewDigest,
      goToAddExpertRating,
      goToViewExpertRating,
      goToViewCaseDescription,
      goToEditCaseDescription,
      goToAddBonusForCouple,
      clientMenu,
      consultations,
      formatDate,
      openAppointPartnerModal,
      closeAppointPartnerModal,
      showAppointPartnerModal,
      partnerName,
      truncateText,
      clientSessions,
      sessionState,
      fetchClientInfo,
      primaryPollData,
      consultationData,
      isEfctSkillsLoading,
      processedEfctTable,
      efctCount,
      trendLabel,
      fetchEfctSkills,
      expandedQuotes,
      isLongQuote,
      toggleQuote,
      handleSessionClick
    };
  }
};
</script>
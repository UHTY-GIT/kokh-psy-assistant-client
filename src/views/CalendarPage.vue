<!-- src/views/CalendarPage.vue -->
<template>
  <div class="calendar-width" ref="calendarBox">
    <FullCalendar
        ref="calendarRef"
        class='demo-app-calendar'
        :options='calendarOptions'
    >
      <!--      <b>{{ arg.timeText }}</b>-->
      <!--      <i>{{ arg.event.title }}</i>-->
    </FullCalendar>
  </div>
  <!--  Модальні вікна для створення та видалення -->
  <ModalCalendar
      v-if="showCreateModal"
      :showModal="showCreateModal"
      :start="showStart"
      :end="showEnd"
      :allDay="showAllDay"
      @close="closeCreateModal"
  />
  <ModalDeleteCalendar
      v-if="showDeleteModal"
      :showModal="showDeleteModal"
      :nameSession="nameSession"
      :firstNameClient="firstNameClient"
      @close="closeDeleteModal"
      @confirm="deleteSession"
  />
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import ModalCalendar from "@/components/modal/ModalCalendar.vue";
import ModalDeleteCalendar from "@/components/modal/ModalDeleteCalendar.vue";
import apiService from "@/services/apiService";
import M from "materialize-css";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    FullCalendar,
    ModalCalendar,
    ModalDeleteCalendar
  },
  setup() {
    const showCreateModal = ref(false);
    const showDeleteModal = ref(false);
    const showStart = ref('');
    const showEnd = ref('');
    const showAllDay = ref(false);
    const nameSession = ref('');
    const firstNameClient = ref('');
    const eventId = ref(null);
    const events = ref([]);
    const router = useRouter();

    const calendarRef = ref(null);
    const calendarBox = ref(null);

    // ---------- Адаптивність ----------
    // десктоп (від 1024px) — як і був; планшет — висота під екран; телефон (до 767px) — «3 дні» замість тижня
    const COMPACT_QUERY = '(max-width: 1023px)';
    const PHONE_QUERY = '(max-width: 767px)';
    const media = (query) => window.matchMedia(query).matches;
    const DESKTOP_VIEWS = 'dayGridMonth,timeGridWeek,timeGridDay';
    const PHONE_VIEWS = 'dayGridMonth,timeGridThreeDay,timeGridDay';
    const isPhone = ref(media(PHONE_QUERY));
    const PHONE_DAY_TITLE = { day: 'numeric', month: 'long', weekday: 'short' };
    const PHONE_MONTH_TIME = { hour: '2-digit', minute: '2-digit', hour12: false };

    // висота на планшеті й телефоні: від календаря до низу екрана, мінус місце під «Острів»
    function compactHeight() {
      const box = calendarBox.value;
      const top = box ? box.getBoundingClientRect().top + window.scrollY : 200;
      const islandSpace = isPhone.value ? 100 : 120;
      return Math.max(isPhone.value ? 460 : 560, window.innerHeight - top - islandSpace);
    }

    // поточний режим; на десктопі налаштування календаря не чіпаємо взагалі — він лишається як був
    let layout = media(COMPACT_QUERY) ? (media(PHONE_QUERY) ? 'phone' : 'tablet') : 'desktop';

    function applyLayout(force = false) {
      const phone = media(PHONE_QUERY);
      const compact = media(COMPACT_QUERY);
      const next = compact ? (phone ? 'phone' : 'tablet') : 'desktop';
      const options = calendarOptions.value;
      const api = calendarRef.value && calendarRef.value.getApi();

      if (next !== layout || force) {
        const wasPhone = layout === 'phone';
        layout = next;
        isPhone.value = phone;
        options.headerToolbar = { ...options.headerToolbar, right: phone ? PHONE_VIEWS : DESKTOP_VIEWS };
        options.views = {
          ...options.views,
          timeGridDay: { titleFormat: phone ? PHONE_DAY_TITLE : undefined },
          dayGridMonth: { eventTimeFormat: phone ? PHONE_MONTH_TIME : undefined }
        };
        if (!compact) options.height = undefined;

        // тиждень на телефоні не влазить: перемикаємо на «3 дні» і назад, вибір «Місяць»/«День» не чіпаємо
        if (api && phone !== wasPhone) {
          const view = api.view.type;
          if (phone && view === 'timeGridWeek') api.changeView('timeGridThreeDay');
          if (!phone && view === 'timeGridThreeDay') api.changeView('timeGridWeek');
        }
      }

      if (compact) {
        const height = compactHeight();
        if (options.height !== height) options.height = height;
      }
    }

    let resizeFrame = null;
    function onResize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => applyLayout());
    }

    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: ukLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: isPhone.value ? PHONE_VIEWS : DESKTOP_VIEWS
      },
      initialView: isPhone.value ? 'timeGridThreeDay' : 'timeGridWeek',
      views: {
        // три дні — компроміс для телефона: стовпці достатньо широкі, щоб читати сесії
        timeGridThreeDay: {
          type: 'timeGrid',
          duration: { days: 3 },
          buttonText: '3 дні',
          titleFormat: { day: 'numeric', month: 'short' }
        },
        // на телефоні коротша назва, без року
        timeGridDay: {
          titleFormat: isPhone.value ? PHONE_DAY_TITLE : undefined
        },
        // у місяці на телефоні — крапка й час (назва в клітинку все одно не влазить)
        dayGridMonth: {
          eventTimeFormat: isPhone.value ? PHONE_MONTH_TIME : undefined
        }
      },
      // на дотик: створення сесії й перенесення — коротше утримання пальця
      selectLongPressDelay: 350,
      eventLongPressDelay: 350,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      events: events.value,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventDrop: handleEventDrop,  // Подія для обробки drag-and-drop
      eventsSet: handleEvents
    });

    async function fetchEvents() {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getEvents(token);
        events.value = response.data.map(event => ({
          id: event.id,
          consultation_id: event.consultation_id || null,
          title: `${event.name} - ${event.client.first_name}`,
          start: event.date,
          end: event.date,
          allDay: false
        }));
        calendarOptions.value.events = events.value;
      } catch (error) {
        console.error('Error fetching events:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({ name: 'login' });
      }
    }

    function formatDate(date) {
      const d = new Date(date);
      return d.toISOString(); // Форматуємо дату для API
    }

    function handleDateSelect(selectInfo) {
      showCreateModal.value = true;
      showStart.value = formatDate(selectInfo.startStr);
      showEnd.value = formatDate(selectInfo.endStr);
      showAllDay.value = selectInfo.allDay;
    }

    function handleEventClick(clickInfo) {
      showDeleteModal.value = true;
      nameSession.value = clickInfo.event.title.split(' - ')[0];
      firstNameClient.value = clickInfo.event.title.split(' - ')[1];
      eventId.value = clickInfo.event.id;
    }

    async function handleEventDrop(dropInfo) {
      const token = localStorage.getItem('token');
      const consultationId = dropInfo.event.extendedProps.consultation_id;

      if (!consultationId) {
        M.toast({ html: "До цієї події не прив’язана консультація" });
        return;
      }

      const updatedEvent = {
        id: consultationId,
        date: formatDate(dropInfo.event.start)
      };

      try {
        await apiService.updateConsultationCalendar(token, updatedEvent.id, updatedEvent);
        M.toast({ html: `Консультацію оновлено` });
        fetchEvents();
      } catch (error) {
        console.error("Помилка оновлення консультації:", error);
        M.toast({ html: "Не вдалося оновити консультацію" });
      }
    }

    async function deleteSession() {
      try {
        const token = localStorage.getItem('token');
        await apiService.deleteEvent(token, eventId.value);
        closeDeleteModal();
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        M.toast({ html: 'Помилка видалення події' });
      }
    }

    function handleEvents() {
      // This could be used to manage state about events
    }

    function closeCreateModal() {
      showCreateModal.value = false;
      fetchEvents();
    }

    function closeDeleteModal() {
      showDeleteModal.value = false;
      fetchEvents();
    }

    onMounted(async () => {
      fetchEvents();
      await nextTick();
      applyLayout();
      window.addEventListener('resize', onResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeFrame);
    });

    return {
      calendarRef,
      calendarBox,
      showCreateModal,
      showDeleteModal,
      showStart,
      showEnd,
      showAllDay,
      nameSession,
      firstNameClient,
      calendarOptions,
      closeCreateModal,
      closeDeleteModal,
      deleteSession
    };
  }
});
</script>

<style lang="scss">
// ---------- Календар на планшетах і телефонах (десктоп без змін) ----------
$ease-smooth: cubic-bezier(.22, 1, .36, 1);

// плавна поява при перемиканні Місяць / Тиждень / 3 дні / День
.demo-app-calendar .fc-view {
  animation: calendar-view-in .35s $ease-smooth;
}

@keyframes calendar-view-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 1023px) {
  .calendar-width {
    width: auto;
    margin: 0 24px;
  }

  // у вузьких стовпцях назва сесії в один рядок із «…», щоб не обрізалась посередині
  .demo-app-calendar .fc-timegrid-event .fc-event-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .demo-app-calendar .fc-toolbar-title {
    font-size: 24px;
  }
}

@media (max-width: 767px) {
  .calendar-width {
    margin: 0 12px;
  }

  // панель у два рядки: назва зверху на всю ширину, під нею навігація й види
  .demo-app-calendar .fc-header-toolbar {
    flex-wrap: wrap;
    row-gap: 14px;
    margin-bottom: 16px !important;
  }

  .demo-app-calendar .fc-toolbar-chunk:nth-child(2) {
    order: -1;
    flex-basis: 100%;
    text-align: center;
  }

  .demo-app-calendar .fc-toolbar-title {
    font-size: 21px;
  }

  .demo-app-calendar .fc-button {
    padding: 8px 10px;
    font-size: 14px;
  }

  .demo-app-calendar .fc-today-button {
    margin-left: 6px !important;
  }

  .demo-app-calendar .fc-col-header-cell-cushion {
    padding: 4px 2px;
    font-size: 13px;
  }

  .demo-app-calendar .fc-timegrid-axis-cushion,
  .demo-app-calendar .fc-timegrid-slot-label-cushion {
    font-size: 12px;
  }

  .demo-app-calendar .fc-event-main {
    font-size: 12px;
  }

  .demo-app-calendar .fc-daygrid-dot-event .fc-event-title {
    display: none;
  }

  .demo-app-calendar .fc-daygrid-dot-event .fc-event-time {
    margin-right: 0;
    font-size: 11px;
  }
}

@media (max-width: 380px) {
  .demo-app-calendar .fc-button {
    padding: 7px 8px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-app-calendar .fc-view {
    animation: none;
  }
}
</style>

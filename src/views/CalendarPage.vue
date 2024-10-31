<!-- src/views/CalendarPage.vue -->
<template>
  <div class="calendar-width">
    <FullCalendar
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
import { defineComponent, ref, onMounted } from 'vue';
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

    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: ukLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialView: 'timeGridWeek',
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

    onMounted(fetchEvents);

    return {
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

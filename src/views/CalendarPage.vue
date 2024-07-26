<!--src/views/CalendarPage.vue-->
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
  <!--  Модальне вікно-->
  <ModalCalendar
      v-if="showCreateModal"
      :showModal="showCreateModal"
      :start="showStart"
      :end="showEnd"
      :allDay="showAllDay"
      @close="closeCreateModal"
  />
  <!--  Модальне вікно для видалення -->
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
import {useRouter} from "vue-router";

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
      eventsSet: handleEvents
    });

    async function fetchEvents() {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getEvents(token);
        events.value = response.data.map(event => ({
          id: event.id,
          title: `${event.name} - ${event.client.first_name}`,
          start: event.date,
          end: event.date,
          allDay: false
        }));
        calendarOptions.value.events = events.value;
      } catch (error) {
        console.error('Error fetching events:', error);
        M.toast({ html: `Увійдіть у систему` });
        router.push({name: 'login'});
      }
    }

    function formatDate(date) {
      let d = new Date(date);
      let year = d.getFullYear();
      let month = (d.getMonth() + 1).toString().padStart(2, '0');
      let day = d.getDate().toString().padStart(2, '0');
      let hours = d.getHours().toString().padStart(2, '0');
      let minutes = d.getMinutes().toString().padStart(2, '0');
      let seconds = d.getSeconds().toString().padStart(2, '0');
      let milliseconds = d.getMilliseconds().toString().padStart(6, '0');
      let timezoneOffset = -d.getTimezoneOffset();
      let sign = timezoneOffset >= 0 ? '+' : '-';
      let offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
      let offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} ${sign}${offsetHours}${offsetMinutes}`;
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

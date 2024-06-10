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
      v-if="showModal"
      :showModal="showModal"
      :start="showStart"
      :end="showEnd"
      :allDay="showAllDay"
      @close="showModal = false"
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
import apiService from "@/services/apiService";
import M from "materialize-css";
import {useRouter} from "vue-router";

export default defineComponent({
  components: {
    FullCalendar,
    ModalCalendar
  },
  setup() {
    const showModal = ref(false);
    const showStart = ref('');
    const showEnd = ref('');
    const showAllDay = ref(false);
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
      showModal.value = true;
      showStart.value = formatDate(selectInfo.startStr);
      showEnd.value = formatDate(selectInfo.endStr);
      showAllDay.value = selectInfo.allDay;
    }

    function handleEventClick(clickInfo) {
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove();
      }
    }

    function handleEvents() {
      // This could be used to manage state about events
    }

    function closeModal() {
      showModal.value = false;
    }

    onMounted(fetchEvents);

    return {
      showModal,
      showStart,
      showEnd,
      showAllDay,
      calendarOptions,
      closeModal
    };
  }
});
</script>

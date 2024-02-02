<template>
  <div class="sidebar">
    <div class="upper-block">
      <div class="clock-block">
        <div class="flip-clock">
          <div class="flip-number" :key="time.hours">
            <span class="time">
              {{ time.hours }}
            </span>
          </div>
          <div class="flip-number" :key="time.minutes">
            <span class="time">
              {{ time.minutes }}
            </span>
            <span class="day-clock">
              {{ dayOfWeek }}
            </span>
          </div>
          <div class="line-clock"></div>
        </div>
      </div>
      <div class="block-navigation">
        <div class="title-navigation">
          <img class="menu-icon" src="@/assets/icons/House%20With%20Garden.svg" alt="icon Home">
          <span>Навігація</span>
        </div>
        <nav>
          <ul class="menu ul">
            <router-link
                v-for="link in links"
                :key="link.url"
                :to="link.url"

                active-class="active"
                custom
                v-slot="{ navigate, isActive }"
            >
              <li
                  class="menu-item"
                  :class="{ 'active': isActive }"
                  @click="navigate"
              >
                <img :src="link.icon" :alt="`${link.title} icon`">
                <span>{{ link.title }}</span>
              </li>
            </router-link>
          </ul>
        </nav>
      </div>
    </div>
    <div class="under-block">
      <div class="title-notification">
        <img class="menu-icon" src="@/assets/icons/Speech%20Balloon.svg" alt="icon Notification">
        <span>Примітка</span>
      </div>
      <div class="button-add-notf">
        <button class="btn">
          <img src="@/assets/icons/more.svg" alt="icon add">
          <span>Додати примітку</span>
        </button>
      </div>
      <div class="block-notification">
        <div class="notification-text">
          <img src="@/assets/icons/edit.svg" alt="icon edit">
          <span>Не забути перевірити нові оновлення в розділі "Календар"!</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import calendarIcon from '@/assets/icons/calendar.svg';
import mySessionIcon from '@/assets/icons/checklist.svg';
import clientsIcon from '@/assets/icons/users-avatar.svg';
import supportIcon from '@/assets/icons/handshake.svg';
import bankInformationIcon from '@/assets/icons/info.svg';
import { ref, computed, onMounted, onUnmounted } from 'vue';
export default {
  name: 'SideBar',
  data: () => ({
    links: [
      { title: 'Календар', url: '/', icon: calendarIcon },
      { title: 'Мої сесії', url: '/session', exact: true, icon: mySessionIcon },
      { title: 'Клієнти', url: '/clients', exact: true, icon: clientsIcon },
      { title: 'Підтримка', url: '/support', exact: true, icon: supportIcon },
      { title: 'Банк інфомації', url: '/bank-info', exact: true, icon: bankInformationIcon },
    ],
  }),
  props: {
    timezone: {
      type: String,
      default: 'Europe/Kiev'
    }
  },
  setup(props) {
    const currentTime = ref(new Date());

    const updateClock = () => {
      currentTime.value = new Date();
    };

    const time = computed(() => {
      const options = { timeZone: props.timezone, hour: '2-digit', minute: '2-digit' };
      const formatter = new Intl.DateTimeFormat('uk-UA', options);
      const parts = formatter.formatToParts(currentTime.value);
      const hours = parts.find(part => part.type === 'hour').value;
      const minutes = parts.find(part => part.type === 'minute').value;
      return { hours, minutes };
    });

    const dayOfWeek = computed(() => {
      const options = { weekday: 'long' };
      const formatter = new Intl.DateTimeFormat('uk-UA', options);
      return formatter.format(currentTime.value);
    });

    let intervalId;
    onMounted(() => {
      intervalId = setInterval(updateClock, 1000);
    });

    onUnmounted(() => {
      clearInterval(intervalId);
    });

    return { time, dayOfWeek };
  }
}
</script>
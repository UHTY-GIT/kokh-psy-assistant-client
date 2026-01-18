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
            <template v-for="link in links" :key="link.title">
              <!-- Якщо є children (підменю) -->
              <li v-if="link.children" class="menu-item-group">
                <div 
                  class="menu-item parent-item" 
                  :class="{ 'expanded': link.expanded, 'active': isClientRouteActive }"
                  @click="toggleExpand(link)"
                >
                  <div class="left-part">
                    <img :src="link.icon" :alt="`${link.title} icon`">
                    <span>{{ link.title }}</span>
                  </div>

                  <div class="chevron" :class="{ 'rotated': link.expanded }">
                    <img src="@/assets/icons/arrow-drop-menu.svg" alt="arrow chevron">
                  </div>
                </div>
                
                <transition-group name="staggered-slide" tag="ul" class="sub-menu"
                  :style="{ '--total-items': link.children.length }">
                  <li
                    v-for="(child, index) in (link.expanded ? link.children : [])"
                    :key="child.url"
                    class="menu-item sub-item"
                    :class="{ 'active': isChildActive(child.url) }"
                    @click="handleNavigate(child.url)"
                    :style="{ '--index': index, '--bg-color': child.color }"
                  >
                    <img :src="child.icon" :alt="`${child.title} icon`">
                    <span>{{ child.title }}</span>
                  </li>
                </transition-group>
              </li>

              <!-- Якщо звичайне посилання -->
              <router-link
                v-else
                :to="link.url"
                active-class="active"
                custom
                v-slot="{ navigate, isActive }"
              >
                <div
                    class="menu-item parent-item"
                    :class="{ 'active': isActive }"
                    @click="navigate"
                >
                  <li
                      class="menu-item"
                  >
                    <img :src="link.icon" :alt="`${link.title} icon`">
                    <span>{{ link.title }}</span>
                  </li>
                </div>
              </router-link>
            </template>
          </ul>
        </nav>
      </div>
    </div>
    <div class="under-block">
<!--      Нотатки психолога-->
      <NotesComponent />
    </div>
  </div>
</template>
<script>
import calendarIcon from '@/assets/icons/calendar.svg';
import mySessionIcon from '@/assets/icons/checklist.svg';
import clientsIcon from '@/assets/icons/users-avatar.svg';
import supportIcon from '@/assets/icons/handshake.svg';
import bankInformationIcon from '@/assets/icons/info.svg';
import userIcon from '@/assets/icons/Users-all-main.svg';
import superviseeIcon from '@/assets/icons/Users-all-supervisant.svg';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import NotesComponent from "@/components/notes/NotesComponent.vue";
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'SideBar',
  components: {
    NotesComponent
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const links = ref([
      { title: 'Календар', url: '/', icon: calendarIcon },
      { title: 'Мої сесії', url: '/session', exact: true, icon: mySessionIcon },
      {
        title: 'Клієнти',
        icon: clientsIcon,
        expanded: false,
        children: [
          { title: 'Мої клієнти', url: '/clients', exact: true, icon: userIcon, color: '#A58E74' },
          { title: 'Супервізанти', url: '/supervisees', exact: true, icon: superviseeIcon, color: '#E09F56' }
        ]
      },
      { title: 'Підтримка', url: '/support', exact: true, icon: supportIcon },
      { title: 'Банк інфомації', url: '/bank-info', exact: true, icon: bankInformationIcon },
    ]);

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

    // Check if the parent menu should be highlighted
    const isClientRouteActive = computed(() => {
      return route.path.includes('/clients') || route.path.includes('/supervisees');
    });

    // Check if a specific child link is active
    const isChildActive = (url) => {
      return route.path === url;
    };

    const toggleExpand = (link) => {
      link.expanded = !link.expanded;
    };

    // Programmatic navigation for sub-items
    const handleNavigate = (url) => {
      router.push(url);
    };

    // Auto-expand if active child
    onMounted(() => {
      if (isClientRouteActive.value) {
        const clientLink = links.value.find(l => l.title === 'Клієнти');
        if (clientLink) clientLink.expanded = true;
      }
      intervalId = setInterval(updateClock, 1000);
    });

    let intervalId;
    onUnmounted(() => {
      clearInterval(intervalId);
    });

    return { time, dayOfWeek, links, toggleExpand, isClientRouteActive, isChildActive, handleNavigate };
  },
  props: {
    timezone: {
      type: String,
      default: 'Europe/Kiev'
    }
  }
}
</script>

<style scoped>
.menu-item-group {
  display: flex;
  flex-direction: column;
}

.parent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  padding: 0 25px;
  border-radius: 0 10px 10px 0;
  width: 100%;
  margin: 0 0 10px;
  transition: .3s ease;
}
.parent-item:hover {
  background-color: rgb(56, 94, 108);
}
.parent-item:hover span {
  color: #fff;
}

.parent-item.active {
  background-color: #72A8BA !important;
}
.parent-item.active span {
  color: #fff;
}

.menu-item.expanded {
  background-color: rgb(56, 94, 108);
}
.menu-item.expanded .left-part span {
  color: #fff !important;
}
.menu-item.sub-item span {
  color: #fff;
}

.parent-item:hover img,
.parent-item.active img,
.parent-item.expanded img {
  filter: brightness(0) invert(1);
}

.left-part {
  display: flex;
  align-items: center;
}

/* CSS Chevron */
.chevron {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}
.chevron img {
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
}

.chevron.rotated {
  transform: rotate(-180deg);
}

.sub-menu {
  list-style: none;
  padding-left: 0;
  margin: 0;
  overflow: hidden;
}

/* Base style for sub-item */
.sub-item {
  margin-bottom: 10px;
  background-color: var(--bg-color) !important;
  padding: 0 25px;
}

/* Transitions */
.staggered-slide-enter-active {
  animation: slideInRight 0.4s ease forwards;
  animation-delay: calc(0.2s * var(--index));
  opacity: 0; /* Ensures it starts invisible until animation kicks in */
}

.staggered-slide-leave-active {
  animation: slideOutRight 0.4s ease forwards;
  animation-delay: calc(0.1s * (var(--total-items) - var(--index)));
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50px);
  }
}
</style>
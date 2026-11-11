<!--src/layouts/MainLayout.vue-->
<template>
  <div class="background_main" :class="{ 'is-compact': isCompact }">
    <NavbarLogin />
    <section class="main-section">
      <!-- десктоп (від 1024px) — сайдбар, як і був; планшети й телефони — «Острів» знизу -->
      <transition name="sidebar-swap">
        <SidebarLogin v-if="!isCompact" @toggle-size="toggleSize"/>
      </transition>
      <main class="site-content app-content" :class="{ full: isFull }">
        <!-- плавна зміна сторінок; ключ — шаблон маршруту, тож зміна лише параметрів не перемонтовує сторінку -->
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <div :key="route.matched.length ? route.matched[0].path : route.path" class="page-view">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>
    </section>
    <!-- «Острів» з'являється з власною анімацією (випливає знизу) -->
    <IslandNav v-if="isCompact" />
  </div>
</template>

<script>
import NavbarLogin from "@/components/app/NavBar.vue";
import SidebarLogin from "@/components/app/SideBar.vue";
import IslandNav from "@/components/app/IslandNav.vue";

// межа між десктопом і планшетом: менше 1024px — «Острів»
const COMPACT_QUERY = '(max-width: 1023px)';

export default {
  name: 'main-layout',
  components: {
    NavbarLogin, SidebarLogin, IslandNav
  },
  data: () => ({
    isFull: false,
    isSmall: false,
    isCompact: typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches
  }),
  mounted() {
    this.checkWindowSize();
    window.addEventListener('resize', this.checkWindowSize);
    this.compactQuery = window.matchMedia(COMPACT_QUERY);
    this.compactQuery.addEventListener('change', this.onCompactChange);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkWindowSize);
    this.compactQuery.removeEventListener('change', this.onCompactChange);
  },
  methods: {
    checkWindowSize() {
      // Update isSmall based on window width
      this.isSmall = window.innerWidth < 750;
      // Whenever we check the window size, adjust the isFull property too
      this.isFull = this.isSmall;
    },
    toggleSize(isSmall) {
      this.isFull = isSmall;
    },
    onCompactChange(event) {
      this.isCompact = event.matches;
    },

    // toggleSize() {
    //   this.isFull = !this.isFull;
    // }
  }
}
</script>

<style scoped>
.page-enter-active {
  transition: opacity .28s ease, transform .4s cubic-bezier(.22, 1, .36, 1);
}

.page-leave-active {
  transition: opacity .16s ease, transform .16s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* перехід між сайдбаром і «Островом», коли змінюється ширина вікна */
.sidebar-swap-enter-active,
.sidebar-swap-leave-active {
  transition: opacity .3s ease, transform .4s cubic-bezier(.22, 1, .36, 1);
}

.sidebar-swap-enter-from,
.sidebar-swap-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.sidebar-swap-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .sidebar-swap-enter-active,
  .sidebar-swap-leave-active {
    transition: none;
  }
}
</style>

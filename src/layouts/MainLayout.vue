<!--src/layouts/MainLayout.vue-->
<template>
  <div class="background_main">
    <NavbarLogin />
    <section class="main-section">
      <SidebarLogin @toggle-size="toggleSize"/>
      <main class="site-content app-content" :class="{ full: isFull }">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script>
import NavbarLogin from "@/components/app/NavBar.vue";
import SidebarLogin from "@/components/app/SideBar.vue";

export default {
  name: 'main-layout',
  components: {
    NavbarLogin, SidebarLogin
  },
  data: () => ({
    isFull: false,
    isSmall: false
  }),
  mounted() {
    this.checkWindowSize();
    window.addEventListener('resize', this.checkWindowSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkWindowSize);
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

    // toggleSize() {
    //   this.isFull = !this.isFull;
    // }
  }
}
</script>